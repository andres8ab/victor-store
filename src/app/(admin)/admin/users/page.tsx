import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllUsers } from "@/lib/actions/admin/users";
import Link from "next/link";

export default async function AdminUsersPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const users = await getAllUsers();

  return (
    <div>
      <h1 className="text-heading-2 text-dark-900 mb-8">Usuarios</h1>

      <div className="rounded-lg border border-light-300 bg-light-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-light-200 border-b border-light-300">
            <tr>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Nombre
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Email
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Rol
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Pedidos
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Fecha de Registro
              </th>
              <th className="px-6 py-4 text-left text-body-medium text-dark-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-300">
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-8 text-center text-body text-dark-500"
                >
                  No hay usuarios
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-light-200 transition-colors"
                >
                  <td className="px-6 py-4 text-body-medium text-dark-900">
                    {user.name || "-"}
                  </td>
                  <td className="px-6 py-4 text-body text-dark-700">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-footnote ${
                        user.role === "admin"
                          ? "bg-green/20 text-green"
                          : "bg-dark-500/20 text-dark-500"
                      }`}
                    >
                      {user.role === "admin" ? "Admin" : "Usuario"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body text-dark-700">
                    {user.orderCount}
                  </td>
                  <td className="px-6 py-4 text-body text-dark-700">
                    {new Date(user.createdAt).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-body-medium text-green hover:underline"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
