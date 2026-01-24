import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth/admin";
import { getAllUsers } from "@/lib/actions/admin/users";
import UsersTable from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/");
  }

  const users = await getAllUsers();

  return (
    <div>
      <h1 className="text-heading-2 text-dark-900 mb-8">Usuarios</h1>
      <UsersTable users={users} />
    </div>
  );
}
