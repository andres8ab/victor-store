"use client";

import { Carousel } from "primereact/carousel";
import { Card } from "@/components";

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
    { breakpoint: "1400px", numVisible: 4, numScroll: 1 },
    { breakpoint: "1199px", numVisible: 3, numScroll: 1 },
    { breakpoint: "767px", numVisible: 2, numScroll: 1 },
    { breakpoint: "575px", numVisible: 1, numScroll: 1 },
  ];

  // Default numVisible for screens larger than the largest breakpoint
  const maxVisible = 4;

  const paddedProducts = (() => {
    if (products.length === 0) return products;
    if (products.length >= maxVisible) return products;

    const repeated: Product[] = [];
    while (repeated.length < maxVisible) {
      repeated.push(...products);
    }
    return repeated.slice(0, maxVisible);
  })();

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
          imageSrc={product.imageUrl ?? "/parts/noImage.png"}
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
        value={paddedProducts}
        numVisible={maxVisible}
        numScroll={1}
        responsiveOptions={responsiveOptions}
        itemTemplate={productTemplate}
        circular
        autoplayInterval={3000}
        showIndicators={false}
        pt={{
          itemsContent: { className: "gap-4" },
        }}
      />
    </section>
  );
}
