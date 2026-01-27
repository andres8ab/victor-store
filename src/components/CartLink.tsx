"use client";

import Link from "next/link";
import { Badge } from "primereact/badge";
import { useCartStore } from "@/store/cart";
import { useEffect, useRef } from "react";
import { getCart } from "@/lib/actions/cart";
import { useAuth } from "@/hooks/useAuth";

export function CartLink() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const syncCountFromServer = useCartStore((state) => state.syncCountFromServer);
  const prevCountRef = useRef(itemCount);
  const badgeElementRef = useRef<HTMLSpanElement>(null);

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
    if (
      itemCount !== prevCountRef.current &&
      itemCount > prevCountRef.current &&
      itemCount > 0 &&
      badgeElementRef.current
    ) {
      // Trigger animation by adding/removing class
      badgeElementRef.current.classList.add("cart-count-animate");
      const timer = setTimeout(() => {
        badgeElementRef.current?.classList.remove("cart-count-animate");
      }, 600);

      prevCountRef.current = itemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  return (
    <Link
      href="/cart"
      className="relative flex items-center text-body text-dark-900 transition-colors hover:text-dark-700"
    >
      <i className="pi pi-shopping-cart p-overlay-badge" style={{ fontSize: "1.2rem" }}>
        {itemCount > 0 && (
          <Badge
            value={itemCount}
            severity="danger"
            className="cart-badge-small"
          />
        )}
      </i>
    </Link>
  );
}