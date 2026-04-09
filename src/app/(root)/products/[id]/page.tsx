import Link from "next/link";
import { Suspense } from "react";
import { type Metadata } from "next";
import { CollapsibleSection, Card, ProductDetails } from "@/components";
import { Star } from "lucide-react";
import {
  getProduct,
  getProductReviews,
  getRecommendedProducts,
  type Review,
  type RecommendedProduct,
} from "@/lib/actions/product";

export const revalidate = 3600; // revalidate product pages every hour

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const data = await getProduct(id);

  if (!data) {
    return { title: "Producto no encontrado" };
  }

  const { product, images } = data;
  const primaryImage =
    images.find((img) => img.isPrimary) ?? images[0];
  const price = product.salePrice
    ? Number(product.salePrice)
    : Number(product.price);
  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(price);

  const title = product.brand
    ? `${product.name} – ${product.brand.name}`
    : product.name;
  const description = `${product.description.slice(0, 145)}… ${formattedPrice}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: primaryImage
        ? [{ url: primaryImage.url, alt: product.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage.url] : [],
    },
  };
}

function NotFoundBlock() {
  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-light-300 bg-light-100 p-8 text-center">
      <h1 className="text-heading-3 text-dark-900">Product not found</h1>
      <p className="mt-2 text-body text-dark-700">
        The product you’re looking for doesn’t exist or may have been removed.
      </p>
      <div className="mt-6">
        <Link
          href="/products"
          className="inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500]"
        >
          Browse Products
        </Link>
      </div>
    </section>
  );
}

async function ReviewsSection({ productId }: { productId: string }) {
  const reviews: Review[] = await getProductReviews(productId);
  const count = reviews.length;
  const avg = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;

  return (
    <CollapsibleSection
      title={`Reseñas (${count})`}
      rightMeta={
        <span className="flex items-center gap-1 text-dark-900">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i <= Math.round(avg) ? "fill-[--color-dark-900]" : ""
              }`}
            />
          ))}
        </span>
      }
    >
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.slice(0, 10).map((r) => (
            <li key={r.id} className="rounded-lg border border-light-300 p-4">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-body-medium text-dark-900">{r.author}</p>
                <span className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= r.rating ? "fill-[--color-dark-900]" : ""
                      }`}
                    />
                  ))}
                </span>
              </div>
              {r.title && (
                <p className="text-body-medium text-dark-900">{r.title}</p>
              )}
              {r.content && (
                <p className="mt-1 line-clamp-[8] text-body text-dark-700">
                  {r.content}
                </p>
              )}
              <p className="mt-2 text-caption text-dark-700">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </CollapsibleSection>
  );
}

async function AlsoLikeSection({ productId }: { productId: string }) {
  const recs: RecommendedProduct[] = await getRecommendedProducts(productId);
  if (!recs.length) return null;
  return (
    <section className="mt-16">
      <h2 className="mb-6 text-heading-3 text-dark-900">
        También te podría interesar
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recs.map((p) => (
          <Card
            key={p.id}
            title={p.title}
            imageSrc={p.imageUrl}
            price={p.price ?? undefined}
            href={`/products/${p.id}`}
          />
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getProduct(id);

  if (!data) {
    return (
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="py-4 text-caption text-dark-700">
          <Link href="/" className="hover:underline">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/products" className="hover:underline">
            Products
          </Link>{" "}
          / <span className="text-dark-900">Not found</span>
        </nav>
        <NotFoundBlock />
      </main>
    );
  }

  const { product, images } = data;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((img) => img.url),
    ...(product.brand && {
      brand: { "@type": "Brand", name: product.brand.name },
    }),
    offers: {
      "@type": "Offer",
      priceCurrency: "COP",
      price: product.salePrice
        ? Number(product.salePrice)
        : Number(product.price),
      availability:
        product.inStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Todo Eléctrico Víctor",
      },
    },
  };

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="py-4 text-caption text-dark-700">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href="/products" className="hover:underline">
          Products
        </Link>{" "}
        / <span className="text-dark-900">{product.name}</span>
      </nav>

      <ProductDetails product={product} images={images} />

      <Suspense
        fallback={
          <section className="mt-16">
            <h2 className="mb-6 text-heading-3 text-dark-900">
              También te podría interesar
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl bg-light-200"
                />
              ))}
            </div>
          </section>
        }
      >
        <AlsoLikeSection productId={product.id} />
      </Suspense>

      <div className="mt-16">
        <Suspense
          fallback={
            <CollapsibleSection title="Reviews">
              <p className="text-body text-dark-700">Loading reviews…</p>
            </CollapsibleSection>
          }
        >
          <ReviewsSection productId={product.id} />
        </Suspense>
      </div>
    </main>
  );
}
