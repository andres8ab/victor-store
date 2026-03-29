"use client";

import { Carousel } from "primereact/carousel";
import { Card } from "@/components";

type Product = {
  id: string;
  name: string;
  imageUrl: string | null;
  price: number | null;
  salePrice: number | null;
  subtitle?: string | null;
};

interface ProductCarouselProps {
  title: string;
  products: Product[];
  /** Visual order label on the home page (01, 02, …) */
  sectionIndex?: number;
}

export default function ProductCarousel({
  title,
  products,
  sectionIndex,
}: ProductCarouselProps) {
  const responsiveOptions = [
    { breakpoint: "2000px", numVisible: 4, numScroll: 1 },
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
    return (
      <div className="p-2">
        <Card
          title={product.name}
          subtitle={product.subtitle ?? undefined}
          imageSrc={product.imageUrl ?? "/parts/noImage.png"}
          price={product.price ?? undefined}
          salePrice={product.salePrice ?? undefined}
          href={`/products/${product.id}`}
        />
      </div>
    );
  };

  const indexLabel =
    sectionIndex != null ? String(sectionIndex).padStart(2, "0") : null;

  return (
    <section className="relative border-l-2 border-primary-500/40 pl-5 sm:pl-7">
      {indexLabel && (
        <span
          className="font-display absolute -left-px top-0 hidden -translate-x-[0.15em] -translate-y-1 text-5xl leading-none text-primary-500/20 select-none sm:block sm:text-6xl"
          aria-hidden
        >
          {indexLabel}
        </span>
      )}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-caption font-medium uppercase tracking-[0.25em] text-dark-500">
            Catálogo
          </p>
          <h2 className="font-display mt-1 text-3xl tracking-tight text-dark-900 sm:text-4xl">
            {title}
          </h2>
        </div>
        <div className="hidden h-px flex-1 bg-linear-to-r from-light-300 to-transparent sm:ml-8 sm:block" />
      </div>
      <Carousel
        value={paddedProducts}
        numVisible={maxVisible}
        numScroll={1}
        responsiveOptions={responsiveOptions}
        itemTemplate={productTemplate}
        circular
        showIndicators={false}
        autoplayInterval={3000}
        pt={{
          itemsContent: { className: "gap-4" },
        }}
      />
    </section>
  );
}
