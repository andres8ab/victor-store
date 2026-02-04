"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export interface VariantSelectorProps {
  variants: Array<{
    id: string;
    name: string;
    image: string | null;
    inStock: number;
  }>;
  selectedVariantId: string;
  onSelectVariant: (id: string) => void;
  className?: string;
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  className,
}: VariantSelectorProps) {
  if (variants.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <p className="text-body-medium text-dark-900">
        Variante: <span className="text-dark-700 font-normal">{variants.find(v => v.id === selectedVariantId)?.name}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = variant.inStock === 0;

          return (
            <button
              key={variant.id}
              onClick={() => !isOutOfStock && onSelectVariant(variant.id)}
              disabled={isOutOfStock}
              className={cn(
                "group relative flex items-center gap-2 rounded-lg border px-3 py-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]",
                isSelected
                  ? "border-dark-900 bg-dark-900 text-light-100"
                  : "border-light-300 text-dark-700 hover:border-dark-500 bg-white",
                isOutOfStock && "opacity-50 cursor-not-allowed bg-light-100"
              )}
            >
              {variant.image && (
                <div className="relative h-8 w-8 overflow-hidden rounded bg-light-200">
                  <Image
                    src={variant.image}
                    alt={variant.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
              )}
              <span className="text-body-small font-medium">{variant.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
