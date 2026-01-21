"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createOrder } from "@/lib/actions/order";
import { MessageCircle, CreditCard } from "lucide-react";
import type { CartItemWithDetails } from "@/lib/actions/cart";

type User = {
  id: string;
  name: string | null;
  email: string;
};

export function CheckoutForm({
  cartItems,
  subtotal,
  tax,
  total,
  user,
}: {
  cartItems: CartItemWithDetails[];
  subtotal: number;
  tax: number;
  total: number;
  user: User;
}) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "payment">(
    "whatsapp",
  );
  const [customerInfo, setCustomerInfo] = useState({
    name: user.name || "",
    email: user.email,
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (paymentMethod === "whatsapp") {
        // Create order and send via WhatsApp
        const orderResult = await createOrder({
          items: cartItems.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            priceAtPurchase: item.variant.salePrice
              ? Number(item.variant.salePrice)
              : Number(item.variant.price),
          })),
          customerInfo,
          paymentMethod: "whatsapp",
        });

        if (orderResult.success && orderResult.orderId) {
          // Format WhatsApp message
          const message = formatWhatsAppMessage(
            cartItems,
            total,
            customerInfo,
            orderResult.orderId,
          );
          const whatsappUrl = `https://wa.me/573008943131?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, "_blank");

          // Redirect to success page
          window.location.href = `/checkout/success?orderId=${orderResult.orderId}`;
        } else {
          alert(orderResult.error || "Error al crear el pedido");
        }
      } else {
        // Payment gateway flow (Wompi/PayU)
        const orderResult = await createOrder({
          items: cartItems.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            priceAtPurchase: item.variant.salePrice
              ? Number(item.variant.salePrice)
              : Number(item.variant.price),
          })),
          customerInfo,
          paymentMethod: "payment",
        });

        if (orderResult.success && orderResult.orderId) {
          // Redirect to payment gateway
          // This would typically redirect to Wompi or PayU
          // For now, we'll show a placeholder
          alert("Redirigiendo al procesador de pagos...");
          // window.location.href = `/api/payment/initiate?orderId=${orderResult.orderId}`;
        } else {
          alert(orderResult.error || "Error al crear el pedido");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Ocurrió un error al procesar el pedido");
    } finally {
      setLoading(false);
    }
  };

  const formatWhatsAppMessage = (
    items: CartItemWithDetails[],
    total: number,
    info: typeof customerInfo,
    orderId: string,
  ): string => {
    const itemsList = items
      .map(
        (item) =>
          `• ${item.product.name} (${item.variant.sku}) - ${item.quantity}x $${(item.variant.salePrice ? Number(item.variant.salePrice) : Number(item.variant.price)).toFixed(2)}`,
      )
      .join("\n");

    return `¡Hola! Quiero realizar un pedido:

*Pedido #${orderId}*

*Productos:*
${itemsList}

*Total: $${total.toFixed(2)}*

*Información del cliente:*
Nombre: ${info.name}
Email: ${info.email}
Teléfono: ${info.phone}
Dirección: ${info.address}
Ciudad: ${info.city}
${info.notes ? `Notas: ${info.notes}` : ""}

¿Podrían confirmar disponibilidad y método de pago?`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-light-300 p-6">
            <h2 className="text-heading-3 text-dark-900 mb-4">
              Información de Contacto
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-body-medium text-dark-900 mb-1"
                >
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-body-medium text-dark-900 mb-1"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, email: e.target.value })
                  }
                  className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-body-medium text-dark-900 mb-1"
                >
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="phone"
                  required
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                  className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500"
                  placeholder="+57 300 123 4567"
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-light-300 p-6">
            <h2 className="text-heading-3 text-dark-900 mb-4">
              Dirección de Envío
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="address"
                  className="block text-body-medium text-dark-900 mb-1"
                >
                  Dirección *
                </label>
                <input
                  type="text"
                  id="address"
                  required
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo({
                      ...customerInfo,
                      address: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="block text-body-medium text-dark-900 mb-1"
                >
                  Ciudad *
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={customerInfo.city}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, city: e.target.value })
                  }
                  className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500"
                />
              </div>
              <div>
                <label
                  htmlFor="notes"
                  className="block text-body-medium text-dark-900 mb-1"
                >
                  Notas (opcional)
                </label>
                <textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-light-300 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500"
                  placeholder="Instrucciones especiales de entrega..."
                />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-light-300 p-6">
            <h2 className="text-heading-3 text-dark-900 mb-4">
              Método de Pago
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 rounded-lg border border-light-300 cursor-pointer hover:border-dark-500 transition">
                <input
                  type="radio"
                  name="payment"
                  value="whatsapp"
                  checked={paymentMethod === "whatsapp"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "whatsapp" | "payment")
                  }
                  className="h-4 w-4 accent-dark-900"
                />
                <MessageCircle className="h-5 w-5 text-dark-900" />
                <div className="flex-1">
                  <p className="text-body-medium text-dark-900">
                    Enviar pedido por WhatsApp
                  </p>
                  <p className="text-caption text-dark-700">
                    Te contactaremos para confirmar disponibilidad y pago
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-lg border border-light-300 cursor-pointer hover:border-dark-500 transition">
                <input
                  type="radio"
                  name="payment"
                  value="payment"
                  checked={paymentMethod === "payment"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "whatsapp" | "payment")
                  }
                  className="h-4 w-4 accent-dark-900"
                />
                <CreditCard className="h-5 w-5 text-dark-900" />
                <div className="flex-1">
                  <p className="text-body-medium text-dark-900">
                    Pago en línea
                  </p>
                  <p className="text-caption text-dark-700">
                    Paga con tarjeta de crédito o débito
                  </p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-20 h-fit">
          <div className="rounded-lg border border-light-300 p-6 space-y-4">
            <h2 className="text-heading-3 text-dark-900">Resumen del Pedido</h2>

            <div className="space-y-3 border-b border-light-300 pb-4">
              {cartItems.map((item) => {
                const price = item.variant.salePrice
                  ? Number(item.variant.salePrice)
                  : Number(item.variant.price);
                return (
                  <div key={item.id} className="flex gap-3">
                    {item.imageUrl && (
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.imageUrl}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-body text-dark-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-caption text-dark-700">
                        {item.quantity}x ${price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

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

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Procesando..."
                : paymentMethod === "whatsapp"
                  ? "Enviar por WhatsApp"
                  : "Pagar Ahora"}
            </button>

            <Link
              href="/cart"
              className="block w-full text-center text-body text-dark-700 hover:text-dark-900 underline"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
