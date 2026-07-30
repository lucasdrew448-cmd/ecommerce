import Link from "next/link";
import { listAdminOrders, listAdminProducts } from "@/lib/admin";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const [products, orders] = await Promise.all([listAdminProducts(), listAdminOrders()]);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Admin dashboard</h1>
          <p>Create, edit, and remove catalog products while reviewing recent orders from your commerce API.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <p className="eyebrow">Products</p>
            <h2 className="text-3xl font-semibold text-slate-900">{products.length}</h2>
            <p className="mt-2 text-slate-600">Products available in the storefront.</p>
          </div>
          <div className="card">
            <p className="eyebrow">Orders</p>
            <h2 className="text-3xl font-semibold text-slate-900">{orders.length}</h2>
            <p className="mt-2 text-slate-600">Orders returned from the connected API.</p>
          </div>
          <div className="card">
            <p className="eyebrow">Actions</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href="/admin/products" className="button">Manage products</Link>
              <Link href="/admin/orders" className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700">
                View orders
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
