import Hero from "@/components/home/Hero";
import ProductCarousel from "@/components/home/ProductCarousel";
import {
  getFeaturedProducts,
  getLatestProducts,
  getMostPurchasedProducts,
} from "@/lib/actions/product";

export const dynamic = "force-dynamic";

const Home = async () => {
  const ITEMS_PER_SECTION = 10;
  const FETCH_LIMIT = 60;

  const [latestRaw, mostPurchasedRaw, featuredRaw] = await Promise.all([
    getLatestProducts(FETCH_LIMIT),
    getMostPurchasedProducts(FETCH_LIMIT),
    getFeaturedProducts(FETCH_LIMIT),
  ]);

  const latest = latestRaw.slice(0, ITEMS_PER_SECTION);

  const usedIds = new Set(latest.map((p) => p.id));

  const mostPurchased = mostPurchasedRaw
    .filter((p) => !usedIds.has(p.id))
    .slice(0, ITEMS_PER_SECTION);
  mostPurchased.forEach((p) => usedIds.add(p.id));

  const featured = featuredRaw
    .filter((p) => !usedIds.has(p.id))
    .slice(0, ITEMS_PER_SECTION);

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
      <div className="space-y-16 pb-16 pt-8 md:space-y-20 md:pb-24 md:pt-10">
        <Hero />

        {latest.length > 0 && (
          <ProductCarousel
            title="Lo Más Nuevo"
            products={latest}
            sectionIndex={1}
          />
        )}

        {mostPurchased.length > 0 && (
          <ProductCarousel
            title="Más Vendidos"
            products={mostPurchased}
            sectionIndex={2}
          />
        )}

        {featured.length > 0 && (
          <ProductCarousel
            title="Destacados"
            products={featured}
            sectionIndex={3}
          />
        )}
      </div>
    </main>
  );
};

export default Home;
