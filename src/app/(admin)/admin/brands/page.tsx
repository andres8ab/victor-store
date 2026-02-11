import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";

import { getAllBrandsForAdmin } from "@/lib/actions/admin/brands";
import BrandsTable from "@/components/admin/BrandsTable";
import CreateBrandButton from "@/components/admin/CreateBrandButton";

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
        <CreateBrandButton />
      </div>

      <BrandsTable brands={brands} />
    </div>
  );
}
