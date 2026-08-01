import Link from "next/link";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { recordWompiTransactionId, syncWompiTransaction } from "@/lib/actions/payment";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  readonly searchParams: Promise<{ orderId?: string; id?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.orderId;
  // Wompi appends &id=TRANSACTION_ID to our redirect-url
  const wompiTransactionId = params.id;
  const isWompiFlow = !!wompiTransactionId;

  // Persist the transactionId immediately so it's never lost, then verify status.
  let wompiStatus: string | null = null;
  if (wompiTransactionId && orderId) {
    await recordWompiTransactionId(orderId, wompiTransactionId);
    wompiStatus = await syncWompiTransaction(wompiTransactionId);
  }

  type WompiOutcome = "approved" | "declined" | "pending";
  let wompiOutcome: WompiOutcome = "pending";
  if (wompiStatus === "APPROVED") wompiOutcome = "approved";
  else if (["DECLINED", "VOIDED", "ERROR"].includes(wompiStatus ?? "")) wompiOutcome = "declined";

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        {isWompiFlow ? (
          <>
            {wompiOutcome === "approved" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h1 className="text-heading-2 text-dark-900 mb-4">
                  ¡Pago aprobado!
                </h1>
                {orderId && (
                  <p className="text-body text-dark-700 mb-2">
                    Número de pedido:{" "}
                    <span className="font-medium text-dark-900">{orderId.slice(0, 8)}</span>
                  </p>
                )}
                <p className="text-body text-dark-700 mb-8">
                  Tu pago fue confirmado. Nos pondremos en contacto para
                  coordinar la entrega.
                </p>
              </>
            )}
            {wompiOutcome === "declined" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <h1 className="text-heading-2 text-dark-900 mb-4">
                  Pago no completado
                </h1>
                {orderId && (
                  <p className="text-body text-dark-700 mb-2">
                    Número de pedido:{" "}
                    <span className="font-medium text-dark-900">{orderId.slice(0, 8)}</span>
                  </p>
                )}
                <p className="text-body text-dark-700 mb-8">
                  El pago fue rechazado o cancelado. Puedes intentarlo de nuevo
                  desde tu historial de pedidos.
                </p>
              </>
            )}
            {wompiOutcome === "pending" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6">
                  <Clock className="h-10 w-10 text-blue-600" />
                </div>
                <h1 className="text-heading-2 text-dark-900 mb-4">
                  ¡Pago en Procesamiento!
                </h1>
                {orderId && (
                  <p className="text-body text-dark-700 mb-2">
                    Número de pedido:{" "}
                    <span className="font-medium text-dark-900">{orderId.slice(0, 8)}</span>
                  </p>
                )}
                <p className="text-body text-dark-700 mb-2">
                  Tu pago fue enviado a Wompi y será confirmado en instantes.
                </p>
                <p className="text-body text-dark-700 mb-8">
                  Recibirás una confirmación y nos pondremos en contacto para
                  coordinar la entrega.
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-heading-2 text-dark-900 mb-4">
              ¡Pedido Realizado con Éxito!
            </h1>
            {orderId && (
              <p className="text-body text-dark-700 mb-2">
                Número de pedido:{" "}
                <span className="font-medium text-dark-900">{orderId.slice(0, 8)}</span>
              </p>
            )}
            <p className="text-body text-dark-700 mb-8">
              Te contactaremos pronto para confirmar tu pedido y coordinar el
              pago y la entrega.
            </p>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
          >
            Continuar Comprando
          </Link>
          <Link
            href="/orders"
            className="inline-block rounded-full border border-light-300 px-6 py-3 text-body-medium text-dark-900 transition hover:border-dark-500"
          >
            Ver Mis Pedidos
          </Link>
        </div>
      </div>
    </main>
  );
}
