import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/actions";
import { UserCircle, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?redirect=/profile");
  }

  const displayName = user.name || user.email?.split("@")[0] || "Usuario";

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-heading-2 text-dark-900 mb-2">Mi Perfil</h1>
      <p className="text-body text-dark-700 mb-8">
        Gestiona tu información y revisa tus pedidos.
      </p>

      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2">
        <section className="rounded-lg border border-light-300 bg-light-100 p-6">
          <h2 className="text-heading-3 text-dark-900 mb-4 flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            Información Personal
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-caption text-dark-500">Nombre</p>
              <p className="text-body-medium text-dark-900">
                {user.name || "—"}
              </p>
            </div>
            <div>
              <p className="text-caption text-dark-500">Correo electrónico</p>
              <p className="text-body text-dark-900 truncate">{user.email}</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-light-300 bg-light-100 p-6">
          <h2 className="text-heading-3 text-dark-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6" />
            Pedidos
          </h2>
          <p className="text-body text-dark-700 mb-4">
            Revisa el historial y el estado de tus pedidos.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 rounded-full border border-light-300 bg-light-100 px-6 py-3 text-body-medium text-dark-900 transition hover:border-dark-500 hover:bg-light-200"
          >
            <ShoppingBag className="h-4 w-4" />
            Ver historial de pedidos
          </Link>
        </section>
      </div>
    </main>
  );
}
