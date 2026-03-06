import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import { eq, sql } from "drizzle-orm";
import { isAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { products, categories, brands } from "@/lib/db/schema";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");
const LOGO_HEIGHT = 36;

const PAGE_MARGIN = 50;
const MIN_ROW_HEIGHT = 20;
const ROW_PADDING = 8;
const TITLE_SIZE = 22;
const SECTION_SIZE = 12;
const BODY_SIZE = 10;

type CatalogRow = {
  id: string;
  name: string;
  description: string;
  price: string | null;
  isPublished: boolean;
  categoryName: string | null;
  brandName: string | null;
};

function buildCatalogBuffer(catalogProducts: CatalogRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: PAGE_MARGIN,
      size: "A4",
      bufferPages: true,
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - PAGE_MARGIN * 2;

    // Header: logo + title
    let y = PAGE_MARGIN;
    if (fs.existsSync(LOGO_PATH)) {
      try {
        doc.image(LOGO_PATH, PAGE_MARGIN, y, { height: LOGO_HEIGHT });
      } catch {
        // skip logo if image fails to load
      }
    }
    doc.fontSize(TITLE_SIZE).font("Helvetica-Bold").text("Catálogo de Productos", PAGE_MARGIN + 120, y, { width: pageWidth - 120 });
    doc.fontSize(10).font("Helvetica").fillColor("#666666").text(`Generado el ${new Date().toLocaleDateString("es-CO", { dateStyle: "long" })}`, PAGE_MARGIN + 120, y + 22, { width: pageWidth - 120 });
    doc.fillColor("#000000");
    y += LOGO_HEIGHT + 16;

    const colWidths = {
      name: pageWidth * 0.48,
      category: pageWidth * 0.20,
      brand: pageWidth * 0.18,
      price: pageWidth * 0.14,
    };

    // Table header
    doc.fontSize(SECTION_SIZE).font("Helvetica-Bold");
    doc.rect(PAGE_MARGIN, y, pageWidth, MIN_ROW_HEIGHT).fill("#2d5016");
    doc.fillColor("#ffffff").text("Producto", PAGE_MARGIN + 6, y + 4, { width: colWidths.name - 12 });
    doc.text("Categoría", PAGE_MARGIN + colWidths.name + 6, y + 4, { width: colWidths.category - 12 });
    doc.text("Marca", PAGE_MARGIN + colWidths.name + colWidths.category + 6, y + 4, { width: colWidths.brand - 12 });
    doc.text("Precio", PAGE_MARGIN + colWidths.name + colWidths.category + colWidths.brand + 6, y + 4, { width: colWidths.price - 12 });
    doc.fillColor("#000000");
    y += MIN_ROW_HEIGHT;

    doc.fontSize(BODY_SIZE).font("Helvetica");
    const nameOpts = { width: colWidths.name - 12 };

    for (let i = 0; i < catalogProducts.length; i++) {
      const p = catalogProducts[i];
      const price = p.price ? Number(p.price) : 0;
      const priceStr = price > 0 ? `$${price.toLocaleString("es-CO")}` : "—";
      const nameText = (p.name || "").trim() || "—";
      const catText = (p.categoryName ?? "—").trim();
      const brandText = (p.brandName ?? "—").trim();

      // Height for wrapped product name
      const nameHeight = doc.heightOfString(nameText, nameOpts);
      const rowHeight = Math.max(MIN_ROW_HEIGHT, nameHeight + ROW_PADDING);

      // New page if needed
      if (y > doc.page.height - PAGE_MARGIN - rowHeight - 30) {
        doc.addPage();
        y = PAGE_MARGIN;
        doc.fontSize(BODY_SIZE).font("Helvetica");
      }

      const rowY = y;

      if (i % 2 === 1) {
        doc.rect(PAGE_MARGIN, rowY, pageWidth, rowHeight).fill("#f5f5f5");
      }
      doc.fillColor("#000000");
      doc.text(nameText, PAGE_MARGIN + 6, rowY + 4, nameOpts);
      doc.text(catText, PAGE_MARGIN + colWidths.name + 6, rowY + 4, { width: colWidths.category - 12 });
      doc.text(brandText, PAGE_MARGIN + colWidths.name + colWidths.category + 6, rowY + 4, { width: colWidths.brand - 12 });
      doc.text(priceStr, PAGE_MARGIN + colWidths.name + colWidths.category + colWidths.brand + 6, rowY + 4, { width: colWidths.price - 12 });

      y += rowHeight;
    }

    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#666666").text(`Total: ${catalogProducts.length} productos`, 0, y + 12, { width: pageWidth, align: "right" });
    doc.end();
  });
}

export async function GET() {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const catalogProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        isPublished: products.isPublished,
        categoryName: categories.name,
        brandName: brands.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .orderBy(sql`${products.name} ASC`);

    const buffer = await buildCatalogBuffer(catalogProducts as CatalogRow[]);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="catalogo-productos.pdf"',
        "Content-Length": String(buffer.length),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Catalog PDF error:", err);
    return NextResponse.json(
      { error: "Error generating catalog", detail: message },
      { status: 500 }
    );
  }
}
