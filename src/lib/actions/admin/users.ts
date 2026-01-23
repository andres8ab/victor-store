"use server";

import { db } from "@/lib/db";
import { users, orders } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";

export async function getAllUsers() {
  await requireAdmin();

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
      orderCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${orders}
        WHERE ${orders.userId} = ${users.id}
      )`.as("order_count"),
    })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`);

  return allUsers;
}

export async function getUserById(userId: string) {
  await requireAdmin();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    return null;
  }

  const userOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      totalAmount: sql<number>`${orders.totalAmount}::numeric`,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(sql`${orders.createdAt} DESC`);

  return {
    ...user,
    orders: userOrders,
  };
}
