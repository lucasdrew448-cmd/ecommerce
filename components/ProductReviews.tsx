import type { Review } from "@/lib/types";

export default function ProductReviews({ reviews, averageRating, total }: {
  reviews: Review[];
  averageRating: string;
  total: number;
}) {
  const renderStars = (rating: number) => {
    return "★".repeat(Math.max(0, Math.min(5, Math.round(rating)))) +
      "☆".repeat(Math.max(0, 5 - Math.round(rating)));
  };

  if (reviews.length === 0) {
    return (
      <section className="card">
        <div className="section-header" style={{ padding: 0, marginBottom: 12 }}>
          <h2>Customer reviews</h2>
          <p>No reviews yet for this product.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <div className="section-header" style={{ padding: 0, marginBottom: 16 }}>
        <h2>Customer reviews</h2>
        <p>
          {averageRating} / 5 average from {total} review{total === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="grid gap-4">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">{renderStars(review.rating)}</span>
              {review.title ? <span className="font-semibold text-slate-900">{review.title}</span> : null}
            </div>
            {review.comment ? <p className="mt-2 text-slate-700">{review.comment}</p> : null}
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {review.users?.full_name || review.users?.email || "Verified customer"}
              {review.helpful_count ? ` · ${review.helpful_count} found this helpful` : ""}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}