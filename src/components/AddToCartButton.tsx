"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { addToCart, getCart } from "@/lib/actions/cart";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";

export function AddToCartButton({
  productVariantId,
  disabled = false,
}: {
  productVariantId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const syncCountFromServer = useCartStore((state) => state.syncCountFromServer);
  const { user } = useAuth();

  const handleAddToCart = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    const result = await addToCart(productVariantId, user.id, 1);
    
    if (result.success) {
      // Sync cart count from server
      try {
        const cartItems = await getCart(user.id);
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        syncCountFromServer(totalCount);
      } catch (error) {
        console.error("Failed to sync cart count:", error);
        // Optimistically increment count
        useCartStore.getState().incrementCount();
      }
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

