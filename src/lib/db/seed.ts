import { db } from "@/lib/db";
import {
  genders,
  colors,
  sizes,
  brands,
  categories,
  collections,
  productCollections,
  products,
  productVariants,
  productImages,
  insertGenderSchema,
  insertColorSchema,
  insertSizeSchema,
  insertBrandSchema,
  insertCategorySchema,
  insertCollectionSchema,
  insertProductSchema,
  insertVariantSchema,
  insertProductImageSchema,
  type InsertProduct,
  type InsertVariant,
  type InsertProductImage,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { mkdirSync, existsSync, cpSync } from "fs";
import { join, basename } from "path";
type ProductRow = typeof products.$inferSelect;
type VariantRow = typeof productVariants.$inferSelect;

type RGBHex = `#${string}`;

const log = (...args: unknown[]) => console.log("[seed]", ...args);
const err = (...args: unknown[]) => console.error("[seed:error]", ...args);

function pick<T>(arr: T[], n: number) {
  const a = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && a.length; i++) {
    const idx = Math.floor(Math.random() * a.length);
    out.push(a.splice(idx, 1)[0]);
  }
  return out;
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  try {
    log("Seeding filters: colors, sizes");

    // Note: We're keeping genders table for backward compatibility but won't use it
    const genderRows = [
      insertGenderSchema.parse({ label: "General", slug: "general" }),
    ];
    for (const row of genderRows) {
      const exists = await db
        .select()
        .from(genders)
        .where(eq(genders.slug, row.slug))
        .limit(1);
      if (!exists.length) await db.insert(genders).values(row);
    }

    const colorRows = [
      { name: "Negro", slug: "negro", hexCode: "#000000" as RGBHex },
      { name: "Blanco", slug: "blanco", hexCode: "#FFFFFF" as RGBHex },
      { name: "Gris", slug: "gris", hexCode: "#6B7280" as RGBHex },
      { name: "Plateado", slug: "plateado", hexCode: "#C0C0C0" as RGBHex },
    ].map((c) => insertColorSchema.parse(c));
    for (const row of colorRows) {
      const exists = await db
        .select()
        .from(colors)
        .where(eq(colors.slug, row.slug))
        .limit(1);
      if (!exists.length) await db.insert(colors).values(row);
    }

    // Sizes for spare parts (could represent voltage, amperage, or model compatibility)
    const sizeRows = [
      { name: "10A", slug: "10a", sortOrder: 0 },
      { name: "16A", slug: "16a", sortOrder: 1 },
      { name: "20A", slug: "20a", sortOrder: 2 },
      { name: "25A", slug: "25a", sortOrder: 3 },
      { name: "32A", slug: "32a", sortOrder: 4 },
      { name: "40A", slug: "40a", sortOrder: 5 },
    ].map((s) => insertSizeSchema.parse(s));
    for (const row of sizeRows) {
      const exists = await db
        .select()
        .from(sizes)
        .where(eq(sizes.slug, row.slug))
        .limit(1);
      if (!exists.length) await db.insert(sizes).values(row);
    }

    log("Seeding brands");
    const brandRows = [
      { name: "Schneider Electric", slug: "schneider", logoUrl: undefined },
      { name: "Siemens", slug: "siemens", logoUrl: undefined },
      {
        name: "General Electric",
        slug: "general-electric",
        logoUrl: undefined,
      },
      { name: "Philips", slug: "philips", logoUrl: undefined },
      { name: "Osram", slug: "osram", logoUrl: undefined },
    ].map((b) => insertBrandSchema.parse(b));
    for (const brand of brandRows) {
      const exists = await db
        .select()
        .from(brands)
        .where(eq(brands.slug, brand.slug))
        .limit(1);
      if (!exists.length) await db.insert(brands).values(brand);
    }

    log("Seeding categories");
    const catRows = [
      {
        name: "Componentes Eléctricos",
        slug: "componentes-electricos",
        parentId: null,
      },
      { name: "Herramientas", slug: "herramientas", parentId: null },
      { name: "Cableado", slug: "cableado", parentId: null },
      { name: "Iluminación", slug: "iluminacion", parentId: null },
      { name: "Interruptores", slug: "interruptores", parentId: null },
      { name: "Enchufes y Tomas", slug: "enchufes", parentId: null },
    ].map((c) => insertCategorySchema.parse(c));
    for (const row of catRows) {
      const exists = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, row.slug))
        .limit(1);
      if (!exists.length) await db.insert(categories).values(row);
    }

    log("Seeding collections");
    const collectionRows = [
      insertCollectionSchema.parse({
        name: "Nuevos Productos",
        slug: "nuevos-productos",
      }),
      insertCollectionSchema.parse({
        name: "Ofertas",
        slug: "ofertas",
      }),
    ];
    for (const row of collectionRows) {
      const exists = await db
        .select()
        .from(collections)
        .where(eq(collections.slug, row.slug))
        .limit(1);
      if (!exists.length) await db.insert(collections).values(row);
    }

    const allGenders = await db.select().from(genders);
    const allColors = await db.select().from(colors);
    const allSizes = await db.select().from(sizes);
    const allBrands = await db.select().from(brands);
    const componentesCat = (
      await db
        .select()
        .from(categories)
        .where(eq(categories.slug, "componentes-electricos"))
    )[0];
    const herramientasCat = (
      await db
        .select()
        .from(categories)
        .where(eq(categories.slug, "herramientas"))
    )[0];
    const cableadoCat = (
      await db.select().from(categories).where(eq(categories.slug, "cableado"))
    )[0];
    const iluminacionCat = (
      await db
        .select()
        .from(categories)
        .where(eq(categories.slug, "iluminacion"))
    )[0];
    const interruptoresCat = (
      await db
        .select()
        .from(categories)
        .where(eq(categories.slug, "interruptores"))
    )[0];
    const enchufesCat = (
      await db.select().from(categories).where(eq(categories.slug, "enchufes"))
    )[0];
    const nuevosProductos = (
      await db
        .select()
        .from(collections)
        .where(eq(collections.slug, "nuevos-productos"))
    )[0];
    const ofertas = (
      await db.select().from(collections).where(eq(collections.slug, "ofertas"))
    )[0];

    const uploadsRoot = join(process.cwd(), "static", "uploads", "parts");
    if (!existsSync(uploadsRoot)) {
      mkdirSync(uploadsRoot, { recursive: true });
    }

    const sourceDir = join(process.cwd(), "public", "parts");
    const productNames = [
      "Bateria Willard 800Amp",
      "Bateria Willard Titanio",
      "Cinta Aislante 3M",
      "Cinta Aislante KTC",
      "Cable THHN 12 AWG",
      "Cable THHN 10 AWG",
      "Bombilla LED 9W Philips",
      "Bombilla LED 12W Osram",
      "Alternador Aveo Gamma",
      "Alternador Atos Gamma",
      "Arranque Hyundai Accent OB",
      "Pito Bosch",
      "Relay 4P KTC",
      "Ambientador Auto Fresco Simoniz",
      "Bujia NGK",
    ];

    const sourceImages = [
      "1.jpg",
      "2.png",
      "3.webp",
      "4.png",
      "5.jpg",
      "6.jpg",
      "7.jpg",
      "8.jpg",
      "9.webp",
      "10.webp",
      "11.webp",
      "12.webp",
      "13.jpg",
      "14.jpg",
      "15.jpg",
    ];

    log("Creating products with variants and images");
    const categoriesList = [
      componentesCat,
      herramientasCat,
      cableadoCat,
      iluminacionCat,
      interruptoresCat,
      enchufesCat,
    ].filter(Boolean);

    for (let i = 0; i < productNames.length; i++) {
      const name = productNames[i];
      const gender = allGenders[0]; // Use general gender
      const catPick = categoriesList[randInt(0, categoriesList.length - 1)];
      const brandPick = allBrands[randInt(0, allBrands.length - 1)];
      const desc = `Repuesto eléctrico de calidad para ${name}. Ideal para instalaciones residenciales e industriales.`;

      const product = insertProductSchema.parse({
        name,
        description: desc,
        categoryId: catPick?.id ?? null,
        genderId: gender?.id ?? null,
        brandId: brandPick?.id ?? null,
        isPublished: true,
      });

      const retP = await db
        .insert(products)
        .values(product as InsertProduct)
        .returning();
      const insertedProduct = (retP as ProductRow[])[0];
      const colorChoices = pick(
        allColors,
        randInt(2, Math.min(4, allColors.length)),
      );
      const sizeChoices = pick(
        allSizes,
        randInt(3, Math.min(6, allSizes.length)),
      );

      const variantIds: string[] = [];
      let defaultVariantId: string | null = null;

      for (const color of colorChoices) {
        for (const size of sizeChoices) {
          const priceNum = Number((randInt(10000, 200000) + 0.99).toFixed(2)); // Prices in COP
          const discountedNum =
            Math.random() < 0.3
              ? Number((priceNum - randInt(5000, 50000)).toFixed(2))
              : null;
          const sku = `VICTOR-${insertedProduct.id.slice(
            0,
            8,
          )}-${color.slug.toUpperCase()}-${size.slug.toUpperCase()}`;
          const variant = insertVariantSchema.parse({
            productId: insertedProduct.id,
            sku,
            price: priceNum.toFixed(2),
            salePrice:
              discountedNum !== null ? discountedNum.toFixed(2) : undefined,
            colorId: color.id,
            sizeId: size.id,
            inStock: randInt(5, 50),
            weight: Number((Math.random() * 1 + 0.5).toFixed(2)),
            dimensions: { length: 30, width: 20, height: 12 },
          });
          const retV = await db
            .insert(productVariants)
            .values(variant as InsertVariant)
            .returning();
          const created = (retV as VariantRow[])[0];
          variantIds.push(created.id);
          if (!defaultVariantId) defaultVariantId = created.id;
        }
      }

      if (defaultVariantId) {
        await db
          .update(products)
          .set({ defaultVariantId })
          .where(eq(products.id, insertedProduct.id));
      }

      const pickName = sourceImages[i % sourceImages.length];
      const src = join(sourceDir, pickName);
      const destName = `${insertedProduct.id}-${basename(pickName)}`;
      const dest = join(uploadsRoot, destName);
      try {
        cpSync(src, dest);
        const img: InsertProductImage = insertProductImageSchema.parse({
          productId: insertedProduct.id,
          url: `/static/uploads/parts/${destName}`,
          sortOrder: 0,
          isPrimary: true,
        });
        await db.insert(productImages).values(img);
      } catch (e) {
        err("Failed to copy product image", { src, dest, e });
      }

      const collectionsForProduct: { id: string }[] =
        Math.random() < 0.5
          ? [ofertas]
          : ([nuevosProductos, ofertas].filter(Boolean) as { id: string }[]);
      for (const col of collectionsForProduct) {
        await db.insert(productCollections).values({
          productId: insertedProduct.id,
          collectionId: col.id,
        });
      }

      log(`Seeded product ${name} with ${variantIds.length} variants`);
    }

    log("Seeding complete");
  } catch (e) {
    err(e);
    process.exitCode = 1;
  }
}

seed();
