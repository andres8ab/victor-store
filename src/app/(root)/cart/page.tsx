import { getCart } from "@/lib/actions/cart";
import { getCurrentUser } from "@/lib/auth/actions";
import Image from "next/image";
import Link from "next/link";
import { CartActions } from "@/components/CartActions";
import { redirect } from "next/navigation";

export default async function CartPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  const cartItems = await getCart();

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.variant.salePrice 
      ? Number(item.variant.salePrice) 
      : Number(item.variant.price);
    return sum + price * item.quantity;
  }, 0);

  const tax = subtotal * 0.19; // 19% IVA for Colombia
  const total = subtotal + tax;

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-heading-2 text-dark-900 mb-8">Mi Carrito</h1>

      {cartItems.length === 0 ? (
        <div className="rounded-lg border border-light-300 p-12 text-center">
          <p className="text-body text-dark-700 mb-4">
            Tu carrito está vacío
          </p>
          <Link
            href="/products"
            className="inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
          >
            Continuar Comprando
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            {cartItems.map((item) => {
              const price = item.variant.salePrice 
                ? Number(item.variant.salePrice) 
                : Number(item.variant.price);
              const itemTotal = price * item.quantity;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg border border-light-300 p-4"
                >
                  {item.imageUrl && (
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={item.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.id}`}
                      className="text-body-medium text-dark-900 hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-caption text-dark-700 mt-1">
                      SKU: {item.variant.sku}
                    </p>
                    <p className="text-body text-dark-900 mt-2">
                      ${price.toFixed(2)} c/u
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <CartActions
                        cartItemId={item.id}
                        currentQuantity={item.quantity}
                        maxQuantity={item.variant.inStock}
                      />
                      <p className="text-body-medium text-dark-900">
                        Total: ${itemTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:sticky lg:top-20 h-fit">
            <div className="rounded-lg border border-light-300 p-6 space-y-4">
              <h2 className="text-heading-3 text-dark-900">Resumen del Pedido</h2>
              
              <div className="space-y-2 border-b border-light-300 pb-4">
                <div className="flex justify-between text-body text-dark-700">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-body text-dark-700">
                  <span>IVA (19%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-body-medium text-dark-900 pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  href="/checkout"
                  className="block w-full rounded-full bg-dark-900 px-6 py-4 text-center text-body-medium text-light-100 transition hover:opacity-90"
                >
                  Proceder al Pago
                </Link>
                <Link
                  href="/products"
                  className="block w-full rounded-full border border-light-300 px-6 py-4 text-center text-body-medium text-dark-900 transition hover:border-dark-500"
                >
                  Continuar Comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

