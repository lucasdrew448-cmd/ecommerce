import Link from "next/link";
import { getCategories, getHeroBanners, getProducts, getStoreReviews } from "@/lib/commerce";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

const stats = [
  { value: "10k+", label: "Happy riders" },
  { value: "500+", label: "Dirt bikes in stock" },
  { value: "4.9★", label: "Average rating" },
  { value: "100%", label: "Inspected" },
];

const features = [
  {
    title: "Premium quality",
    description: "Quality used dirt bikes inspected and maintained by experienced mechanics.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Expert support",
    description: "Friendly guidance on bike maintenance, parts, and off-road riding from real specialists.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Safe shipping",
    description: "Secure crating and reliable delivery to protect your dirt bike in transit.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    title: "Inspected stock",
    description: "Every bike is inspected and serviced before it reaches your garage.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const steps = [
  {
    title: "Browse the collection",
    description: "Explore hand-picked used dirt bikes and riding gear curated for quality.",
  },
  {
    title: "Place your order",
    description: "Secure checkout with multiple payment options and fast, careful shipping.",
  },
  {
    title: "Ride your bike",
    description: "Receive your inspected, ready-to-ride dirt bike with support and guidance.",
  },
];

function Stars({ rating }: { rating: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${rounded} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true">{i < rounded ? "★" : "☆"}</span>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [products, heroBanners, reviewData, categories] = await Promise.all([
    getProducts(),
    getHeroBanners(),
    getStoreReviews({ limit: 6 }),
    getCategories(),
  ]);

  const hero = heroBanners[0];
  const featured = products.slice(0, 8);
  const topReviews = reviewData.data.slice(0, 3);
  const avgRating = Number(reviewData.averageRating) || 0;

  return (
    <main className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-blue-100 blur-3xl" />
          <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-cyan-100 blur-3xl" />
        </div>

        <div className="relative grid gap-8 p-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:p-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
            
              {hero ? "Premium Used Dirt Bikes" : "Used Dirt Bike Store"}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {hero?.title || "Quality used dirt bikes for your next ride."}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              {hero?.description ||
                "Browse our selection of inspected, hand-picked used dirt bikes — serviced for performance, checked for safety, and shipped to your door."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/store"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
              >
                Shop now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Learn more
              </Link>
            </div>

            {/* Stats */}
            <dl className="mt-10 grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center">
                  <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">{stat.label}</dt>
                  <dd className="mt-1 text-lg font-extrabold text-slate-900">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            {hero ? (
              <div className="overflow-hidden rounded-[24px] border border-slate-200 shadow-lg shadow-slate-900/10">
                <img
                  src={hero.url}
                  alt={hero.title || "Hero banner"}
                  className="h-64 w-full object-cover lg:h-96"
                />
              </div>
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Why choose us</p>
                <ul className="mt-4 space-y-3 text-slate-700">
                  <li className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">✓</span>
                    Inspected, serviced dirt bikes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">✓</span>
                    Expert support and guidance
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">✓</span>
                    Safe, careful shipping
                  </li>
                </ul>
              </div>
            )}

            {/* Inspection badge */}
            <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:max-w-[240px]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">100% Inspected</p>
                <p className="text-xs text-slate-500">Guaranteed on every bike</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories strip */}
      {categories.length > 0 ? (
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Shop by category</h2>
              <p className="mt-1 text-sm text-slate-600">Find exactly what your garage needs.</p>
            </div>
            <Link href="/store" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                href={`/store?category_id=${category.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 text-lg">
                  🏍️
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-slate-900 group-hover:text-blue-600">
                    {category.name}
                  </span>
                  {category.description ? (
                    <span className="block truncate text-xs text-slate-500">{category.description}</span>
                  ) : null}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Featured products */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Hand-picked</span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Featured products</h2>
            <p className="mt-1 text-sm text-slate-600">Explore our selection of quality used dirt bikes.</p>
          </div>
          <Link href="/store" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
            View all →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
            <p className="text-slate-600">No products available yet. Check back soon for new arrivals.</p>
            <Link href="/store" className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">
              Browse store
            </Link>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            See all products
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Why choose us */}
      <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Why choose us</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Built for quality and care
          </h2>
          <p className="mt-3 text-slate-600">
            From inspected stock to expert guidance, we make owning a dirt bike rewarding and worry-free.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-6 transition hover:border-blue-200 hover:bg-white hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-600/20 transition group-hover:scale-105">
                {feature.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section>
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">How it works</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Your bike, in three simple steps
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-base font-bold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.description}</p>
              {index < steps.length - 1 ? (
                <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-slate-300 md:block" aria-hidden="true">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      {topReviews.length > 0 ? (
        <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/40 p-8 shadow-sm lg:p-12">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Testimonials</span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                What our customers say
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Rated {reviewData.averageRating} / 5 from {reviewData.total} reviews.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
              <Stars rating={avgRating} />
              <span className="text-sm font-bold text-slate-900">{avgRating.toFixed(1)}</span>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {topReviews.map((review) => {
              const name = review.users?.full_name || review.users?.email || "Verified customer";
              const initial = name.charAt(0).toUpperCase();
              return (
                <article key={review.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <Stars rating={Math.round(review.rating)} />
                  {review.title ? <h3 className="mt-3 font-semibold text-slate-900">{review.title}</h3> : null}
                  {review.comment ? <p className="mt-2 flex-1 text-sm text-slate-600">{review.comment}</p> : null}
                  <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-bold text-white">
                      {initial}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">Verified customer</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* CTA banner */}
      <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 p-8 text-white shadow-lg lg:p-12">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to find your next dirt bike?</h2>
            <p className="mt-3 text-blue-100">
              Join thousands of riders who trust us for quality, inspected bikes and expert support.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/store"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Shop the collection
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}