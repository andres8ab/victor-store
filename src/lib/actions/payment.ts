"use server";

import { db } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema";
import { and, eq, ne, sql } from "drizzle-orm";

type WompiTransactionData = {
  id: string;
  status: string;
  reference: string;
};


type WompiTransactionListResponse = {
  data: WompiTransactionData[];
};

function getWompiBaseUrl(privateKey: string) {
  return privateKey.startsWith("prv_test_")
    ? "https://sandbox.wompi.co/v1"
    : "https://production.wompi.co/v1";
}

async function applyWompiTransaction(
  transaction: WompiTransactionData,
): Promise<void> {
  const orderId = transaction.reference;
  const transactionId = transaction.id;

  const [existingPayment] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  if (transaction.status === "APPROVED") {
    await db
      .update(orders)
      .set({ status: "paid" })
      .where(eq(orders.id, orderId));

    if (existingPayment) {
      await db
        .update(payments)
        .set({ status: "completed", transactionId, paidAt: new Date() })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await db.insert(payments).values({
        orderId,
        method: "wompi",
        status: "completed",
        transactionId,
        paidAt: new Date(),
      });
    }
  } else if (["DECLINED", "VOIDED", "ERROR"].includes(transaction.status)) {
    if (existingPayment) {
      await db
        .update(payments)
        .set({ status: "failed", transactionId })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await db.insert(payments).values({
        orderId,
        method: "wompi",
        status: "failed",
        transactionId,
      });
    }
  } else if (existingPayment && !existingPayment.transactionId) {
    // PENDING — at least save the transactionId so we can track it
    await db
      .update(payments)
      .set({ transactionId })
      .where(eq(payments.id, existingPayment.id));
  }
}

/**
 * Persists a Wompi transactionId on the payments row for a given order.
 * Called immediately when Wompi redirects back to the success page so we
 * never lose the transactionId even if the API sync or webhook is delayed.
 */
export async function recordWompiTransactionId(
  orderId: string,
  transactionId: string,
): Promise<void> {
  const [existingPayment] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, orderId))
    .limit(1);

  if (existingPayment) {
    if (!existingPayment.transactionId) {
      await db
        .update(payments)
        .set({ transactionId })
        .where(eq(payments.id, existingPayment.id));
    }
  } else {
    // No payment row yet (e.g. initiate route wasn't hit) — create one
    await db.insert(payments).values({
      orderId,
      method: "wompi",
      status: "initiated",
      transactionId,
    });
  }
}

/**
 * Fetches the current status of a Wompi transaction by ID and syncs it to the DB.
 * Requires WOMPI_PRIVATE_KEY env var (starts with prv_test_ or prv_prod_).
 */
export async function syncWompiTransaction(
  transactionId: string,
): Promise<string | null> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) return null;

  const baseUrl = getWompiBaseUrl(privateKey);

  try {
    const res = await fetch(`${baseUrl}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${privateKey}` },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const { data: transaction }: { data: WompiTransactionData } = await res.json();
    await applyWompiTransaction(transaction);
    return transaction.status;
  } catch (err) {
    console.error("Error syncing Wompi transaction by ID:", err);
    return null;
  }
}

/**
 * Looks up Wompi transactions by reference (order ID) and syncs the latest one.
 * Used when we don't have a transactionId stored locally yet,
 * or to sync a single order detail page.
 */
export async function syncWompiTransactionByReference(
  orderId: string,
): Promise<string | null> {
  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) return null;

  const baseUrl = getWompiBaseUrl(privateKey);

  try {
    const res = await fetch(
      `${baseUrl}/transactions?reference=${encodeURIComponent(orderId)}`,
      {
        headers: { Authorization: `Bearer ${privateKey}` },
        cache: "no-store",
      },
    );

    if (!res.ok) return null;

    const { data: txList }: WompiTransactionListResponse = await res.json();
    if (!txList?.length) return null;

    // Pick the most relevant transaction: prefer APPROVED, then latest
    const ranked = [...txList].sort((a, b) => {
      const priority = (s: string) =>
        s === "APPROVED" ? 0 : s === "PENDING" ? 1 : 2;
      return priority(a.status) - priority(b.status);
    });

    const best = ranked[0];
    await applyWompiTransaction(best);
    return best.status;
  } catch (err) {
    console.error("Error syncing Wompi transaction by reference:", err);
    return null;
  }
}

/**
 * Finds all pending Wompi orders for a user and syncs each one against Wompi.
 * Handles both orders with a known transactionId and those without.
 */
export async function syncPendingWompiOrdersForUser(
  userId: string,
): Promise<void> {
  // All wompi orders that haven't been marked paid/cancelled yet
  const pendingOrders = await db
    .select({
      id: orders.id,
      transactionId: sql<string | null>`(
        SELECT transaction_id FROM payments
        WHERE order_id = orders.id
          AND transaction_id IS NOT NULL
        LIMIT 1
      )`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.userId, userId),
        eq(orders.paymentMethod, "wompi"),
        ne(orders.status, "paid"),
        ne(orders.status, "cancelled"),
      ),
    );

  await Promise.all(
    pendingOrders.map((order) => {
      if (order.transactionId) {
        return syncWompiTransaction(order.transactionId);
      }
      return syncWompiTransactionByReference(order.id);
    }),
  );
}
