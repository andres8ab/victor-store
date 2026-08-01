"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dropdown } from "primereact/dropdown";
import { createOrder } from "@/lib/actions/order";
import { MessageCircle, CreditCard } from "lucide-react";
import type { CartItemWithDetails } from "@/lib/actions/cart";
import { COLOMBIA_CITIES } from "@/lib/data/colombia-cities";

const NAME_MIN_LENGTH = 3;
const ADDRESS_MIN_LENGTH = 5;
const PHONE_LENGTH = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCustomerInfo(info: {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}): Record<string, string> {
  const err: Record<string, string> = {};
  if (!info.name.trim()) err.name = "El nombre es requerido.";
  else if (info.name.trim().length < NAME_MIN_LENGTH)
    err.name = `El nombre debe tener al menos ${NAME_MIN_LENGTH} caracteres.`;
  if (!info.email.trim()) err.email = "El email es requerido.";
  else if (!EMAIL_REGEX.test(info.email.trim()))
    err.email = "Ingresa un email válido.";
  const phoneDigits = info.phone.replace(/\D/g, "");
  if (!phoneDigits) err.phone = "El teléfono es requerido.";
  else if (phoneDigits.length !== PHONE_LENGTH)
    err.phone = `El teléfono debe tener exactamente ${PHONE_LENGTH} dígitos.`;
  if (!info.address.trim()) err.address = "La dirección es requerida.";
  else if (info.address.trim().length < ADDRESS_MIN_LENGTH)
    err.address = `La dirección debe tener al menos ${ADDRESS_MIN_LENGTH} caracteres.`;
  if (!info.city) err.city = "Selecciona una ciudad.";
  return err;
}

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
  const [paymentMethod, setPaymentMethod] = useState<"whatsapp" | "wompi">(
    "whatsapp",
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [wompiRedirectUrl, setWompiRedirectUrl] = useState<string | null>(null);
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
    const validationErrors = validateCustomerInfo(customerInfo);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setLoading(true);

    try {
      if (paymentMethod === "whatsapp") {
        // Create order and send via WhatsApp
        const orderResult = await createOrder({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.salePrice
              ? Number(item.product.salePrice)
              : Number(item.product.price),
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
          const whatsappUrl = `https://wa.me/57${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, "_blank");

          // Redirect to success page
          window.location.href = `/checkout/success?orderId=${orderResult.orderId}`;
        } else {
          setSubmitError(orderResult.error || "Error al crear el pedido");
        }
      } else {
        // Wompi online payment flow
        const orderResult = await createOrder({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.salePrice
              ? Number(item.product.salePrice)
              : Number(item.product.price),
          })),
          customerInfo,
          paymentMethod: "wompi",
        });

        if (orderResult.success && orderResult.orderId) {
          const initiateUrl = `/api/payment/initiate?orderId=${orderResult.orderId}`;
          setWompiRedirectUrl(initiateUrl);
          window.location.href = initiateUrl;
          return; // keep loading state while browser navigates
        } else {
          setSubmitError(orderResult.error || "Error al crear el pedido");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setSubmitError("Ocurrió un error al procesar el pedido");
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
          `• ${item.product.name} - ${item.quantity}x $${(item.product.salePrice ? Number(item.product.salePrice) : Number(item.product.price)).toFixed(2)}`,
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
                  value={customerInfo.name}
                  onChange={(e) => {
                    setCustomerInfo({ ...customerInfo, name: e.target.value });
                    if (errors.name) setErrors((e) => ({ ...e, name: "" }));
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500 ${errors.name ? "border-red-500" : "border-dark-500"}`}
                />
                {errors.name && (
                  <p className="mt-1 text-caption text-red-600">{errors.name}</p>
                )}
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
                  value={customerInfo.email}
                  onChange={(e) => {
                    setCustomerInfo({ ...customerInfo, email: e.target.value });
                    if (errors.email) setErrors((e) => ({ ...e, email: "" }));
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500 ${errors.email ? "border-red-500" : "border-dark-500"}`}
                />
                {errors.email && (
                  <p className="mt-1 text-caption text-red-600">
                    {errors.email}
                  </p>
                )}
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
                  inputMode="numeric"
                  maxLength={PHONE_LENGTH + 4}
                  value={customerInfo.phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, PHONE_LENGTH);
                    setCustomerInfo({ ...customerInfo, phone: v });
                    if (errors.phone) setErrors((e) => ({ ...e, phone: "" }));
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500 ${errors.phone ? "border-red-500" : "border-dark-500"}`}
                  placeholder="3001234567"
                />
                {errors.phone && (
                  <p className="mt-1 text-caption text-red-600">
                    {errors.phone}
                  </p>
                )}
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
                  htmlFor="city"
                  className="block text-body-medium text-dark-900 mb-1"
                >
                  Ciudad *
                </label>
                <Dropdown
                  id="city"
                  value={customerInfo.city}
                  onChange={(e) => {
                    setCustomerInfo({ ...customerInfo, city: e.value ?? "" });
                    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                  }}
                  options={[...COLOMBIA_CITIES]}
                  placeholder="Seleccionar ciudad"
                  filter
                  filterPlaceholder="Buscar ciudad..."
                  className="w-full [&_.p-dropdown]:w-full"
                  showClear
                />
                {errors.city && (
                  <p className="mt-1 text-caption text-red-600">{errors.city}</p>
                )}
              </div>
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
                  value={customerInfo.address}
                  onChange={(e) => {
                    setCustomerInfo({
                      ...customerInfo,
                      address: e.target.value,
                    });
                    if (errors.address)
                      setErrors((prev) => ({ ...prev, address: "" }));
                  }}
                  className={`w-full rounded-lg border px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500 ${errors.address ? "border-red-500" : "border-dark-500"}`}
                  placeholder="Calle, número, barrio..."
                />
                {errors.address && (
                  <p className="mt-1 text-caption text-red-600">
                    {errors.address}
                  </p>
                )}
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
                  className="w-full rounded-lg border border-dark-500 px-4 py-2 text-body text-dark-900 focus:outline-none focus:ring-2 focus:ring-dark-500"
                  placeholder="Datos adicionales para la dirección, instrucciones de entrega..."
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
                    setPaymentMethod(e.target.value as "whatsapp" | "wompi")
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
              {/* <label className="flex items-center gap-3 p-4 rounded-lg border border-light-300 cursor-pointer hover:border-dark-500 transition">
                <input
                  type="radio"
                  name="payment"
                  value="wompi"
                  checked={paymentMethod === "wompi"}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as "whatsapp" | "wompi")
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
              </label> */}
              {/* TODO: Add wompi payment method */}
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-20 h-fit">
          <div className="rounded-lg border border-light-300 p-6 space-y-4">
            <h2 className="text-heading-3 text-dark-900">Resumen del Pedido</h2>

            <div className="space-y-3 border-b border-light-300 pb-4">
              {cartItems.map((item) => {
                const price = item.product.salePrice
                  ? Number(item.product.salePrice)
                  : Number(item.product.price);
                return (
                  <div key={item.id} className="flex gap-3">
                    {item.imageUrl && (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
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

            {submitError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full cursor-pointer bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Procesando..."
                : paymentMethod === "whatsapp"
                  ? "Enviar por WhatsApp"
                  : "Pagar con Wompi"}
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
      {wompiRedirectUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-light-100 p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-light-300 border-t-dark-900" />
            <p className="text-body-medium text-dark-900 mb-2">
              Redirigiendo a la pasarela de pago...
            </p>
            <p className="text-caption text-dark-700 mb-6">
              Si no eres redirigido automáticamente, haz clic en el botón.
            </p>
            <a
              href={wompiRedirectUrl}
              className="inline-block rounded-full bg-dark-900 px-6 py-3 text-body-medium text-light-100 transition hover:opacity-90"
            >
              Ir al pago
            </a>
          </div>
        </div>
      )}
    </form>
  );
}
