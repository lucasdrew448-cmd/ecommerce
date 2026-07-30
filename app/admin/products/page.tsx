import { listAdminProducts } from "@/lib/admin";
import AdminProductsClient from "@/components/AdminProductsClient";

export const metadata = {
  title: "Admin Products",
};

export default async function AdminProductsPage() {
  const products = await listAdminProducts();

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
