import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listAdminProducts, listCategories, listProductTypes, listSuppliers } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";
import AdminProductsClient from "@/components/AdminProductsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Products",
};

export default async function AdminProductsPage() {
  const requestHeaders = await headers();
  if (!verifyAdminTokenFromHeaders(requestHeaders)) {
    redirect("/admin/login");
  }

  const [products, categories, productTypes, suppliers] = await Promise.all([
    listAdminProducts(requestHeaders),
    listCategories(requestHeaders),
    listProductTypes(requestHeaders),
    listSuppliers(requestHeaders),
  ]);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Product management</h1>
          <p>Manage catalog items from the external commerce API directly inside the storefront.</p>
        </div>
        <AdminProductsClient
          initialProducts={products}
          categories={categories}
          productTypes={productTypes}
          suppliers={suppliers}
        />
      </section>
    </main>
  );
}