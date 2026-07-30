import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listAdminProducts } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";
import AdminProductsClient from "@/components/AdminProductsClient";

export const metadata = {
  title: "Admin Products",
};

export default async function AdminProductsPage() {
  const requestHeaders = headers();
  if (!verifyAdminTokenFromHeaders(requestHeaders)) {
    redirect("/admin/login");
  }
  const products = await listAdminProducts(requestHeaders);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Product management</h1>
          <p>Manage catalog items from the external commerce API directly inside the storefront.</p>
        </div>
        <AdminProductsClient initialProducts={products} />
      </section>
    </main>
  );
}
