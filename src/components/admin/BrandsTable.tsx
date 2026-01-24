"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteBrand } from "@/lib/actions/admin/brands";
import { useRouter } from "next/navigation";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

type Props = {
  brands: Brand[];
};

export default function BrandsTable({ brands }: Props) {
  const router = useRouter();

  const handleDelete = async (brandId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta marca?")) {
      await deleteBrand(brandId);
      router.refresh();
    }
  };
  const nameBodyTemplate = (rowData: Brand) => {
    return (
      <Link
        href={`/admin/brands/${rowData.id}`}
        className="text-body-medium text-dark-900 hover:text-green transition-colors"
      >
        {rowData.name}
      </Link>
    );
  };

  const logoBodyTemplate = (rowData: Brand) => {
    return rowData.logoUrl ? (
      <img
        src={rowData.logoUrl}
        alt={rowData.name}
        className="h-8 w-8 object-contain"
      />
    ) : (
      <span className="text-body text-dark-500">-</span>
    );
  };

  const actionsBodyTemplate = (rowData: Brand) => {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/brands/${rowData.id}`}
          className="rounded-lg p-2 text-dark-700 hover:bg-light-200 transition-colors"
          title="Editar"
        >
          <Edit className="h-5 w-5" />
        </Link>
        <button
          onClick={() => handleDelete(rowData.id)}
          className="rounded-lg p-2 text-red hover:bg-light-200 transition-colors"
          title="Eliminar"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-light-300 bg-light-100 overflow-hidden">
      <DataTable
        value={brands}
        emptyMessage="No hay marcas"
        className="p-datatable-sm"
        responsiveLayout="scroll"
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} a {last} de {totalRecords}"
      >
        <Column
          field="name"
          header="Nombre"
          body={nameBodyTemplate}
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column
          field="slug"
          header="Slug"
          sortable
        />
        <Column
          field="logoUrl"
          header="Logo"
          body={logoBodyTemplate}
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          style={{ minWidth: "120px" }}
        />
      </DataTable>
    </div>
  );
}
