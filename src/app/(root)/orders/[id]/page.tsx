import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/actions";
import { getMyOrderById } from "@/lib/actions/order";
import { ArrowLeft } from "lucide-react";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const statusColors: Record<string, string> = {
  pending: "bg-orange/20 text-orange",
  paid: "bg-green/20 text-green",
  shipped: "bg-blue-500/20 text-blue-500",
  delivered: "bg-green/20 text-green",
  cancelled: "bg-red/20 text-red",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect=/orders");
  }

  const { id } = await params;
  const order = await getMyOrderById(id, user.id);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-2 text-body text-dark-700 hover:text-dark-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pedidos
      </Link>

      <div className="mb-8">
        <h1 className="text-heading-2 text-dark-900 mb-4">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-footnote ${statusColors[order.status] ?? "bg-dark-500/20 text-dark-500"}`}
          >
            {statusLabels[order.status] ?? order.status}
          </span>
          <span className="text-body text-dark-700">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("es-CO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-light-300 bg-light-100 p-6">
          <h2 className="text-heading-3 text-dark-900 mb-4">
            Información del pedido
          </h2>
          <div className="space-y-2">
            <p className="text-body text-dark-700">
              <span className="font-medium">Nombre:</span>{" "}
              {order.customerName ?? "—"}
            </p>
            <p className="text-body text-dark-700">
              <span className="font-medium">Email:</span>{" "}
              {order.customerEmail ?? "—"}
            </p>
            <p className="text-body text-dark-700">
              <span className="font-medium">Teléfono:</span>{" "}
              {order.customerPhone ?? "—"}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-light-300 bg-light-100 p-6">
          <h2 className="text-heading-3 text-dark-900 mb-4">
            Dirección de envío
          </h2>
          {order.shippingAddress ? (
            <div className="space-y-1">
              <p className="text-body text-dark-700">
                {order.shippingAddress.line1}
              </p>
              <p className="text-body text-dark-700">
                {order.shippingAddress.city}
                {order.shippingAddress.state && `, ${order.shippingAddress.state}`}
              </p>
              <p className="text-body text-dark-700">
                {order.shippingAddress.country}
              </p>
              {order.customerNotes && (
                <p className="text-body text-dark-600 mt-2">
                  <span className="font-medium">Notas:</span> {order.customerNotes}
                </p>
              )}
            </div>
          ) : order.customerNotes ? (
            <p className="text-body text-dark-700">
              <span className="font-medium">Notas:</span> {order.customerNotes}
            </p>
          ) : (
            <p className="text-body text-dark-500">Sin dirección de envío</p>
          )}
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-light-300 bg-light-100 p-6">
        <h2 className="text-heading-3 text-dark-900 mb-4">Productos</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-light-300 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-body-medium text-dark-900">
                  {item.productName}
                </p>
                <p className="text-caption text-dark-500">
                  Cantidad: {item.quantity} · $
                  {Number(item.priceAtPurchase).toLocaleString("es-CO")} c/u
                </p>
              </div>
              <p className="text-body-medium text-dark-900 sm:text-right">
                $
                {(Number(item.priceAtPurchase) * item.quantity).toLocaleString(
                  "es-CO"
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-light-300 pt-4">
          <p className="text-heading-3 text-dark-900">Total</p>
          <p className="text-heading-3 text-dark-900">
            ${Number(order.totalAmount).toLocaleString("es-CO")}
          </p>
        </div>
      </div>
    </main>
  );
}
