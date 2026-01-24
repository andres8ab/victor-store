import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllCategoriesForAdmin } from "@/lib/actions/admin/categories";
import Link from "next/link";
import { Plus } from "lucide-react";
import CategoriesTable from "@/components/admin/CategoriesTable";

export default async function AdminCategoriesPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const categories = await getAllCategoriesForAdmin();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-heading-2 text-dark-900">Categorías</h1>
        {/* <Link
          href="/admin/categories/new" */}
        <div className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors">
          <Plus className="h-5 w-5" />
          Nueva Categoría
        </div>
        {/* </Link> */}
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
