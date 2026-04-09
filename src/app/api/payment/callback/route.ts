import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function upsertTransactionId(orderId: string, transactionId: string) {
  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  if (existing) {
    if (!existing.transactionId) {
      await db
        .update(payments)
        .set({ transactionId })
        .where(eq(payments.id, existing.id));
    }
  } else {
    await db.insert(payments).values({
      orderId,
      method: "wompi",
      status: "initiated",
      transactionId,
    });
  }
}

async function syncStatusFromWompi(orderId: string, transactionId: string) {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) return;

  const baseWompiUrl = privateKey.startsWith("prv_test_")
    ? "https://sandbox.wompi.co/v1"
    : "https://production.wompi.co/v1";

  const res = await fetch(`${baseWompiUrl}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${privateKey}` },
    cache: "no-store",
  });

  if (!res.ok) return;

  const { data: transaction } = await res.json();

  if (transaction.status === "APPROVED") {
    await db.update(orders).set({ status: "paid" }).where(eq(orders.id, orderId));
    await db
      .update(payments)
      .set({ status: "completed", transactionId, paidAt: new Date() })
      .where(eq(payments.orderId, orderId));
  } else if (["DECLINED", "VOIDED", "ERROR"].includes(transaction.status)) {
    await db
      .update(payments)
      .set({ status: "failed", transactionId })
      .where(eq(payments.orderId, orderId));
  }
}

/**
 * Wompi redirects here after checkout (instead of directly to the success page).
 * Wompi appends &id=TRANSACTION_ID to whatever redirect-url we provided.
 *
 * We persist the transactionId directly to the DB before any page rendering
 * can fail, then redirect the user to the success page.
 */
export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://todoelectricovictor.com";

  const { searchParams } = request.nextUrl;
  const orderId = searchParams.get("orderId");
  const transactionId = searchParams.get("id");

  if (!orderId) {
    return NextResponse.redirect(new URL("/orders", baseUrl));
  }

  if (transactionId) {
    try {
      await upsertTransactionId(orderId, transactionId);
      await syncStatusFromWompi(orderId, transactionId);
    } catch (err) {
      console.error("Error in payment callback:", err);
    }
  }

  const successUrl = new URL("/checkout/success", baseUrl);
  successUrl.searchParams.set("orderId", orderId);
  if (transactionId) successUrl.searchParams.set("id", transactionId);

  return NextResponse.redirect(successUrl.toString());
}
