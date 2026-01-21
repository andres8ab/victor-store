import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;
  const orderId = params.orderId;

  return (
    <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <h1 className="text-heading-2 text-dark-900 mb-4">
          ¡Pedido Realizado con Éxito!
        </h1>
        
        {orderId && (
          <p className="text-body text-dark-700 mb-2">
            Número de pedido: <span className="font-medium">{orderId}</span>
          </p>
        )}
        
        <p className="text-body text-dark-700 mb-8">
          Te contactaremos pronto para confirmar tu pedido y coordinar el pago y la entrega.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
          >
            Continuar Comprando
          </Link>
          <Link
            href="/"
            className="inline-block rounded-full border border-light-300 px-6 py-3 text-body-medium text-dark-900 transition hover:border-dark-500"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </main>
  );
}

