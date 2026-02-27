import { Card } from "@/components";
import { getAllCategories } from "@/lib/actions/category";
import { getAllProducts } from "@/lib/actions/product";
import Link from "next/link";

export default async function CategoriesPage() {
  const categories = await getAllCategories();
  const categorySlugs = categories.map((c) => c.slug);

  // Get products for each category
  const categoryProducts = await Promise.all(
    categories.map(async (category) => {
      const { products } = await getAllProducts({
        categorySlugs: [category.slug],
        limit: 6,
      });
      return { category, products };
    }),
  );

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <header className="py-6">
        <h1 className="text-heading-2 text-dark-900">Categorías</h1>
        <p className="mt-2 text-body text-dark-700">
          Explora nuestros productos por categoría
        </p>
      </header>

      <section className="space-y-12 pb-12">
        {categoryProducts.map(({ category, products }) => (
          <div key={category.id}>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-heading-3 text-dark-900">{category.name}</h2>
              <Link
                href={`/products?category[]=${category.slug}`}
                className="text-body-medium text-dark-900 transition-colors hover:text-dark-700"
              >
                Ver todos →
              </Link>
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <Card
                    key={p.id}
                    title={p.name}
                    subtitle={p.subtitle ?? undefined}
                    imageSrc={p.imageUrl ?? "/parts/noImage.png"}
                    price={p.price ?? undefined}
                    salePrice={p.salePrice ?? undefined}
                    href={`/products/${p.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-light-300 p-8 text-center">
                <p className="text-body text-dark-700">
                  No hay productos en esta categoría aún.
                </p>
              </div>
            )}
          </div>
        ))}
      </section>
    </main>
  );
}
