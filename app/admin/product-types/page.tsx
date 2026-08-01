import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listProductTypes } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";
import AdminProductTypesClient from "@/components/AdminProductTypesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Product Types",
};

export default async function AdminProductTypesPage() {
  const requestHeaders = headers();
  if (!verifyAdminTokenFromHeaders(requestHeaders)) {
    redirect("/admin/login");
  }
  const productTypes = await listProductTypes(requestHeaders);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Product type management</h1>
          <p>Create, edit, and remove product types from the connected commerce API.</p>
        </div>
        <AdminProductTypesClient initialTypes={productTypes} />
      </section>
    </main>
  );
}