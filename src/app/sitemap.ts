import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://todoelectricovicto.com";

  const allProducts = await db
    .select({ id: products.id, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.isPublished, true));

  const productEntries: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: `${baseUrl}/products/${p.id}`,
    lastModified: p.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productEntries,
  ];
}
