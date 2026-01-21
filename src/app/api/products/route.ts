import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/actions/product";
import { parseFilterParams } from "@/lib/utils/query";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const params: Record<string, string | string[] | undefined> = {};

    // Collect all search params, handling arrays properly
    const seenKeys = new Set<string>();
    searchParams.forEach((value, key) => {
      if (seenKeys.has(key)) {
        const existing = params[key];
        params[key] = Array.isArray(existing)
          ? [...existing, value]
          : [String(existing), value];
      } else {
        params[key] = value;
        seenKeys.add(key);
      }
    });

    const filters = parseFilterParams(params);
    const result = await getAllProducts(filters);

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
