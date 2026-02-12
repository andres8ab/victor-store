"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { deleteCategory } from "@/lib/actions/admin/categories";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CategoryModal from "./CategoryModal";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
};

type Props = {
  categories: Category[];
};

export default function CategoriesTable({ categories }: Props) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleDelete = async (categoryId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      await deleteCategory(categoryId);
      router.refresh();
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const nameBodyTemplate = (rowData: Category) => {
    // Also making the name clickable to open modal, as per user's implication on BrandsTable pattern
    return (
      <button
        onClick={() => openEditModal(rowData)}
        className="text-body-medium text-dark-900 hover:text-green transition-colors text-left"
      >
        {rowData.name}
      </button>
    );
  };

  const actionsBodyTemplate = (rowData: Category) => {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => openEditModal(rowData)}
          className="rounded-lg p-2 text-dark-700 hover:bg-light-200 transition-colors"
          title="Editar"
        >
          <Edit className="h-5 w-5" />
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
    <>
      <div className="rounded-lg border border-light-300 bg-light-100 overflow-hidden">
        <DataTable
          value={categories}
          emptyMessage="No hay categorías"
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
            header="Acciones"
            body={actionsBodyTemplate}
            style={{ minWidth: "120px" }}
          />
        </DataTable>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        categories={categories}
        initialData={selectedCategory}
      />
    </>
  );
}
