import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { listAdminReviews } from "@/lib/admin";
import { verifyAdminTokenFromHeaders } from "@/lib/auth";
import AdminReviewsClient from "@/components/AdminReviewsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Reviews",
};

export default async function AdminReviewsPage() {
  const requestHeaders = await headers();
  if (!(await verifyAdminTokenFromHeaders(requestHeaders))) {
    redirect("/admin/login");
  }
  const reviews = await listAdminReviews({}, requestHeaders);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Review moderation</h1>
          <p>Approve, reject, or remove customer reviews from the connected commerce API.</p>
        </div>
        <AdminReviewsClient initialReviews={reviews} />
      </section>
    </main>
  );
}