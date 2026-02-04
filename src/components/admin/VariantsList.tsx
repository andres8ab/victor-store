"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import CreateVariantModal from "./CreateVariantModal";

type Variant = {
  id: string;
  name: string;
  image: string | null;
  price: number;
  salePrice: number | null;
  inStock: number;
  isActive: boolean;
};

export default function VariantsList({
  productId,
  variants,
}: {
  productId: string;
  variants: Variant[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localVariants, setLocalVariants] = useState<Variant[]>(variants);
  const [loadingId, setLoadingId] = useState<string | null>(null);
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
      />

      {localVariants.length === 0 ? (
        <p className="text-body text-dark-500">No hay variantes</p>
      ) : (
        <div className="space-y-2">
          {localVariants.map((variant) => (
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
                      {variant.name}
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
                  <button
                    type="button"
                    onClick={async () => {
                      if (loadingId) return;
                      setLoadingId(variant.id);
                      try {
                        const res = await fetch("/api/admin/variants/toggle", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            variantId: variant.id,
                            isActive: !variant.isActive,
                          }),
                        });
                        if (!res.ok) throw new Error("Request failed");
                        setLocalVariants((prev) =>
                          prev.map((v) => (v.id === variant.id ? { ...v, isActive: !v.isActive } : v)),
                        );
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setLoadingId(null);
                      }
                    }}
                    className={`rounded-lg p-2 transition-colors ${variant.isActive
                      ? "text-green hover:bg-light-200"
                      : "text-dark-500 hover:bg-light-200"
                      }`}
                    title={variant.isActive ? "Desactivar" : "Activar"}
                    disabled={!!loadingId}
                  >
                    {variant.isActive ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.9 21.9 0 0 1 5.06-6.06"/><path d="M1 1l22 22"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
