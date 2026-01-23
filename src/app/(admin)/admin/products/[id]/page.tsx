import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getProductWithVariantsForAdmin } from "@/lib/actions/admin/products";
import { getAllCategoriesForAdmin } from "@/lib/actions/admin/categories";
import { getAllBrandsForAdmin } from "@/lib/actions/admin/brands";
import { toggleProductPublished, toggleVariantActive } from "@/lib/actions/admin/products";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";
import VariantsList from "@/components/admin/VariantsList";

async function ToggleVariantButton({
  variantId,
  isActive,
}: {
  variantId: string;
  isActive: boolean;
}) {
  async function toggleAction() {
    "use server";
    await toggleVariantActive(variantId, !isActive);
  }

  return (
    <form action={toggleAction}>
      <button
        type="submit"
        className={`rounded-lg p-2 transition-colors ${
          isActive
            ? "text-green hover:bg-light-200"
            : "text-dark-500 hover:bg-light-200"
        }`}
        title={isActive ? "Desactivar" : "Activar"}
      >
        {isActive ? (
          <Eye className="h-5 w-5" />
        ) : (
          <EyeOff className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const { id } = await params;
  const product = await getProductWithVariantsForAdmin(id);
  const categories = await getAllCategoriesForAdmin();
  const brands = await getAllBrandsForAdmin();

  if (!product) {
    return (
      <div>
        <p className="text-body text-dark-500">Producto no encontrado</p>
        <Link
          href="/admin/products"
          className="mt-4 inline-block text-body-medium text-green hover:underline"
        >
          Volver a productos
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/products"
        className="mb-6 inline-flex items-center gap-2 text-body text-dark-700 hover:text-dark-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a productos
      </Link>

      <div className="mb-8">
        <h1 className="text-heading-2 text-dark-900 mb-2">{product.name}</h1>
        <div className="flex items-center gap-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-footnote ${
              product.isPublished
                ? "bg-green/20 text-green"
                : "bg-dark-500/20 text-dark-500"
            }`}
          >
            {product.isPublished ? "Publicado" : "Borrador"}
          </span>
          <form action={toggleProductPublished}>
            <input type="hidden" name="id" value={product.id} />
            <input
              type="hidden"
              name="isPublished"
              value={String(!product.isPublished)}
            />
            <button
              type="submit"
              className="text-body-medium text-green hover:underline"
            >
              {product.isPublished ? "Despublicar" : "Publicar"}
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-heading-3 text-dark-900 mb-4">
            Información del Producto
          </h2>
          <ProductForm
            product={product}
            categories={categories}
            brands={brands}
          />
        </div>

        <div>
          <h2 className="text-heading-3 text-dark-900 mb-4">Variantes</h2>
          <VariantsList
            productId={product.id}
            variants={product.variants}
            ToggleVariantButton={ToggleVariantButton}
          />
        </div>
      </div>
    </div>
  );
}
