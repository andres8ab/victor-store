"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, UserCircle, ShoppingBag, Shield, ChevronDown } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/auth";

export function UserMenu() {
  const { user, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await signOut();
    logout();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="h-9 w-20 animate-pulse rounded-md bg-light-300" />
    );
  }

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className="flex items-center gap-2 rounded-md px-4 py-2 text-body text-dark-900 transition-colors hover:bg-light-200 hover:text-dark-700"
      >
        <i className="pi pi-user text-xl p-overlay-badge" style={{ fontSize: '1rem' }} />
        <span className="hidden sm:inline">Inicia sesión</span>
      </Link>
    );
  }

  const userName = user.name || user.email.split("@")[0];
  const isAdmin = user.role === "admin";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-body text-dark-900 transition-colors hover:bg-light-200 hover:text-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <i className="pi pi-user text-xl p-overlay-badge" style={{ fontSize: '1rem' }} />

        <span className="hidden sm:inline max-w-[120px] truncate">{userName}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-56 rounded-lg border border-light-300 bg-light-100 shadow-lg z-50"
        >
          <div className="py-1">
            <div className="px-4 py-2 border-b border-light-300">
              <p className="text-sm font-medium text-dark-900 truncate">{userName}</p>
              <p className="text-xs text-dark-600 truncate">{user.email}</p>
            </div>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
            >
              <i className="pi pi-user text-xl p-overlay-badge" style={{ fontSize: '1rem' }} />

              Ver Perfil
            </Link>

            <Link
              href="/orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Historial de Pedidos
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
              >
                <Shield className="h-4 w-4" />
                Panel Admin
              </Link>
            )}

            <div className="border-t border-light-300 my-1" />

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 px-4 py-2 text-body text-red-600 hover:bg-light-200 hover:text-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
