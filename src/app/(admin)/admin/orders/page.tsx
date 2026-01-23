import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllOrders } from "@/lib/actions/admin/orders";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const orders = await getAllOrders();

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

  return (
    <div>
      <h1 className="text-heading-2 text-dark-900 mb-8">Pedidos</h1>

      <div className="rounded-lg border border-light-300 bg-light-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-light-200 border-b border-light-300">
            <tr>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                ID
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Usuario
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Total
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Fecha
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-300">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-body text-dark-500"
                >
                  No hay pedidos
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-light-200 transition-colors"
                >
                  <td className="px-6 py-4 text-body text-dark-700">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-6 py-4">
                    {order.userId ? (
                      <Link
                        href={`/admin/users/${order.userId}`}
                        className="text-body-medium text-green hover:underline"
                      >
                        {order.userName || order.userEmail || "Usuario"}
                      </Link>
                    ) : (
                      <span className="text-body text-dark-500">Anónimo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-body-medium text-dark-900">
                    ${Number(order.totalAmount).toLocaleString("es-CO")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-footnote ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body text-dark-700">
                    {new Date(order.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-body-medium text-green hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
