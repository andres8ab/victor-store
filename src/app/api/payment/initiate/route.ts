import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://todoelectricovictor.com";

  // Verify the user is authenticated
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const { searchParams } = request.nextUrl;
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.redirect(
      new URL("/orders?paymentError=invalid", baseUrl),
    );
  }

  // Verify the order exists and belongs to this user
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || order.userId !== session?.user.id) {
    return NextResponse.redirect(
      new URL("/orders?paymentError=not_found", baseUrl),
    );
  }

  if (order.status === "paid") {
    return NextResponse.redirect(
      new URL(`/checkout/success?orderId=${orderId}`, baseUrl),
    );
  }

  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  const integrityKey = process.env.WOMPI_INTEGRITY_KEY;

  if (!publicKey || !integrityKey) {
    console.error("Missing WOMPI_PUBLIC_KEY or WOMPI_INTEGRITY_KEY env vars");
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?paymentError=config`, baseUrl),
    );
  }

  try {
    // Wompi requires amount in cents (centavos). Prices are stored in COP.
    const amountInCents = Math.round(Number(order.totalAmount) * 100);
    const currency = "COP";
    const reference = order.id;

    // Integrity signature: SHA256(reference + amountInCents + currency + integrityKey)
    const integrityHash = createHash("sha256")
      .update(`${reference}${amountInCents}${currency}${integrityKey}`)
      .digest("hex");

    // Create a payment record to track this attempt
    await db.insert(payments).values({
      orderId: order.id,
      method: "wompi",
      status: "initiated",
    });

    // Redirect URL — Wompi will append &id=TRANSACTION_ID to it.
    // We point to /api/payment/callback so the transactionId is persisted
    // before the success page is rendered (even if that page later fails).
    const redirectUrl = `${baseUrl}/api/payment/callback?orderId=${orderId}`;

    const wompiUrl = new URL("https://checkout.wompi.co/p/");
    wompiUrl.searchParams.set("public-key", publicKey);
    wompiUrl.searchParams.set("currency", currency);
    wompiUrl.searchParams.set("amount-in-cents", amountInCents.toString());
    wompiUrl.searchParams.set("reference", reference);
    wompiUrl.searchParams.set("signature:integrity", integrityHash);
    wompiUrl.searchParams.set("redirect-url", redirectUrl);

    return NextResponse.redirect(wompiUrl.toString());
  } catch (err) {
    console.error("Error initiating Wompi payment:", err);
    return NextResponse.redirect(
      new URL(`/orders/${orderId}?paymentError=config`, baseUrl),
    );
  }
}
