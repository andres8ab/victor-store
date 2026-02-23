"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";

export function AddToCartButton({
  productId,
  disabled = false,
}: {
  productId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    const result = await addToCart(productId, user.id, 1);

    if (result.success) {
      // Optimistically increment count
      useCartStore.getState().incrementCount();
      router.push("/cart");
    } else if (result.requiresAuth) {
      router.push("/sign-in");
    } else {
      alert(result.error || "Error al agregar al carrito");
    }

    setLoading(false);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || disabled}
      className="flex items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <ShoppingBag className="h-5 w-5" />
      {loading ? "Agregando..." : "Agregar al Carrito"}
    </button>
  );
}

