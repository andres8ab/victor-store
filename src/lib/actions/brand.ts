"use server";

import { db } from "@/lib/db";
import { brands, type SelectBrand } from "@/lib/db/schema";

export async function getAllBrands(): Promise<
  Pick<SelectBrand, "id" | "name" | "slug">[]
> {
  const rows = await db
    .select({ id: brands.id, name: brands.name, slug: brands.slug })
    .from(brands)
    .orderBy(brands.name);

  return rows;
}
