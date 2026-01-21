"use client";

import { useState } from "react";
import { useVariantStore } from "@/store/variant";

export interface VariantSelectorProps {
  productId: string;
  variants: Array<{
    id: string;
    specification: string | null;
  }>;
  className?: string;
}

export default function VariantSelector({
  productId,
  variants,
  className = "",
}: VariantSelectorProps) {
  const variantStore = useVariantStore();
  const [selected, setSelected] = useState<string | null>(
    variants[0]?.id ?? null,
  );

  const handleSelect = (variantId: string) => {
    setSelected(variantId);
    const index = variants.findIndex((v) => v.id === variantId);
    if (index !== -1) {
      variantStore.setSelected(productId, index);
    }
  };

  // Group variants by specification
  const groupedVariants = variants.reduce(
    (acc, variant) => {
      const spec = variant.specification || "Variante";
      if (!acc[spec]) {
        acc[spec] = [];
      }
      acc[spec].push(variant);
      return acc;
    },
    {} as Record<string, typeof variants>,
  );

  // If all variants have the same specification, render as simple list
  const specs = Object.keys(groupedVariants);
  const isSingleSpec = specs.length === 1;

  if (variants.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {!isSingleSpec && (
        <p className="text-body-medium text-dark-900">Select Specification</p>
      )}

      <div className="space-y-3">
        {specs.map((spec) => (
          <div key={spec}>
            {!isSingleSpec && (
              <p className="mb-2 text-caption text-dark-700">{spec}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {groupedVariants[spec].map((variant) => {
                const isActive = selected === variant.id;
                return (
                  <button
                    key={variant.id}
                    onClick={() => handleSelect(variant.id)}
                    className={`rounded-lg border px-4 py-2 text-body transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] ${
                      isActive
                        ? "border-dark-900 bg-dark-900 text-light-100"
                        : "border-light-300 text-dark-700 hover:border-dark-500"
                    }`}
                  >
                    {variant.specification || "variante"}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
