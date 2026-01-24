"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Link from "next/link";

type Order = {
  id: string;
  userId: string | null;
  status: string;
  totalAmount: number;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
};

type Props = {
  orders: Order[];
};

export default function OrdersTable({ orders }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange/20 text-orange";
      case "paid":
        return "bg-green/20 text-green";
      case "shipped":
        return "bg-blue-500/20 text-blue-500";
      case "delivered":
        return "bg-green/20 text-green";
      case "cancelled":
        return "bg-red/20 text-red";
      default:
        return "bg-dark-500/20 text-dark-500";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendiente",
      paid: "Pagado",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  const idBodyTemplate = (rowData: Order) => {
    return <span className="text-body text-dark-700">{rowData.id.slice(0, 8)}...</span>;
  };

  const userBodyTemplate = (rowData: Order) => {
    if (rowData.userId) {
      return (
        <Link
          href={`/admin/users/${rowData.userId}`}
          className="text-body-medium text-green hover:underline"
        >
          {rowData.userName || rowData.userEmail || "Usuario"}
        </Link>
      );
    }
    return <span className="text-body text-dark-500">Anónimo</span>;
  };

  const totalBodyTemplate = (rowData: Order) => {
    return (
      <span className="text-body-medium text-dark-900">
        ${Number(rowData.totalAmount).toLocaleString("es-CO")}
      </span>
    );
  };

  const statusBodyTemplate = (rowData: Order) => {
    return (
      <span
        className={`inline-block rounded-full px-3 py-1 text-footnote ${getStatusColor(
          rowData.status
        )}`}
      >
        {getStatusLabel(rowData.status)}
      </span>
    );
  };

  const dateBodyTemplate = (rowData: Order) => {
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

  const actionsBodyTemplate = (rowData: Order) => {
    return (
      <Link
        href={`/admin/orders/${rowData.id}`}
        className="text-body-medium text-green hover:underline"
      >
        Ver detalle
      </Link>
    );
  };

  return (
    <div className="rounded-lg border border-light-300 bg-light-100 overflow-hidden">
      <DataTable
        value={orders}
        emptyMessage="No hay pedidos"
        className="p-datatable-sm"
        responsiveLayout="scroll"
        paginator
        rows={10}
        rowsPerPageOptions={[10, 25, 50]}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} a {last} de {totalRecords}"
      >
        <Column
          field="id"
          header="ID"
          body={idBodyTemplate}
          sortable
          style={{ minWidth: "120px" }}
        />
        <Column
          field="userName"
          header="Usuario"
          body={userBodyTemplate}
          sortable
          style={{ minWidth: "150px" }}
        />
        <Column
          field="totalAmount"
          header="Total"
          body={totalBodyTemplate}
          sortable
        />
        <Column
          field="status"
          header="Estado"
          body={statusBodyTemplate}
          sortable
        />
        <Column
          field="createdAt"
          header="Fecha"
          body={dateBodyTemplate}
          sortable
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
