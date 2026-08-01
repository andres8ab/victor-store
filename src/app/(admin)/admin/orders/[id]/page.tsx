import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getOrderById } from "@/lib/actions/admin/orders";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PaymentBadges } from "@/components";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return (
      <div>
        <p className="text-body text-dark-500">Pedido no encontrado</p>
        <Link
          href="/admin/orders"
          className="mt-4 inline-block text-body-medium text-green hover:underline"
        >
          Volver a pedidos
        </Link>
      </div>
    );
  }

  const orderStatusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Pendiente", className: "bg-orange/20 text-orange" },
    paid: { label: "Pagado", className: "bg-green/20 text-green" },
    shipped: { label: "Enviado", className: "bg-blue-500/20 text-blue-500" },
    delivered: { label: "Entregado", className: "bg-green/20 text-green" },
    cancelled: { label: "Cancelado", className: "bg-red/20 text-red" },
  };

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-6 inline-flex items-center gap-2 text-body text-dark-700 hover:text-dark-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pedidos
      </Link>

      <div className="mb-8">
        <h1 className="text-heading-2 text-dark-900 mb-4">
          Pedido #{order.id.slice(0, 8)}
        </h1>
        <div className="flex flex-wrap items-center gap-2">

          <PaymentBadges
            paymentMethod={order.paymentMethod}
            paymentStatus={order.paymentStatus}
          />
          <span className="text-body text-dark-700">
            {new Date(order.createdAt).toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg border border-light-300 bg-light-100 p-6">
          <h2 className="text-heading-3 text-dark-900 mb-4">Información del Cliente</h2>
          <div className="space-y-2">
            <p className="text-body text-dark-700">
              <span className="font-medium">Nombre:</span>{" "}
              {order.customerName ?? order.userName ?? "N/A"}
            </p>
            <p className="text-body text-dark-700">
              <span className="font-medium">Email:</span>{" "}
              {order.customerEmail ?? order.userEmail ?? "N/A"}
            </p>
            <p className="text-body text-dark-700">
              <span className="font-medium">Teléfono:</span>{" "}
              {order.customerPhone ?? "—"}
            </p>
            {order.userId && (
              <Link
                href={`/admin/users/${order.userId}`}
                className="inline-block mt-4 text-body-medium text-green hover:underline"
              >
                Ver perfil del usuario →
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-light-300 bg-light-100 p-6">
          <h2 className="text-heading-3 text-dark-900 mb-4">Dirección de Envío</h2>
          <div className="space-y-4">
            {order.shippingAddress ? (
              <div>
                <p className="text-body text-dark-700">
                  <span className="font-medium">Ciudad:</span>{" "}
                  {order.shippingAddress.city}
                  <br />
                  <span className="font-medium">Dirección:</span>{" "}
                  {order.shippingAddress.line1}
                  <br />
                  {order.shippingAddress.country}
                </p>
                {(order.customerNotes ?? order.shippingAddress.line2) && (
                  <p className="text-body text-dark-700 mt-2">
                    <span className="font-medium">Notas:</span>{" "}
                    {order.customerNotes ?? order.shippingAddress.line2}
                  </p>
                )}
              </div>
            ) : order.customerNotes ? (
              <div>
                <p className="text-body text-dark-500">Sin dirección guardada.</p>
                <p className="text-body text-dark-700 mt-2">
                  <span className="font-medium">Notas del pedido:</span>{" "}
                  {order.customerNotes}
                </p>
              </div>
            ) : (
              <p className="text-body text-dark-500">Sin dirección de envío</p>
            )}
            {order.billingAddress && (
              <div>
                <p className="text-body-medium text-dark-900 mb-2">
                  Dirección de Facturación
                </p>
                <p className="text-body text-dark-700">
                  {order.billingAddress.line1}
                  {order.billingAddress.line2 && (
                    <>
                      <br />
                      {order.billingAddress.line2}
                    </>
                  )}
                  <br />
                  {order.billingAddress.city}, {order.billingAddress.state}
                  <br />
                  {order.billingAddress.postalCode}
                  <br />
                  {order.billingAddress.country}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-light-300 bg-light-100 p-6">
        <h2 className="text-heading-3 text-dark-900 mb-4">Items del Pedido</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-light-300 p-4"
            >
              <div>
                <p className="text-body-medium text-dark-900">
                  {item.productName}
                </p>
                <p className="text-caption text-dark-500">
                  ID de producto: {item.productId}
                </p>
                <p className="text-caption text-dark-500">
                  Cantidad: {item.quantity}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-body-medium text-dark-900">
                  ${Number(item.priceAtPurchase).toLocaleString("es-CO")}
                </p>
                <p className="text-caption text-dark-500">
                  Total: $
                  {(Number(item.priceAtPurchase) * item.quantity).toLocaleString(
                    "es-CO"
                  )}
                </p>
              </div>
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
    </div>
  );
}
