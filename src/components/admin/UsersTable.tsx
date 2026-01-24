"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Link from "next/link";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  orderCount: number;
  createdAt: Date;
};

type Props = {
  users: User[];
};

export default function UsersTable({ users }: Props) {
  const nameBodyTemplate = (rowData: User) => {
    return (
      <span className="text-body-medium text-dark-900">
        {rowData.name || "-"}
      </span>
    );
  };

  const roleBodyTemplate = (rowData: User) => {
    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-footnote ${
          rowData.role === "admin"
            ? "bg-green/20 text-green"
            : "bg-dark-500/20 text-dark-500"
        }`}
      >
        {rowData.role === "admin" ? "Admin" : "Usuario"}
      </span>
    );
  };

  const dateBodyTemplate = (rowData: User) => {
    return (
      <span className="text-body text-dark-700">
        {new Date(rowData.createdAt).toLocaleDateString("es-CO", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </span>
    );
  };

  const actionsBodyTemplate = (rowData: User) => {
    return (
      <Link
        href={`/admin/users/${rowData.id}`}
        className="text-body-medium text-green hover:underline"
      >
        Ver detalle
      </Link>
    );
  };

  return (
    <div className="rounded-lg border border-light-300 bg-light-100 overflow-hidden">
      <DataTable
        value={users}
        emptyMessage="No hay usuarios"
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
          style={{ minWidth: "150px" }}
        />
        <Column
          field="email"
          header="Email"
          sortable
          style={{ minWidth: "200px" }}
        />
        <Column
          field="role"
          header="Rol"
          body={roleBodyTemplate}
          sortable
        />
        <Column
          field="orderCount"
          header="Pedidos"
          sortable
        />
        <Column
          field="createdAt"
          header="Fecha de Registro"
          body={dateBodyTemplate}
          sortable
          style={{ minWidth: "150px" }}
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
