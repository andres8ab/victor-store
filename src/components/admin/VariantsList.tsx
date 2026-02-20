"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import CreateVariantModal from "./CreateVariantModal";
import EditVariantModal from "./EditVariantModal";

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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [localVariants, setLocalVariants] = useState<Variant[]>(variants);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="flex items-center cursor-pointer gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors"
      >
        <Plus className="h-5 w-5" />
        Nueva Variante
      </button>

      <CreateVariantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        productId={productId}
      />

      <EditVariantModal
        isOpen={!!editingVariant}
        onClose={() => setEditingVariant(null)}
        variant={editingVariant}
        onUpdated={(updated) => {
          setLocalVariants((prev) =>
            prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)),
          );
          setEditingVariant(null);
        }}
      />

      {localVariants.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-light-300 bg-light-100 px-6 py-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div>
            <p className="text-body-medium text-dark-900">Este producto no tiene variantes</p>
            <p className="mt-1 text-body text-dark-500">
              Los clientes no podrán agregar este producto al carrito hasta que crees al menos una variante.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-2 flex items-center cursor-pointer gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 transition-colors hover:bg-opacity-90"
          >
            <Plus className="h-4 w-4" />
            Crear primera variante
          </button>
        </div>
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
                  <button
                    type="button"
                    onClick={() => setEditingVariant(variant)}
                    className="rounded-lg cursor-pointer p-2 text-dark-700 hover:bg-light-200 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
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
                    className={`rounded-lg p-2 cursor-pointer transition-colors ${variant.isActive
                      ? "text-green hover:bg-light-200"
                      : "text-dark-500 hover:bg-light-200"
                      }`}
                    title={variant.isActive ? "Desactivar" : "Activar"}
                    disabled={!!loadingId}
                  >
                    {variant.isActive ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" /><circle cx="12" cy="12" r="3" /></svg>
                    ) : (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.9 21.9 0 0 1 5.06-6.06" /><path d="M1 1l22 22" /></svg>
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
