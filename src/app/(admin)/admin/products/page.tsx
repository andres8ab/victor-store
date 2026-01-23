import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllProductsForAdmin } from "@/lib/actions/admin/products";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  toggleProductPublished,
  deleteProduct,
} from "@/lib/actions/admin/products";

async function ToggleProductButton({
  productId,
  isPublished,
}: {
  productId: string;
  isPublished: boolean;
}) {
  return (
    <form action={toggleProductPublished}>
      <input type="hidden" name="id" value={productId} />
      <input type="hidden" name="isPublished" value={String(!isPublished)} />
      <button
        type="submit"
        className={`rounded-lg p-2 transition-colors ${
          isPublished
            ? "text-green hover:bg-light-200"
            : "text-dark-500 hover:bg-light-200"
        }`}
        title={isPublished ? "Despublicar" : "Publicar"}
      >
        {isPublished ? (
          <Eye className="h-5 w-5" />
        ) : (
          <EyeOff className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}

async function DeleteProductButton({ productId }: { productId: string }) {
  async function deleteAction() {
    "use server";
    await deleteProduct(productId);
  }

  return (
    <form action={deleteAction}>
      <button
        type="submit"
        className="rounded-lg p-2 text-red hover:bg-light-200 transition-colors"
        title="Eliminar"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </form>
  );
}

export default async function AdminProductsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const products = await getAllProductsForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-heading-2 text-dark-900">Productos</h1>
        {/* <Link
          href="/admin/products/new" */}
        <div className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors">
          <Plus className="h-5 w-5" />
          Nuevo Producto
        </div>
        {/* </Link> */}
      </div>

      <div className="rounded-lg border border-light-300 bg-light-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-light-200 border-b border-light-300">
            <tr>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Categoría
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Marca
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Variantes
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-300">
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-body text-dark-500"
                >
                  No hay productos
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-light-200 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-body-medium text-dark-900 hover:text-green transition-colors"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-body text-dark-700">
                    {product.categoryName || "-"}
                  </td>
                  <td className="px-6 py-4 text-body text-dark-700">
                    {product.brandName || "-"}
                  </td>
                  <td className="px-6 py-4 text-body text-dark-700">
                    {product.variantCount}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-footnote ${
                        product.isPublished
                          ? "bg-green/20 text-green"
                          : "bg-dark-500/20 text-dark-500"
                      }`}
                    >
                      {product.isPublished ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-lg p-2 text-dark-700 hover:bg-light-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <ToggleProductButton
                        productId={product.id}
                        isPublished={product.isPublished}
                      />
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
