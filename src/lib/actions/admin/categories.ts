"use server";

import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().uuid().nullable().optional(),
});

const updateCategorySchema = createCategorySchema.extend({
  id: z.string().uuid(),
});

export async function createCategory(data: z.infer<typeof createCategorySchema>) {
  await requireAdmin();
  const validated = createCategorySchema.parse(data);

  const [category] = await db
    .insert(categories)
    .values({
      name: validated.name,
      slug: validated.slug,
      parentId: validated.parentId ?? null,
    })
    .returning();

  revalidatePath("/admin/categories");
  return { success: true, category };
}

export async function updateCategory(data: z.infer<typeof updateCategorySchema>) {
  await requireAdmin();
  const validated = updateCategorySchema.parse(data);

  const [category] = await db
    .update(categories)
    .set({
      name: validated.name,
      slug: validated.slug,
      parentId: validated.parentId ?? null,
    })
    .where(eq(categories.id, validated.id))
    .returning();

  revalidatePath("/admin/categories");
  return { success: true, category };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function getAllCategoriesForAdmin() {
  await requireAdmin();

  const allCategories = await db
    .select()
    .from(categories)
    .orderBy(categories.name);

  return allCategories;
}
