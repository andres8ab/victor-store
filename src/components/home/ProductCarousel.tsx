"use client";

import { Carousel } from "primereact/carousel";
import { Card } from "@/components";
// We need to import the type, but it's not exported from the action file directly as a named export easily reusable in client components if it relies on server types.
// However, looking at the code, ProductListItem is defined in product.ts.
// Let's define a local interface compatible with it to avoid importing server actions in client component if we can avoid it, or just import types.
// Actually, importing types from server actions file is fine.

type Product = {
    id: string;
    name: string;
    imageUrl: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    subtitle?: string | null;
};

interface ProductCarouselProps {
    title: string;
    products: Product[];
}

export default function ProductCarousel({
    title,
    products,
}: ProductCarouselProps) {
    const responsiveOptions = [
        {
            breakpoint: "1400px",
            numVisible: 4,
            numScroll: 1,
        },
        {
            breakpoint: "1199px",
            numVisible: 3,
            numScroll: 1,
        },
        {
            breakpoint: "767px",
            numVisible: 2,
            numScroll: 1,
        },
        {
            breakpoint: "575px",
            numVisible: 1,
            numScroll: 1,
        },
    ];

    const productTemplate = (product: Product) => {
        const price =
            product.minPrice !== null &&
                product.maxPrice !== null &&
                product.minPrice !== product.maxPrice
                ? `$${product.minPrice.toFixed(2)} - $${product.maxPrice.toFixed(2)}`
                : product.minPrice !== null
                    ? product.minPrice
                    : undefined;

        return (
            <div className="p-2">
                <Card
                    title={product.name}
                    subtitle={product.subtitle ?? undefined}
                    imageSrc={product.imageUrl ?? "/parts/1.jpg"} // Fallback image
                    price={price}
                    href={`/products/${product.id}`}
                />
            </div>
        );
    };

    return (
        <section className="py-8">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-heading-3 text-dark-900">{title}</h2>
            </div>
            <Carousel
                value={products}
                numVisible={4}
                numScroll={1}
                responsiveOptions={responsiveOptions}
                itemTemplate={productTemplate}
                circular
                autoplayInterval={3000}
                showIndicators={false}
                pt={{
                    itemsContent: { className: 'gap-4' }
                }}
            />
        </section>
    );
}
