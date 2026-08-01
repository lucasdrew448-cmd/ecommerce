"use client";

import { useState } from "react";
import type { Review } from "@/lib/types";

export default function AdminReviewsClient({ initialReviews }: { initialReviews: { data: Review[]; total: number } }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews.data);
  const [total, setTotal] = useState(initialReviews.total);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async (status = statusFilter) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);

    const qs = params.toString();
    const response = await fetch(`/api/admin/reviews${qs ? `?${qs}` : ""}`, { cache: "no-store" });
    const data = await response.json();
    setReviews((data.data as Review[]) ?? []);
    setTotal((data.total as number) ?? 0);
  };

  const handleStatusChange = async (review: Review, newStatus: string) => {
    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      setMessage(`Review ${newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : "set to pending"}.`);
      await refresh();
    } else {
      const data = await response.json();
      setMessage(data.error || "Unable to update review.");
    }
  };

  const handleDelete = async (review: Review) => {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    const response = await fetch(`/api/admin/reviews/${review.id}`, { method: "DELETE" });
    if (response.ok) {
      setMessage("Review deleted.");
      await refresh();
    } else {
      const data = await response.json();
      setMessage(data.error || "Unable to delete review.");
    }
  };

  const renderStars = (rating: number) => {
    return "★".repeat(Math.max(0, Math.min(5, Math.round(rating)))) +
      "☆".repeat(Math.max(0, 5 - Math.round(rating)));
  };

  return (
    <div className="grid gap-6">
      <section className="card">
        <div className="section-header" style={{ padding: 0, marginBottom: 16 }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2>Reviews</h2>
              <p>Moderate customer reviews ({total} total).</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Filter</label>
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  refresh(event.target.value);
                }}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {message ? <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

        <div className="grid gap-4">
          {reviews.length === 0 ? (
            <p className="text-slate-600">No reviews match the current filter.</p>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">{renderStars(review.rating)}</span>
                      <span className="font-semibold text-slate-900">{review.title || "Untitled review"}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      by {review.users?.full_name || review.users?.email || "Anonymous"}
                      {review.products?.name ? ` on ${review.products.name}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                    review.status === "approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : review.status === "rejected"
                        ? "bg-rose-50 text-rose-700"
                        : "bg-amber-50 text-amber-700"
                  }`}>
                    {review.status}
                  </span>
                </div>

                {review.comment ? <p className="mt-3 text-slate-700">{review.comment}</p> : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {review.status !== "approved" ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(review, "approved")}
                      className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                  ) : null}
                  {review.status !== "rejected" ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(review, "rejected")}
                      className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                    >
                      Reject
                    </button>
                  ) : null}
                  {review.status !== "pending" ? (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(review, "pending")}
                      className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      Set pending
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(review)}
                    className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}