"use client";

import { useState } from "react";
import { updateCartItemQuantity, removeFromCart, getCart } from "@/lib/actions/cart";
import { useCartStore } from "@/store/cart";
import { useAuth } from "@/hooks/useAuth";
import { Minus, Plus, Trash2 } from "lucide-react";

export function CartActions({
  cartItemId,
  currentQuantity,
  maxQuantity,
}: {
  cartItemId: string;
  currentQuantity: number;
  maxQuantity: number;
}) {
  const [quantity, setQuantity] = useState(currentQuantity);
  const [loading, setLoading] = useState(false);
  const syncCountFromServer = useCartStore((state) => state.syncCountFromServer);
  const { user } = useAuth();

  const syncCartCount = async () => {
    if (!user) return;
    try {
      const cartItems = await getCart(user.id);
      const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      syncCountFromServer(totalCount);
    } catch (error) {
      console.error("Failed to sync cart count:", error);
    }
  };

  const handleUpdate = async (newQuantity: number) => {
    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }
    if (newQuantity < 1 || newQuantity > maxQuantity) return;
    
    setLoading(true);
    setQuantity(newQuantity);
    
    const result = await updateCartItemQuantity(cartItemId, newQuantity, user.id);
    
    if (result.success) {
      // Sync cart count from server
      await syncCartCount();
    } else {
      setQuantity(currentQuantity);
      alert(result.error);
    }
    
    setLoading(false);
  };

  const handleRemove = async () => {
    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }
    if (!confirm("¿Estás seguro de que quieres eliminar este producto del carrito?")) {
      return;
    }
    
    setLoading(true);
    const result = await removeFromCart(cartItemId, user.id);
    
    if (result.success) {
      // Sync cart count from server
      await syncCartCount();
    } else {
      alert(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleUpdate(quantity - 1)}
        disabled={loading || quantity <= 1}
        className="rounded-full border border-light-300 p-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:border-dark-500 transition"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      
      <span className="w-12 text-center text-body text-dark-900">
        {quantity}
      </span>
      
      <button
        onClick={() => handleUpdate(quantity + 1)}
        disabled={loading || quantity >= maxQuantity}
        className="rounded-full border border-light-300 p-1.5 disabled:opacity-50 disabled:cursor-not-allowed hover:border-dark-500 transition"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
      
      <button
        onClick={handleRemove}
        disabled={loading}
        className="ml-2 rounded-full border border-red-300 p-1.5 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-500 transition"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

