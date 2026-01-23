"use server";

import { db } from "@/lib/db";
import { orders, orderItems, users, addresses, productVariants, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { sql } from "drizzle-orm";

export async function getAllOrders() {
  await requireAdmin();

  const allOrders = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      totalAmount: sql<number>`${orders.totalAmount}::numeric`,
      createdAt: orders.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .orderBy(sql`${orders.createdAt} DESC`);

  return allOrders;
}

export async function getOrderById(orderId: string) {
  await requireAdmin();

  const [order] = await db
    .select({
      id: orders.id,
      userId: orders.userId,
      status: orders.status,
      totalAmount: sql<number>`${orders.totalAmount}::numeric`,
      shippingAddressId: orders.shippingAddressId,
      billingAddressId: orders.billingAddressId,
      createdAt: orders.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order) {
    return null;
  }

  const items = await db
    .select({
      id: orderItems.id,
      productVariantId: orderItems.productVariantId,
      quantity: orderItems.quantity,
      priceAtPurchase: sql<number>`${orderItems.priceAtPurchase}::numeric`,
      productName: products.name,
      variantSku: productVariants.sku,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
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
