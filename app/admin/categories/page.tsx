import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listCategories } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";
import AdminCategoriesClient from "@/components/AdminCategoriesClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Categories",
};

export default async function AdminCategoriesPage() {
  const requestHeaders = await headers();
  if (!verifyAdminTokenFromHeaders(requestHeaders)) {
    redirect("/admin/login");
  }
  const categories = await listCategories(requestHeaders);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Category management</h1>
          <p>Create, edit, and remove product categories from the connected commerce API.</p>
        </div>
        <AdminCategoriesClient initialCategories={categories} />
      </section>
    </main>
  );
}