import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getUserById } from "@/lib/actions/admin/users";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return (
      <div>
        <p className="text-body text-dark-500">Usuario no encontrado</p>
        <Link
          href="/admin/users"
          className="mt-4 inline-block text-body-medium text-green hover:underline"
        >
          Volver a usuarios
        </Link>
      </div>
    );
  }

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
      <Link
        href="/admin/users"
        className="mb-6 inline-flex items-center gap-2 text-body text-dark-700 hover:text-dark-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a usuarios
      </Link>

      <div className="mb-8">
        <h1 className="text-heading-2 text-dark-900 mb-4">
          {user.name || user.email}
        </h1>
        <div className="flex items-center gap-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-footnote ${
              user.role === "admin"
                ? "bg-green/20 text-green"
                : "bg-dark-500/20 text-dark-500"
            }`}
          >
            {user.role === "admin" ? "Administrador" : "Usuario"}
          </span>
          <span className="text-body text-dark-700">
            Registrado:{" "}
            {new Date(user.createdAt).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-light-300 bg-light-100 p-6 mb-8">
        <h2 className="text-heading-3 text-dark-900 mb-4">Información del Usuario</h2>
        <div className="space-y-2">
          <p className="text-body text-dark-700">
            <span className="font-medium">ID:</span> {user.id}
          </p>
          <p className="text-body text-dark-700">
            <span className="font-medium">Nombre:</span> {user.name || "N/A"}
          </p>
          <p className="text-body text-dark-700">
            <span className="font-medium">Email:</span> {user.email}
          </p>
          <p className="text-body text-dark-700">
            <span className="font-medium">Email Verificado:</span>{" "}
            {user.emailVerified ? "Sí" : "No"}
          </p>
          <p className="text-body text-dark-700">
            <span className="font-medium">Rol:</span> {user.role}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-heading-3 text-dark-900 mb-4">
          Pedidos ({user.orders.length})
        </h2>
        {user.orders.length === 0 ? (
          <p className="text-body text-dark-500">Este usuario no tiene pedidos</p>
        ) : (
          <div className="rounded-lg border border-light-300 bg-light-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-light-200 border-b border-light-300">
                <tr>
                  <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                    ID
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
                {user.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-light-200 transition-colors">
                    <td className="px-6 py-4 text-body text-dark-700">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-body-medium text-dark-900">
                      ${Number(order.totalAmount).toLocaleString("es-CO")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-footnote ${getStatusColor(
                          order.status
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
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
