"use server";

import { db } from "@/lib/db";
import {
  products,
  productVariants,
  productImages,
  categories,
  brands,
} from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/admin";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { insertProductImageSchema, insertVariantSchema } from "@/lib/db/schema";

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  categoryId: z.string().uuid().nullable().optional(),
  brandId: z.string().uuid().nullable().optional(),
  isPublished: z.boolean().optional(),
  images: z.array(z.string().url()).optional(),
});

const updateProductSchema = createProductSchema.extend({
  id: z.string().uuid(),
});

const toggleProductSchema = z.object({
  id: z.string().uuid(),
  isPublished: z.boolean(),
});

const createVariantSchema = insertVariantSchema.extend({
  images: z.array(z.string().url()).optional(),
});

export async function createProduct(data: z.infer<typeof createProductSchema>) {
  await requireAdmin();
  const validated = createProductSchema.parse(data);

  const [product] = await db
    .insert(products)
    .values({
      name: validated.name,
      description: validated.description,
      categoryId: validated.categoryId ?? null,
      brandId: validated.brandId ?? null,
      isPublished: validated.isPublished ?? false,
    })
    .returning();

  if (validated.images && validated.images.length > 0) {
    await db.insert(productImages).values(
      validated.images.map((url, index) => ({
        productId: product.id,
        url,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    );
  }

  revalidatePath("/admin/products");
  return { success: true, product };
}

export async function createProductVariant(
  data: z.infer<typeof createVariantSchema>,
) {
  await requireAdmin();
  const validated = createVariantSchema.parse(data);

  const [variant] = await db
    .insert(productVariants)
    .values({
      productId: validated.productId,
      name: validated.name,
      image: validated.image,
      price: validated.price,
      salePrice: validated.salePrice,
      inStock: validated.inStock,
      isActive: validated.isActive ?? true,
    })
    .returning();

  if (validated.images && validated.images.length > 0) {
    await db.insert(productImages).values(
      validated.images.map((url, index) => ({
        productId: validated.productId,
        variantId: variant.id,
        url,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    );
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${validated.productId}`);
  return { success: true, variant };
}

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  await requireAdmin();
  const validated = updateProductSchema.parse(data);

  const [product] = await db
    .update(products)
    .set({
      name: validated.name,
      description: validated.description,
      categoryId: validated.categoryId ?? null,
      brandId: validated.brandId ?? null,
      isPublished: validated.isPublished,
      updatedAt: new Date(),
    })
    .where(eq(products.id, validated.id))
    .returning();

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${validated.id}`);
  return { success: true, product };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductPublished(
  data: z.infer<typeof toggleProductSchema> | FormData,
) {
  await requireAdmin();

  let parsedData = data;
  if (data instanceof FormData) {
    parsedData = {
      id: data.get("id") as string,
      isPublished: data.get("isPublished") === "true",
    };
  }

  const validated = toggleProductSchema.parse(parsedData);

  await db
    .update(products)
    .set({
      isPublished: validated.isPublished,
      updatedAt: new Date(),
    })
    .where(eq(products.id, validated.id));

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${validated.id}`);
  return { success: true };
}

export async function toggleVariantActive(
  variantId: string,
  isActive: boolean,
) {
  await requireAdmin();

  await db
    .update(productVariants)
    .set({
      isActive,
    })
    .where(eq(productVariants.id, variantId));

  revalidatePath("/admin/products");
  return { success: true };
}

export async function getAllProductsForAdmin() {
  await requireAdmin();

  const allProducts = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      isPublished: products.isPublished,
      categoryId: products.categoryId,
      brandId: products.brandId,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      brandName: brands.name,
      variantCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${productVariants}
        WHERE ${productVariants.productId} = ${products.id}
      )`.as("variant_count"),
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .orderBy(sql`${products.createdAt} DESC`);

  return allProducts;
}

export async function getProductWithVariantsForAdmin(productId: string) {
  await requireAdmin();

  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      isPublished: products.isPublished,
      categoryId: products.categoryId,
      brandId: products.brandId,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      categoryName: categories.name,
      brandName: brands.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) {
    return null;
  }

  const variants = await db
    .select({
      id: productVariants.id,
      name: productVariants.name,
      image: productVariants.image,
      price: sql<number>`${productVariants.price}::numeric`,
      salePrice: sql<number | null>`${productVariants.salePrice}::numeric`,
      inStock: productVariants.inStock,
      isActive: productVariants.isActive,
    })
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  return {
    ...product,
    variants,
  };
}
