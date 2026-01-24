"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import CreateVariantModal from "./CreateVariantModal";

type Color = {
  id: string;
  name: string;
};

type Size = {
  id: string;
  name: string;
};

type Variant = {
  id: string;
  sku: string;
  price: number;
  salePrice: number | null;
  inStock: number;
  isActive: boolean;
  colorId: string | null;
  sizeId: string | null;
  specification: string | null;
};

export default function VariantsList({
  productId,
  variants,
  colors,
  sizes,
  ToggleVariantButton,
}: {
  productId: string;
  variants: Variant[];
  colors: Color[];
  sizes: Size[];
  ToggleVariantButton: (props: {
    variantId: string;
    isActive: boolean;
  }) => React.ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-light-300 bg-light-100 px-4 py-2 text-body-medium text-dark-900 hover:bg-light-200 transition-colors"
      >
        <Plus className="h-5 w-5" />
        Nueva Variante
      </button>

      <CreateVariantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        colors={colors}
        sizes={sizes}
      />

      {variants.length === 0 ? (
        <p className="text-body text-dark-500">No hay variantes</p>
      ) : (
        <div className="space-y-2">
          {variants.map((variant) => (
            <div
              key={variant.id}
              className={`rounded-lg border p-4 ${variant.isActive
                ? "border-light-300 bg-light-100"
                : "border-dark-500/30 bg-light-200 opacity-60"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-body-medium text-dark-900">
                      SKU: {variant.sku}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-footnote ${variant.isActive
                        ? "bg-green/20 text-green"
                        : "bg-dark-500/20 text-dark-500"
                        }`}
                    >
                      {variant.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  <p className="text-body text-dark-700">
                    Precio: ${variant.price.toLocaleString("es-CO")}
                  </p>
                  {variant.salePrice && (
                    <p className="text-body text-dark-500">
                      Precio de oferta: $
                      {variant.salePrice.toLocaleString("es-CO")}
                    </p>
                  )}
                  <p className="text-body text-dark-500">
                    Stock: {variant.inStock}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${productId}/variants/${variant.id}`}
                    className="rounded-lg p-2 text-dark-700 hover:bg-light-200 transition-colors"
                    title="Editar"
                  >
                    Editar
                  </Link>
                  {ToggleVariantButton({
                    variantId: variant.id,
                    isActive: variant.isActive,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
