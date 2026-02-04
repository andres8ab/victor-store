import { NextRequest, NextResponse } from "next/server";
import { toggleVariantActive } from "@/lib/actions/admin/products";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, isActive } = body;
    if (!variantId || typeof isActive !== "boolean") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await toggleVariantActive(variantId, isActive);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Toggle variant error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
