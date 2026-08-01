import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listAdminOrders } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";
import AdminOrdersClient from "@/components/AdminOrdersClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Orders",
};

export default async function AdminOrdersPage() {
  const requestHeaders = headers();
  if (!verifyAdminTokenFromHeaders(requestHeaders)) {
    redirect("/admin/login");
  }
  const orders = await listAdminOrders(requestHeaders);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Order management</h1>
          <p>Update order statuses and send payment status emails from the connected commerce API.</p>
        </div>
        <AdminOrdersClient initialOrders={orders} />
      </section>
    </main>
  );
}