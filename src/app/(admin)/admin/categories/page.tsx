import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllCategoriesForAdmin } from "@/lib/actions/admin/categories";

import CategoriesTable from "@/components/admin/CategoriesTable";
import CreateCategoryButton from "@/components/admin/CreateCategoryButton";

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
        <CreateCategoryButton categories={categories} />
      </div>

      <CategoriesTable categories={categories} />
    </div>
  );
}
