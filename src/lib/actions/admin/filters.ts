"use server";

import { db } from "@/lib/db";
import { colors, sizes } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/admin";

export async function getAllColors() {
    await requireAdmin();
    const allColors = await db.select().from(colors);
    return allColors;
}

export async function getAllSizes() {
    await requireAdmin();
    const allSizes = await db.select().from(sizes).orderBy(sizes.sortOrder);
    return allSizes;
}
