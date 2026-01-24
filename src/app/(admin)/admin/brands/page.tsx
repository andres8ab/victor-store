import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllBrandsForAdmin } from "@/lib/actions/admin/brands";
import Link from "next/link";
import { Plus } from "lucide-react";
import BrandsTable from "@/components/admin/BrandsTable";

export default async function AdminBrandsPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const brands = await getAllBrandsForAdmin();

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-heading-2 text-dark-900">Marcas</h1>
        {/* <Link
          href="/admin/brands/new" */}
        <div className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-body-medium text-light-100 hover:bg-opacity-90 transition-colors">
          <Plus className="h-5 w-5" />
          Nueva Marca
        </div>
        {/* </Link> */}
      </div>

      <BrandsTable brands={brands} />
    </div>
  );
}
