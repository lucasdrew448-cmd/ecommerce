import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listSuppliers } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";
import AdminSuppliersClient from "@/components/AdminSuppliersClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Suppliers",
};

export default async function AdminSuppliersPage() {
  const requestHeaders = headers();
  if (!verifyAdminTokenFromHeaders(requestHeaders)) {
    redirect("/admin/login");
  }
  const suppliers = await listSuppliers(requestHeaders);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Supplier management</h1>
          <p>Create, edit, and remove fish suppliers from the connected commerce API.</p>
        </div>
        <AdminSuppliersClient initialSuppliers={suppliers} />
      </section>
    </main>
  );
}