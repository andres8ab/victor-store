"use server";

import {
  and,
  asc,
  avg,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  sum,
  aliasedTable,
  type SQL,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  brands,
  categories,
  genders,
  productImages,
  products,
  users,
  reviews,
  orders,
  orderItems,
  type SelectProduct,
  type SelectProductImage,
  type SelectBrand,
  type SelectCategory,
  type SelectGender,
} from "@/lib/db/schema";

import { NormalizedProductFilters } from "@/lib/utils/query";

type ProductListItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  createdAt: Date;
  subtitle?: string | null;
};

export type GetAllProductsResult = {
  products: ProductListItem[];
  totalCount: number;
};

export async function getAllProducts(
  filters: NormalizedProductFilters,
): Promise<GetAllProductsResult> {
  const conds: SQL[] = [eq(products.isPublished, true)];

  if (filters.search) {
    const pattern = `%${filters.search}%`;
    conds.push(
      or(ilike(products.name, pattern), ilike(products.description, pattern))!,
    );
  }

  if (filters?.genderSlugs?.length) {
    conds.push(inArray(genders.slug, filters.genderSlugs));
  }

  if (filters?.brandSlugs?.length) {
    conds.push(inArray(brands.slug, filters.brandSlugs));
  }

  if (filters?.categorySlugs?.length) {
    conds.push(inArray(categories.slug, filters.categorySlugs));
  }

  const hasPrice = !!(
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters?.priceRanges?.length
  );

  if (hasPrice) {
    const priceBounds: SQL[] = [];

    if (filters?.priceRanges?.length) {
      for (const [min, max] of filters.priceRanges) {
        const subConds: SQL[] = [];
        if (min !== undefined) {
          subConds.push(
            sql`COALESCE(${products.salePrice}, ${products.price})::numeric >= ${min}`,
          );
        }
        if (max !== undefined) {
          subConds.push(
            sql`COALESCE(${products.salePrice}, ${products.price})::numeric <= ${max}`,
          );
        }
        if (subConds.length) priceBounds.push(and(...subConds)!);
      }
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const subConds: SQL[] = [];
      if (filters.priceMin !== undefined) {
        subConds.push(
          sql`COALESCE(${products.salePrice}, ${products.price})::numeric >= ${filters.priceMin}`,
        );
      }
      if (filters.priceMax !== undefined) {
        subConds.push(
          sql`COALESCE(${products.salePrice}, ${products.price})::numeric <= ${filters.priceMax}`,
        );
      }
      if (subConds.length) priceBounds.push(and(...subConds)!);
    }

    if (priceBounds.length) {
      conds.push(or(...priceBounds)!);
    }
  }

  // Simplified image join - strictly preferential to isPrimary, then sortOrder
  const imagesJoin = db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      rn: sql<number>`row_number() over (partition by ${productImages.productId} order by ${productImages.isPrimary} desc, ${productImages.sortOrder} asc)`.as(
        "rn",
      ),
    })
    .from(productImages)
    .as("pi");

  const baseWhere = conds.length ? and(...conds) : undefined;

  const priceAgg = {
    minPrice: sql<number | null>`min(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
    maxPrice: sql<number | null>`max(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
  };

  const imageAgg = sql<
    string | null
  >`max(case when ${imagesJoin.rn} = 1 then ${imagesJoin.url} else null end)`;

  const primaryOrder =
    filters.sort === "price_asc"
      ? asc(
        sql`min(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
      )
      : filters.sort === "price_desc"
        ? desc(
          sql`max(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
        )
        : desc(products.createdAt);

  const page = Math.max(1, filters?.page || 1);
  const limit = Math.max(1, Math.min(filters?.limit || 20, 60));
  const offset = (page - 1) * limit;

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      createdAt: products.createdAt,
      subtitle: genders.label,
      minPrice: priceAgg.minPrice,
      maxPrice: priceAgg.maxPrice,
      imageUrl: imageAgg,
    })
    .from(products)
    .leftJoin(imagesJoin, eq(imagesJoin.productId, products.id))
    .leftJoin(genders, eq(genders.id, products.genderId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(baseWhere)
    .groupBy(products.id, products.name, products.createdAt, genders.label)
    .orderBy(primaryOrder, desc(products.createdAt), asc(products.id))
    .limit(limit)
    .offset(offset);
  const countRows = await db
    .select({
      cnt: count(sql<number>`distinct ${products.id}`),
    })
    .from(products)
    .leftJoin(genders, eq(genders.id, products.genderId))
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(baseWhere);

  const productsOut: ProductListItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    imageUrl: r.imageUrl,
    minPrice: r.minPrice === null ? null : Number(r.minPrice),
    maxPrice: r.maxPrice === null ? null : Number(r.maxPrice),
    createdAt: r.createdAt,
    subtitle: r.subtitle ? r.subtitle : null,
  }));

  const totalCount = countRows[0]?.cnt ?? 0;

  return { products: productsOut, totalCount };
}

export type FullProduct = {
  product: SelectProduct & {
    brand?: SelectBrand | null;
    category?: SelectCategory | null;
    gender?: SelectGender | null;
  };
  images: SelectProductImage[];
};

