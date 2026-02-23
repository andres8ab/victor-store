import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllOrders, getMonthlySales } from "@/lib/actions/admin/orders";
import { getAllUsers } from "@/lib/actions/admin/users";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import Link from "next/link";
import { Package, ShoppingCart } from "lucide-react";
import MonthlySalesChart from "@/components/admin/MonthlySalesChart";

export default async function AdminDashboard() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const [orders, users, stats, monthlySales] = await Promise.all([
    getAllOrders(),
    getAllUsers(),
    db
      .select({
        totalProducts: sql<number>`COUNT(DISTINCT ${products.id})::int`,
        publishedProducts: sql<number>`COUNT(DISTINCT CASE WHEN ${products.isPublished} THEN ${products.id} END)::int`,
      })
      .from(products),
    getMonthlySales(),
  ]);

  const statsData = stats[0];

  return (
    <div>
      <h1 className="text-heading-2 text-dark-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg bg-light-100 p-6 border border-light-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-dark-500 mb-1">
                Productos Totales
              </p>
              <p className="text-heading-3 text-dark-900">
                {statsData?.totalProducts ?? 0}
              </p>
            </div>
            <Package className="h-8 w-8 text-dark-500" />
          </div>
        </div>

        <div className="rounded-lg bg-light-100 p-6 border border-light-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-dark-500 mb-1">
                Productos Publicados
              </p>
              <p className="text-heading-3 text-dark-900">
                {statsData?.publishedProducts ?? 0}
              </p>
            </div>
            <Package className="h-8 w-8 text-green" />
          </div>
        </div>

        <div className="rounded-lg bg-light-100 p-6 border border-light-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-dark-500 mb-1">Pedidos</p>
              <p className="text-heading-3 text-dark-900">{orders.length}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-dark-500" />
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-light-100 p-6 border border-light-300 overflow-hidden">
        <h2 className="text-heading-3 text-dark-900 mb-4">
          Comparación de Ventas Mensuales
        </h2>
        <div className="w-full overflow-x-auto">
          <MonthlySalesChart data={monthlySales} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-light-100 p-6 border border-light-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-3 text-dark-900">Pedidos Recientes</h2>
            <Link
              href="/admin/orders"
              className="text-body-medium text-green hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block rounded-lg border border-light-300 p-4 hover:bg-light-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-medium text-dark-900">
                      {order.userName || order.userEmail || "Usuario anónimo"}
                    </p>
                    <p className="text-caption text-dark-500">
                      {new Date(order.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-medium text-dark-900">
                      ${Number(order.totalAmount).toLocaleString("es-CO")}
                    </p>
                    <span className="inline-block rounded-full bg-light-300 px-2 py-1 text-footnote text-dark-700">
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-light-100 p-6 border border-light-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-3 text-dark-900">Usuarios Recientes</h2>
            <Link
              href="/admin/users"
              className="text-body-medium text-green hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {users.slice(0, 5).map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="block rounded-lg border border-light-300 p-4 hover:bg-light-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-medium text-dark-900">
                      {user.name || user.email}
                    </p>
                    <p className="text-caption text-dark-500">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-medium text-dark-900">
                      {user.orderCount} pedidos
                    </p>
                    <span className="inline-block rounded-full bg-light-300 px-2 py-1 text-footnote text-dark-700">
                      {user.role}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
