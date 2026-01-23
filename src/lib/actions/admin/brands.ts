"use server";

import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createBrandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  logoUrl: z.string().url().nullable().optional(),
});

const updateBrandSchema = createBrandSchema.extend({
  id: z.string().uuid(),
});

export async function createBrand(data: z.infer<typeof createBrandSchema>) {
  await requireAdmin();
  const validated = createBrandSchema.parse(data);

  const [brand] = await db
    .insert(brands)
    .values({
      name: validated.name,
      slug: validated.slug,
      logoUrl: validated.logoUrl ?? null,
    })
    .returning();

  revalidatePath("/admin/brands");
  return { success: true, brand };
}

export async function updateBrand(data: z.infer<typeof updateBrandSchema>) {
  await requireAdmin();
  const validated = updateBrandSchema.parse(data);

  const [brand] = await db
    .update(brands)
    .set({
      name: validated.name,
      slug: validated.slug,
      logoUrl: validated.logoUrl ?? null,
    })
    .where(eq(brands.id, validated.id))
    .returning();

  revalidatePath("/admin/brands");
  return { success: true, brand };
}

export async function deleteBrand(id: string) {
  await requireAdmin();
  await db.delete(brands).where(eq(brands.id, id));
  revalidatePath("/admin/brands");
  return { success: true };
}

export async function getAllBrandsForAdmin() {
  await requireAdmin();

  const allBrands = await db
    .select()
    .from(brands)
    .orderBy(brands.name);

  return allBrands;
}