export async function getProduct(
  productId: string,
): Promise<FullProduct | null> {
  const rows = await db
    .select({
      productId: products.id,
      productName: products.name,
      productDescription: products.description,
      productBrandId: products.brandId,
      productCategoryId: products.categoryId,
      productGenderId: products.genderId,
      productPrice: sql<number>`${products.price}::numeric`,
      productSalePrice: sql<number | null>`${products.salePrice}::numeric`,
      productInStock: products.inStock,
      productIsActive: products.isActive,
      isPublished: products.isPublished,
      productCreatedAt: products.createdAt,
      productUpdatedAt: products.updatedAt,

      brandId: brands.id,
      brandName: brands.name,
      brandSlug: brands.slug,
      brandLogoUrl: brands.logoUrl,

      categoryId: categories.id,
      categoryName: categories.name,
      categorySlug: categories.slug,

      genderId: genders.id,
      genderLabel: genders.label,
      genderSlug: genders.slug,

      imageId: productImages.id,
      imageUrl: productImages.url,
      imageIsPrimary: productImages.isPrimary,
      imageSortOrder: productImages.sortOrder,
    })
    .from(products)
    .leftJoin(brands, eq(brands.id, products.brandId))
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .leftJoin(genders, eq(genders.id, products.genderId))
    .leftJoin(productImages, eq(productImages.productId, products.id))
    .where(eq(products.id, productId));

  if (!rows.length) return null;

  const head = rows[0];

  const product: SelectProduct & {
    brand?: SelectBrand | null;
    category?: SelectCategory | null;
    gender?: SelectGender | null;
  } = {
    id: head.productId,
    name: head.productName,
    description: head.productDescription,
    brandId: head.productBrandId ?? null,
    categoryId: head.productCategoryId ?? null,
    genderId: head.productGenderId ?? null,
    price: String(head.productPrice),
    salePrice:
      head.productSalePrice !== null ? String(head.productSalePrice) : null,
    inStock: head.productInStock,
    isActive: head.productIsActive,
    isPublished: head.isPublished,
    createdAt: head.productCreatedAt,
    updatedAt: head.productUpdatedAt,
    brand: head.brandId
      ? {
        id: head.brandId,
        name: head.brandName!,
        slug: head.brandSlug!,
        logoUrl: head.brandLogoUrl ?? null,
      }
      : null,
    category: head.categoryId
      ? {
        id: head.categoryId,
        name: head.categoryName!,
        slug: head.categorySlug!,
        parentId: null,
      }
      : null,
    gender: head.genderId
      ? {
        id: head.genderId,
        label: head.genderLabel!,
        slug: head.genderSlug!,
      }
      : null,
  };

  const imagesMap = new Map<string, SelectProductImage>();

  for (const r of rows) {
    if (r.imageId && !imagesMap.has(r.imageId)) {
      imagesMap.set(r.imageId, {
        id: r.imageId,
        productId: head.productId,
        url: r.imageUrl!,
        sortOrder: r.imageSortOrder ?? 0,
        isPrimary: r.imageIsPrimary ?? false,
      });
    }
  }

  return {
    product,
    images: Array.from(imagesMap.values()),
  };
}
export type Review = {
  id: string;
  author: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
};

export type RecommendedProduct = {
  id: string;
  title: string;
  price: number | null;
  imageUrl: string;
};

