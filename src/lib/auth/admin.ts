"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return false;
    }

    // Optimization: Check role directly from session if available
    // better-auth with drizzle adapter and schema should include custom fields if configured or by default
    // We assume 'role' is part of the user object returned by better-auth
    // casting to any if typescript complains initially, but it should be there based on schema
    return (session.user as any).role === "admin";
  } catch (e) {
    console.error("Error checking admin status:", e);
    return false;
  }
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error("Unauthorized: Admin access required");
  }
  return true;
}


export async function getCurrentAdminUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return null;
  }

  // Optimization: Use session user directly
  const user = session.user as any;

  if (user.role !== "admin") {
    return null;
  }

  return user;
}
