"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Link from "next/link";
import { Edit, Eye, EyeOff, Trash2 } from "lucide-react";
import { toggleProductPublished, deleteProduct } from "@/lib/actions/admin/products";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  categoryName: string | null;
  brandName: string | null;
  variantCount: number;
  isPublished: boolean;
};

type Props = {
  products: Product[];
};

export default function ProductsTable({ products }: Props) {
  const router = useRouter();

  const handleToggle = async (productId: string, isPublished: boolean) => {
    await toggleProductPublished({
      id: productId,
      isPublished: !isPublished,
    });
    router.refresh();
  };

  const handleDelete = async (productId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      await deleteProduct(productId);
      router.refresh();
    }
  };
  const nameBodyTemplate = (rowData: Product) => {
    return (
      <Link
        href={`/admin/products/${rowData.id}`}
        className="text-body-medium text-dark-900 hover:text-green transition-colors"
      >
        {rowData.name}
      </Link>
    );
  };

  const statusBodyTemplate = (rowData: Product) => {
    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-footnote ${
          rowData.isPublished
            ? "bg-green/20 text-green"
            : "bg-dark-500/20 text-dark-500"
        }`}
      >
        {rowData.isPublished ? "Publicado" : "Borrador"}
      </span>
    );
  };

  const actionsBodyTemplate = (rowData: Product) => {
    return (
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/products/${rowData.id}`}
          className="rounded-lg p-2 text-dark-700 hover:bg-light-200 transition-colors"
          title="Editar"
        >
          <Edit className="h-5 w-5" />
        </Link>
        <button
          onClick={() => handleToggle(rowData.id, rowData.isPublished)}
          className={`rounded-lg p-2 transition-colors ${
            rowData.isPublished
              ? "text-green hover:bg-light-200"
              : "text-dark-500 hover:bg-light-200"
          }`}
          title={rowData.isPublished ? "Despublicar" : "Publicar"}
        >
          {rowData.isPublished ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </button>
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
        value={products}
        emptyMessage="No hay productos"
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
          field="categoryName"
          header="Categoría"
          body={(rowData) => rowData.categoryName || "-"}
          sortable
        />
        <Column
          field="brandName"
          header="Marca"
          body={(rowData) => rowData.brandName || "-"}
          sortable
        />
        <Column
          field="variantCount"
          header="Variantes"
          sortable
        />
        <Column
          field="isPublished"
          header="Estado"
          body={statusBodyTemplate}
          sortable
        />
        <Column
          header="Acciones"
          body={actionsBodyTemplate}
          style={{ minWidth: "150px" }}
        />
      </DataTable>
    </div>
  );
}
