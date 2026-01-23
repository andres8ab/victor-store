import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import Link from "next/link";
import {
  Package,
  FolderTree,
  Tag,
  ShoppingCart,
  Users,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-light-200">
      <aside className="fixed left-0 top-0 h-screen w-64 bg-light-100 border-r border-light-300">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-light-300 px-6">
            <h1 className="text-heading-3 text-dark-900 font-semibold">
              Panel Admin
            </h1>
          </div>
          <nav className="flex-1 space-y-1 px-4 py-6">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
            >
              <Package className="h-5 w-5" />
              Productos
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
            >
              <FolderTree className="h-5 w-5" />
              Categorías
            </Link>
            <Link
              href="/admin/brands"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
            >
              <Tag className="h-5 w-5" />
              Marcas
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Pedidos
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-body text-dark-700 hover:bg-light-200 hover:text-dark-900 transition-colors"
            >
              <Users className="h-5 w-5" />
              Usuarios
            </Link>
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
              className="mt-2 flex items-center justify-center rounded-lg px-4 py-2 text-body-medium text-dark-700 hover:bg-light-200 transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </aside>
      <main className="ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
