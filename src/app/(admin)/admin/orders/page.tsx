import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllOrders } from "@/lib/actions/admin/orders";
import OrdersTable from "@/components/admin/OrdersTable";

export default async function AdminOrdersPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="text-heading-2 text-dark-900 mb-8">Pedidos</h1>
      <OrdersTable orders={orders} />
    </div>
  );
}
