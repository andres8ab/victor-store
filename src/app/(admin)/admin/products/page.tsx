import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllProductsForAdmin } from "@/lib/actions/admin/products";
import { getAllCategoriesForAdmin } from "@/lib/actions/admin/categories";
import { getAllBrandsForAdmin } from "@/lib/actions/admin/brands";
import ProductsTable from "@/components/admin/ProductsTable";
import CreateProductButton from "@/components/admin/CreateProductButton";

export default async function AdminProductsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const products = await getAllProductsForAdmin();
  const categories = await getAllCategoriesForAdmin();
  const brands = await getAllBrandsForAdmin();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-heading-2 text-dark-900">Productos</h1>
        <CreateProductButton categories={categories} brands={brands} />
      </div>

      <ProductsTable products={products} />
    </div>
  );
}
