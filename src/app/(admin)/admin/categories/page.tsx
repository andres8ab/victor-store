import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllCategoriesForAdmin } from "@/lib/actions/admin/categories";
import { deleteCategory } from "@/lib/actions/admin/categories";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

async function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  async function deleteAction() {
    "use server";
    await deleteCategory(categoryId);
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

export default async function AdminCategoriesPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-heading-2 text-dark-900">Categorías</h1>
        {/* <Link
          href="/admin/categories/new" */}
        <div className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors">
          <Plus className="h-5 w-5" />
          Nueva Categoría
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
                Slug
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-300">
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-6 py-8 text-center text-body text-dark-500"
                >
                  No hay categorías
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-light-200 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/categories/${category.id}`}
                      className="text-body-medium text-dark-900 hover:text-green transition-colors"
                    >
                      {category.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-body text-dark-700">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="rounded-lg p-2 text-dark-700 hover:bg-light-200 transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </Link>
                      <DeleteCategoryButton categoryId={category.id} />
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
