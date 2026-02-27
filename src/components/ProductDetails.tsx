"use client";

import { useMemo } from "react";
import { Truck, ShieldCheck, Heart } from "lucide-react";
import ProductGallery from "./ProductGallery";
import { AddToCartButton } from "./AddToCartButton";
import CollapsibleSection from "./CollapsibleSection";
import type { FullProduct } from "@/lib/actions/product";

interface ProductDetailsProps {
    product: FullProduct["product"];
    images: FullProduct["images"];
    reviewsCount?: number;
    reviewsAvg?: number;
}

function formatPrice(price: string | number | null | undefined) {
    if (price === null || price === undefined) return undefined;
    const num = typeof price === "string" ? parseFloat(price) : price;
    return `$${num.toFixed(2)}`;
}

export default function ProductDetails({
    product,
    images,
}: ProductDetailsProps) {
    // Derived price logic from single product
    const basePrice =
        product.price !== null && product.price !== undefined
            ? Number(product.price)
            : null;
    const rawSale =
        product.salePrice !== null && product.salePrice !== undefined
            ? Number(product.salePrice)
            : null;

    let displayPrice: number | null = basePrice;
    let compareAt: number | null = null;
    let discount: number | null = null;

    if (
        rawSale !== null &&
        !Number.isNaN(rawSale) &&
        basePrice !== null &&
        !Number.isNaN(basePrice) &&
        rawSale < basePrice
    ) {
        displayPrice = rawSale;
        compareAt = basePrice;
        discount = Math.round(((basePrice - rawSale) / basePrice) * 100);
    }

    // Prepare images for gallery
    const galleryItems = useMemo(() => {
        const all = [...images];
        all.sort((a, b) => {
            if (a.isPrimary && !b.isPrimary) return -1;
            if (!a.isPrimary && b.isPrimary) return 1;
            return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
        });

        return all.map(img => ({
            url: img.url,
            id: img.id
        })).filter(img => img.url && img.url.trim().length > 0);
    }, [images]);

    const galleryUrls = galleryItems.map(i => i.url!);

    return (
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_480px]">
            {galleryUrls.length > 0 && (
                <ProductGallery
                    images={galleryUrls}
                    className="lg:sticky lg:top-6"
                />
            )}

            <div className="flex flex-col gap-6">
                <header className="flex flex-col gap-2">
                    <h1 className="text-heading-2 text-dark-900">{product.name}</h1>
                    {product.category?.name && <p className="text-body text-dark-700">{product.category.name}</p>}
                </header>

                {/* Pricing */}
                <div className="flex items-center gap-3">
                    <p className="text-lead text-dark-900">
                        {formatPrice(displayPrice)}
                    </p>
                    {compareAt !== null && discount !== null && (
                        <>
                            <span className="text-body text-dark-700 line-through">
                                {formatPrice(compareAt)}
                            </span>
                            <span className="rounded-full border border-light-300 px-2 py-1 text-caption text-[--color-green]">
                                {discount}% Dto
                            </span>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <AddToCartButton
                        productId={product.id}
                        disabled={product.inStock === 0}
                    />
                    {product.inStock === 0 && (
                        <p className="text-caption text-red-600 text-center">
                            Producto agotado
                        </p>
                    )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-light-300 bg-light-100/50 rounded-lg px-2">
                    <div className="flex flex-col items-center text-center gap-1">
                        <Truck className="w-5 h-5 text-dark-700" />
                        <span className="text-caption-small text-dark-700">Envío Rápido</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1">
                        <ShieldCheck className="w-5 h-5 text-dark-700" />
                        <span className="text-caption-small text-dark-700">Pago Seguro</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-1">
                        <Heart className="w-5 h-5 text-dark-700" />
                        <span className="text-caption-small text-dark-700">Garantía</span>
                    </div>
                </div>

                <CollapsibleSection title="Detalles del Producto" defaultOpen>
                    <p className="whitespace-pre-wrap text-body text-dark-700">{product.description}</p>
                </CollapsibleSection>

                <CollapsibleSection title="Envío y Devoluciones">
                    <p className="text-body text-dark-700">
                        Envío estándar disponible. Consulta nuestras políticas de devolución.
                    </p>
                </CollapsibleSection>
            </div>
        </section>
    );
}
