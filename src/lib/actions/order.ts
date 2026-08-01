"use server";

import { db } from "@/lib/db";
import { orders, orderItems, addresses, carts, cartItems, products } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "../auth/actions";

type CreateOrderItem = {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
};

type CustomerInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
};

export async function createOrder({
  items,
  customerInfo,
  paymentMethod,
}: {
  items: CreateOrderItem[];
  customerInfo: CustomerInfo;
  paymentMethod: "whatsapp" | "wompi";
}) {
  const user = await getCurrentUser();  
  if (!user) {
    return { success: false, error: "Debes iniciar sesión" };
  }

  if (items.length === 0) {
    return { success: false, error: "El pedido está vacío" };
  }

  try {
    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + item.priceAtPurchase * item.quantity,
      0
    );

    // Create or get address
    let addressId: string | null = null;
    if (customerInfo.address && customerInfo.city) {
      const existingAddress = await db
        .select()
        .from(addresses)
        .where(
          and(
            eq(addresses.userId, user.id),
            eq(addresses.line1, customerInfo.address),
            eq(addresses.city, customerInfo.city)
          )
        )
        .limit(1);

      if (existingAddress.length) {
        addressId = existingAddress[0].id;
      } else {
        const newAddress = await db
          .insert(addresses)
          .values({
            userId: user.id,
            type: "shipping",
            line1: customerInfo.address,
            line2: customerInfo.notes?.trim() || null,
            city: customerInfo.city,
            state: customerInfo.city,
            country: "Colombia",
            postalCode: "000000",
            isDefault: false,
          })
          .returning();
        addressId = newAddress[0].id;
      }
    }

    // Create order (with customer snapshot from checkout)
    const newOrder = await db
      .insert(orders)
      .values({
        userId: user.id,
        status: "pending",
        totalAmount: totalAmount.toFixed(2),
        shippingAddressId: addressId,
        billingAddressId: addressId,
        customerName: customerInfo.name.trim() || null,
        customerEmail: customerInfo.email.trim() || null,
        customerPhone: customerInfo.phone.trim() || null,
        customerNotes: customerInfo.notes?.trim() || null,
        paymentMethod,
      })
      .returning();

    const order = newOrder[0];

    // Create order items
    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase.toFixed(2),
      }))
    );

    // Clear cart
    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, user.id))
      .orderBy(desc(carts.createdAt))
      .limit(1);

    if (userCart.length) {
      await db.delete(cartItems).where(eq(cartItems.cartId, userCart[0].id));
    }

    revalidatePath("/cart");
    revalidatePath("/checkout");

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Error al crear el pedido" };
  }
}

export async function getMyOrders(userId: string) {
  const ordersList = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
      paymentMethod: sql<string | null>`COALESCE(${orders.paymentMethod}, (
        SELECT method::text FROM payments
        WHERE order_id = orders.id
        LIMIT 1
      ))`,
      paymentStatus: sql<string | null>`(
        SELECT status::text FROM payments
        WHERE order_id = orders.id
        ORDER BY CASE status::text WHEN 'completed' THEN 1 WHEN 'failed' THEN 2 ELSE 3 END
        LIMIT 1
      )`,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  return ordersList.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: Number(o.totalAmount),
    createdAt: o.createdAt,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
  }));
}

export async function getMyOrderById(orderId: string, userId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      totalAmount: sql<number>`${orders.totalAmount}::numeric`,
      shippingAddressId: orders.shippingAddressId,
      billingAddressId: orders.billingAddressId,
      createdAt: orders.createdAt,
      customerName: orders.customerName,
      customerEmail: orders.customerEmail,
      customerPhone: orders.customerPhone,
      customerNotes: orders.customerNotes,
      paymentMethod: sql<string | null>`COALESCE(${orders.paymentMethod}, (
        SELECT method::text FROM payments
        WHERE order_id = orders.id
        LIMIT 1
      ))`,
      paymentStatus: sql<string | null>`(
        SELECT status::text FROM payments
        WHERE order_id = orders.id
        ORDER BY CASE status::text WHEN 'completed' THEN 1 WHEN 'failed' THEN 2 ELSE 3 END
        LIMIT 1
      )`,
    })
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.userId !== userId) {
    return null;
  }

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      priceAtPurchase: sql<number>`${orderItems.priceAtPurchase}::numeric`,
      productName: products.name,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const shippingAddress = order.shippingAddressId
    ? await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, order.shippingAddressId))
        .limit(1)
    : null;

  const billingAddress = order.billingAddressId
    ? await db
        .select()
        .from(addresses)
        .where(eq(addresses.id, order.billingAddressId))
        .limit(1)
    : null;

  return {
    ...order,
    items,
    shippingAddress: shippingAddress?.[0] ?? null,
    billingAddress: billingAddress?.[0] ?? null,
  };
}

