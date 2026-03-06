/**
 * One-off script: set inStock to 9999 for all products.
 *
 * Usage (from project root):
 *   npx tsx scripts/update-product-stock.ts
 *
 * Requires DATABASE_URL in .env.local
 */

import * as dotenv from "dotenv";
import { sql } from "drizzle-orm";
import { db } from "../src/lib/db";
import { products } from "../src/lib/db/schema";

dotenv.config({ path: ".env.local" });

const STOCK_VALUE = 9999;

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  try {
    await db
      .update(products)
      .set({ inStock: STOCK_VALUE, updatedAt: new Date() })
      .where(sql`true`);

    console.log(`✅ All products updated: inStock = ${STOCK_VALUE}`);
  } catch (err) {
    console.error("❌ Update failed:", err);
    process.exit(1);
  }

  process.exit(0);
}

main();
