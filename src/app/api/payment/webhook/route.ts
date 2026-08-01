import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { orders, payments, orderItems, addresses, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  sendPaymentConfirmationEmail,
  sendAdminOrderNotificationEmail,
  sendAdminWhatsAppNotification,
} from "@/lib/utils/email";

// Wompi sends nested property paths like "transaction.id".
// This helper resolves them against the event data object.
function resolveProperty(obj: Record<string, unknown>, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
  return value?.toString() ?? "";
}

type WompiEvent = {
  event: string;
  timestamp: number;
  data: {
    transaction: {
      id: string;
      reference: string;
      status: string;
      amount_in_cents: number;
      currency: string;
    };
  };
  signature: {
    properties: string[];
    checksum: string;
  };
};

async function getOrderDetailsForEmail(orderId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      totalAmount: orders.totalAmount,
      shippingAddressId: orders.shippingAddressId,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select({
      productName: products.name,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const shippingAddress = order.shippingAddressId
    ? await db
        .select({ line1: addresses.line1, city: addresses.city })
        .from(addresses)
        .where(eq(addresses.id, order.shippingAddressId))
        .limit(1)
    : null;

  return {
    orderId: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    totalAmount: Number(order.totalAmount),
    items: items.map((i) => ({
      productName: i.productName,
      quantity: i.quantity,
      priceAtPurchase: Number(i.priceAtPurchase),
    })),
    shippingAddress: shippingAddress?.[0] ?? null,
  };
}

export async function POST(request: NextRequest) {
  const payload: WompiEvent = await request.json();

  const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
  if (!eventsSecret) {
    console.error("Missing WOMPI_EVENTS_SECRET env var");
    return NextResponse.json(
      { error: "Webhook no configurado" },
      { status: 500 },
    );
  }

  // Verify webhook signature:
  // SHA256(property_values_concatenated + timestamp + events_secret)
  const { signature, timestamp, data, event } = payload;
  if (signature?.properties && timestamp !== undefined) {
    const concatenated = signature.properties
      .map((prop) =>
        resolveProperty(data as unknown as Record<string, unknown>, prop),
      )
      .join("");
    const expectedChecksum = createHash("sha256")
      .update(`${concatenated}${timestamp}${eventsSecret}`)
      .digest("hex");

    if (expectedChecksum !== signature.checksum) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
    }
  }

  // Only handle payment updates
  if (event !== "transaction.updated") {
    return NextResponse.json({ ok: true });
  }

  const transaction = data?.transaction;
  if (!transaction?.reference) {
    return NextResponse.json(
      { error: "Datos de transacción inválidos" },
      { status: 400 },
    );
  }

  const {
    id: transactionId,
    reference: orderId,
    status: transactionStatus,
  } = transaction;

  // Idempotency: if we already processed this transaction, skip
  const [existingPayment] = await db
    .select()
    .from(payments)
    .where(eq(payments.transactionId, transactionId))
    .limit(1);

  if (existingPayment) {
    return NextResponse.json({ ok: true });
  }

  // Verify the order exists
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return NextResponse.json(
      { error: "Pedido no encontrado" },
      { status: 404 },
    );
  }

  if (transactionStatus === "APPROVED") {
    // Mark the order as paid
    await db
      .update(orders)
      .set({ status: "paid" })
      .where(eq(orders.id, orderId));

    const [pendingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (pendingPayment) {
      await db
        .update(payments)
        .set({ status: "completed", transactionId, paidAt: new Date() })
        .where(eq(payments.id, pendingPayment.id));
    } else {
      await db.insert(payments).values({
        orderId,
        method: "wompi",
        status: "completed",
        transactionId,
        paidAt: new Date(),
      });
    }

    // Send notifications (fire-and-forget, don't fail the webhook response)
    const orderData = await getOrderDetailsForEmail(orderId);
    if (orderData) {
      Promise.allSettled([
        sendPaymentConfirmationEmail(orderData),
        sendAdminOrderNotificationEmail(orderData),
        sendAdminWhatsAppNotification(orderData),
      ]).catch(console.error);
    }
  } else if (["DECLINED", "VOIDED", "ERROR"].includes(transactionStatus)) {
    // Record the failure — order stays "pending" for admin review
    const [pendingPayment] = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1);

    if (pendingPayment) {
      await db
        .update(payments)
        .set({ status: "failed", transactionId })
        .where(eq(payments.id, pendingPayment.id));
    } else {
      await db.insert(payments).values({
        orderId,
        method: "wompi",
        status: "failed",
        transactionId,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
