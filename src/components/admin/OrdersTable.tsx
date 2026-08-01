"use client";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Link from "next/link";
import { PaymentBadges } from "@/components";

type Order = {
  id: string;
  userId: string | null;
  status: string;
  totalAmount: number;
  createdAt: Date;
  userName: string | null;
  userEmail: string | null;
  paymentMethod: string | null;
  paymentStatus: string | null;
};

type Props = {
  readonly orders: Order[];
};

const orderStatusConfig: Record<string, { label: string; className: string }> =
  {
    pending: { label: "Pendiente", className: "bg-orange/20 text-orange" },
    paid: { label: "Pagado", className: "bg-green/20 text-green" },
    shipped: { label: "Enviado", className: "bg-blue-500/20 text-blue-500" },
    delivered: { label: "Entregado", className: "bg-green/20 text-green" },
    cancelled: { label: "Cancelado", className: "bg-red/20 text-red" },
  };

export default function OrdersTable({ orders }: Props) {
  const idBodyTemplate = (rowData: Order) => (
    <span className="text-body text-dark-700">{rowData.id.slice(0, 8)}...</span>
  );

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

  const totalBodyTemplate = (rowData: Order) => (
    <span className="text-body-medium text-dark-900">
      ${Number(rowData.totalAmount).toLocaleString("es-CO")}
    </span>
  );

  const paymentBodyTemplate = (rowData: Order) => {
    if (!rowData.paymentMethod) {
      const cfg = orderStatusConfig[rowData.status];
      return (
        <span
          className={`inline-block rounded-full px-3 py-1 text-footnote ${cfg?.className ?? "bg-dark-500/20 text-dark-500"}`}
        >
          {cfg?.label ?? rowData.status}
        </span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        <PaymentBadges
          paymentMethod={rowData.paymentMethod}
          paymentStatus={rowData.paymentStatus}
        />
      </div>
    );
  };

  const dateBodyTemplate = (rowData: Order) => (
    <span className="text-body text-dark-700">
      {new Date(rowData.createdAt).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </span>
  );

  const actionsBodyTemplate = (rowData: Order) => (
    <Link
      href={`/admin/orders/${rowData.id}`}
      className="text-body-medium text-green hover:underline"
    >
      Ver detalle
    </Link>
  );

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
          field="paymentMethod"
          header="Pago"
          body={paymentBodyTemplate}
          sortable
          style={{ minWidth: "160px" }}
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
