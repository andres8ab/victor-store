"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { useEffect, useRef } from "react";
import { getCart } from "@/lib/actions/cart";
import { useAuth } from "@/hooks/useAuth";

export function CartLink() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const syncCountFromServer = useCartStore((state) => state.syncCountFromServer);
  const prevCountRef = useRef(itemCount);
  const countElementRef = useRef<HTMLSpanElement>(null);

  const { user } = useAuth();

  // Sync cart count on mount
  useEffect(() => {
    if (!user) {
      syncCountFromServer(0);
      return;
    }
    
    const syncCartCount = async () => {
      try {
        const cartItems = await getCart(user.id);
        const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
        syncCountFromServer(totalCount);
      } catch (error) {
        console.error("Failed to sync cart count on mount:", error);
      }
    };
    syncCartCount();
  }, [syncCountFromServer, user]);

  useEffect(() => {
    // Animate when count changes and increases
    if (itemCount !== prevCountRef.current && itemCount > prevCountRef.current && itemCount > 0 && countElementRef.current) {
      // Trigger animation by adding/removing class
      countElementRef.current.classList.add("cart-count-animate");
      const timer = setTimeout(() => {
        countElementRef.current?.classList.remove("cart-count-animate");
      }, 600);
      
      prevCountRef.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <>
      <style>{`
        .cart-count-animate {
          animation: cartPulse 0.6s ease-in-out;
        }
        @keyframes cartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); color: var(--color-green); font-weight: 500; }
          100% { transform: scale(1); }
        }
      `}</style>
      <Link 
        href="/cart" 
        className="text-body text-dark-900 transition-colors hover:text-dark-700"
      >
        Mi Carrito {itemCount > 0 && (
          <span 
            ref={countElementRef}
            className="inline-block"
          >
            ({itemCount})
          </span>
        )}
      </Link>
    </>
  );
}

