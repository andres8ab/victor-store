"use server";

import { db } from "@/lib/db";
import { categories, type SelectCategory } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";

export async function getAllCategories(): Promise<SelectCategory[]> {
  const rows = await db
    .select()
    .from(categories)
    .where(isNull(categories.parentId))
    .orderBy(categories.name);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    parentId: r.parentId ?? undefined,
  }));
}

export async function getCategoryBySlug(
  slug: string,
): Promise<SelectCategory | null> {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);

  if (!rows.length) return null;

  const r = rows[0];
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    parentId: r.parentId ?? undefined,
  };
}
