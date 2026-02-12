import Hero from "@/components/home/Hero";
import ProductCarousel from "@/components/home/ProductCarousel";
import {
  getFeaturedProducts,
  getLatestProducts,
  getMostPurchasedProducts,
} from "@/lib/actions/product";

export const dynamic = "force-dynamic";

const Home = async () => {
  const [latest, mostPurchased, featured] = await Promise.all([
    getLatestProducts(8),
    getMostPurchasedProducts(8),
    getFeaturedProducts(8),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="space-y-12 pb-12 pt-6">
        <Hero />

        {latest.length > 0 && (
          <ProductCarousel title="Lo Más Nuevo" products={latest} />
        )}

        {mostPurchased.length > 0 && (
          <ProductCarousel
            title="Más Vendidos"
            products={mostPurchased}
          />
        )}

        {featured.length > 0 && (
          <ProductCarousel
            title="Destacados"
            products={featured}
          />
        )}
      </div>
    </main>
  );
};

export default Home;