export async function getProductReviews(productId: string): Promise<Review[]> {
  const rows = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      authorName: users.name,
      authorEmail: users.email,
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.userId))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(10);

  return rows.map((r) => ({
    id: r.id,
    author: r.authorName?.trim() || r.authorEmail || "Anonymous",
    rating: r.rating,
    title: undefined,
    content: r.comment || "",
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getRecommendedProducts(
  productId: string,
): Promise<RecommendedProduct[]> {
  const base = await db
    .select({
      id: products.id,
      categoryId: products.categoryId,
      brandId: products.brandId,
      genderId: products.genderId,
    })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  if (!base.length) return [];
  const b = base[0];

  const pi = db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      rn: sql<number>`row_number() over (partition by ${productImages.productId} order by ${productImages.isPrimary} desc, ${productImages.sortOrder} asc)`.as(
        "rn",
      ),
    })
    .from(productImages)
    .as("pi");

  const priority = sql<number>`
    (case when ${products.categoryId} is not null and ${products.categoryId} = ${b.categoryId} then 1 else 0 end) * 3 +
    (case when ${products.brandId} is not null and ${products.brandId} = ${b.brandId} then 1 else 0 end) * 2 +
    (case when ${products.genderId} is not null and ${products.genderId} = ${b.genderId} then 1 else 0 end) * 1
  `;

  const rows = await db
    .select({
      id: products.id,
      title: products.name,
      minPrice: sql<number | null>`min(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
      imageUrl: sql<
        string | null
      >`max(case when ${pi.rn} = 1 then ${pi.url} else null end)`,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(pi, eq(pi.productId, products.id))
    .where(
      and(eq(products.isPublished, true), sql`${products.id} <> ${productId}`),
    )
    .groupBy(products.id, products.name, products.createdAt)
    .orderBy(desc(priority), desc(products.createdAt), asc(products.id))
    .limit(8);

  const out: RecommendedProduct[] = [];
  for (const r of rows) {
    const img = r.imageUrl?.trim();
    if (!img) continue;
    out.push({
      id: r.id,
      title: r.title,
      price: r.minPrice === null ? null : Number(r.minPrice),
      imageUrl: img,
    });
    if (out.length >= 6) break;
  }
  return out;
}

export async function getLatestProducts(
  limit: number = 6,
): Promise<ProductListItem[]> {
  return (
    await getAllProducts({
      sort: "newest",
      limit,
    })
  ).products;
}

export async function getMostPurchasedProducts(
  limit: number = 6,
): Promise<ProductListItem[]> {
  // Pre-aggregate purchase counts by product
  const purchaseStats = db
    .select({
      productId: orderItems.productId,
      count: sum(orderItems.quantity).as("count"),
    })
    .from(orderItems)
    .groupBy(orderItems.productId)
    .as("ps");

  const imagesJoin = db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      rn: sql<number>`row_number() over (partition by ${productImages.productId} order by ${productImages.isPrimary} desc, ${productImages.sortOrder} asc)`.as(
        "rn",
      ),
    })
    .from(productImages)
    .as("pi");

  const priceAgg = {
    minPrice: sql<number | null>`min(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
    maxPrice: sql<number | null>`max(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
  };

  const imageAgg = sql<
    string | null
  >`max(case when ${imagesJoin.rn} = 1 then ${imagesJoin.url} else null end)`;

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      createdAt: products.createdAt,
      subtitle: genders.label,
      minPrice: priceAgg.minPrice,
      maxPrice: priceAgg.maxPrice,
      imageUrl: imageAgg,
      purchaseCount: sql<number>`coalesce(max(${purchaseStats.count}), 0)`,
    })
    .from(products)
    .leftJoin(purchaseStats, eq(purchaseStats.productId, products.id))
    .leftJoin(imagesJoin, eq(imagesJoin.productId, products.id))
    .leftJoin(genders, eq(genders.id, products.genderId))
    .where(eq(products.isPublished, true))
    .groupBy(products.id, products.name, products.createdAt, genders.label)
    .orderBy(
      desc(sql`coalesce(max(${purchaseStats.count}), 0)`),
      desc(products.createdAt),
    )
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    imageUrl: r.imageUrl,
    minPrice: r.minPrice === null ? null : Number(r.minPrice),
    maxPrice: r.maxPrice === null ? null : Number(r.maxPrice),
    createdAt: r.createdAt,
    subtitle: r.subtitle ? r.subtitle : null,
  }));
}

export async function getFeaturedProducts(
  limit: number = 6,
): Promise<ProductListItem[]> {
  // Products with highest average rating
  const imagesJoin = db
    .select({
      productId: productImages.productId,
      url: productImages.url,
      rn: sql<number>`row_number() over (partition by ${productImages.productId} order by ${productImages.isPrimary} desc, ${productImages.sortOrder} asc)`.as(
        "rn",
      ),
    })
    .from(productImages)
    .as("pi");

  const priceAgg = {
    minPrice: sql<number | null>`min(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
    maxPrice: sql<number | null>`max(COALESCE(${products.salePrice}, ${products.price})::numeric)`,
  };

  const imageAgg = sql<
    string | null
  >`max(case when ${imagesJoin.rn} = 1 then ${imagesJoin.url} else null end)`;

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      createdAt: products.createdAt,
      subtitle: genders.label,
      minPrice: priceAgg.minPrice,
      maxPrice: priceAgg.maxPrice,
      imageUrl: imageAgg,
      avgRating: avg(reviews.rating),
    })
    .from(products)
    .leftJoin(reviews, eq(reviews.productId, products.id))
    .leftJoin(imagesJoin, eq(imagesJoin.productId, products.id))
    .leftJoin(genders, eq(genders.id, products.genderId))
    .where(eq(products.isPublished, true))
    .groupBy(products.id, products.name, products.createdAt, genders.label)
    .orderBy(sql`avg(${reviews.rating}) DESC NULLS LAST`, desc(products.createdAt))
    .limit(limit);

  const mapped: ProductListItem[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    imageUrl: r.imageUrl,
    minPrice: r.minPrice === null ? null : Number(r.minPrice),
    maxPrice: r.maxPrice === null ? null : Number(r.maxPrice),
    createdAt: r.createdAt,
    subtitle: r.subtitle ? r.subtitle : null,
  }));

  // If we don't have enough featured products (with reviews), fill with latest
  if (mapped.length < limit) {
    const existingIds = new Set(mapped.map((p) => p.id));
    const latest = await getLatestProducts(limit * 2); // Fetch more to filter
    for (const p of latest) {
      if (!existingIds.has(p.id)) {
        mapped.push(p);
        if (mapped.length >= limit) break;
      }
    }
  }

  return mapped;
}
