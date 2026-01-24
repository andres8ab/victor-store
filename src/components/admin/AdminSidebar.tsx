"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Users,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/products", icon: Package, label: "Productos" },
    { href: "/admin/categories", icon: FolderTree, label: "Categorías" },
    { href: "/admin/brands", icon: Tag, label: "Marcas" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Pedidos" },
    { href: "/admin/users", icon: Users, label: "Usuarios" },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg p-2 bg-light-100 border border-light-300 text-dark-900 hover:bg-light-200 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-light-100 border-r border-light-300 z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-light-300 px-6">
            <h1 className="text-heading-3 text-dark-900 font-semibold">
              Panel Admin
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 text-body transition-colors ${
                    active
                      ? "bg-light-200 text-dark-900 font-medium"
                      : "text-dark-700 hover:bg-light-200 hover:text-dark-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-light-300 p-4">
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </button>
            </form>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="mt-2 flex items-center justify-center rounded-lg px-4 py-2 text-body-medium text-dark-700 hover:bg-light-200 transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
