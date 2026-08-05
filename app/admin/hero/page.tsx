import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listHeroBanners } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";
import AdminHeroClient from "@/components/AdminHeroClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Hero Banners",
};

export default async function AdminHeroPage() {
  const requestHeaders = await headers();
  if (!verifyAdminTokenFromHeaders(requestHeaders)) {
    redirect("/admin/login");
  }
  const banners = await listHeroBanners(requestHeaders);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Hero banner management</h1>
          <p>Create, edit, and remove homepage hero banners from the connected commerce API.</p>
        </div>
        <AdminHeroClient initialBanners={banners} />
      </section>
    </main>
  );
}