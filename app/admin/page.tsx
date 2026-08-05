import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listAdminOrders, listAdminProducts } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const requestHeaders = await headers();
  if (!verifyAdminTokenFromHeaders(requestHeaders)) {
    redirect("/admin/login");
  }
  const [products, orders] = await Promise.all([listAdminProducts(requestHeaders), listAdminOrders(requestHeaders)]);

  const managementLinks = [
    { href: "/admin/products", label: "Products", description: "Create, edit, remove catalog products" },
    { href: "/admin/categories", label: "Categories", description: "Manage product categories" },
    { href: "/admin/product-types", label: "Product types", description: "Manage product types" },
    { href: "/admin/suppliers", label: "Suppliers", description: "Manage fish suppliers" },
    { href: "/admin/hero", label: "Hero banners", description: "Manage homepage slider" },
    { href: "/admin/reviews", label: "Reviews", description: "Approve, reject, moderate reviews" },
    { href: "/admin/orders", label: "Orders", description: "Update statuses and send emails" },
  ];

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1>Admin dashboard</h1>
              <p>Manage the full Discus ecommerce catalog, reviews, orders, and site content.</p>
            </div>
            <Link href="/admin/logout" className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700">
              Logout
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <p className="eyebrow">Catalog</p>
            <h2 className="text-3xl font-semibold text-slate-900">{managementLinks.length - 3}</h2>
            <p className="mt-2 text-slate-600">Catalog management sections.</p>
          </div>
          <div className="card">
            <p className="eyebrow">Content</p>
            <h2 className="text-3xl font-semibold text-slate-900">{2}</h2>
            <p className="mt-2 text-slate-600">Hero banners and reviews.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Management tools</h2>
          <p>Use the sections below to manage your Discus ecommerce store.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {managementLinks.map((link) => (
            <Link key={link.href} href={link.href} className="card transition hover:border-blue-300 hover:shadow-sm">
              <h3 className="font-semibold text-slate-900">{link.label}</h3>
              <p className="mt-2 text-sm text-slate-600">{link.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                Manage →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}