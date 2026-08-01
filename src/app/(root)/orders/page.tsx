import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/actions";
import { getMyOrders } from "@/lib/actions/order";
import { syncPendingWompiOrdersForUser } from "@/lib/actions/payment";
import { ArrowLeft, Package } from "lucide-react";
import { PaymentBadges } from "@/components";

export default async function OrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect=/orders");
  }

  await syncPendingWompiOrdersForUser(user.id);
  const ordersList = await getMyOrders(user.id);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/profile"
        className="mb-6 inline-flex items-center gap-2 text-body text-dark-700 hover:text-dark-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al perfil
      </Link>

      <h1 className="text-heading-2 text-dark-900 mb-2">
        Historial de Pedidos
      </h1>
      <p className="text-body text-dark-700 mb-8">
        Aquí puedes ver todos tus pedidos y su estado.
      </p>

      {ordersList.length === 0 ? (
        <div className="rounded-lg border border-light-300 bg-light-100 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-dark-400 mb-4" />
          <p className="text-body text-dark-700 mb-4">
            Aún no tienes pedidos.
          </p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {ordersList.map((order) => {
            const needsPayment =
              order.status === "pending" &&
              order.paymentMethod === "wompi" &&
              order.paymentStatus !== "completed";

            return (
              <li key={order.id}>
                <div className="rounded-lg border border-light-300 bg-light-100 transition hover:border-dark-500 hover:bg-light-200">
                  <Link
                    href={`/orders/${order.id}`}
                    className="block p-4 sm:p-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-body-medium text-dark-900">
                          Pedido #{order.id.slice(0, 8)}
                        </span>
                        <PaymentBadges
                          paymentMethod={order.paymentMethod}
                          paymentStatus={order.paymentStatus}
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:items-end">
                        <span className="text-body text-dark-700">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString(
                                "es-CO",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : "—"}
                        </span>
                        <span className="text-body-medium text-dark-900">
                          ${order.totalAmount.toLocaleString("es-CO")}
                        </span>
                      </div>
                    </div>
                  </Link>
                  {needsPayment && (
                    <div className="border-t border-light-300 px-4 pb-4 pt-3 sm:px-6">
                      <a
                        href={`/api/payment/initiate?orderId=${order.id}`}
                        className="inline-block rounded-full bg-dark-900 px-5 py-2 text-body-medium text-light-100 transition hover:opacity-90"
                      >
                        Completar pago
                      </a>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
