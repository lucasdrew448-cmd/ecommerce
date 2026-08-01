import Link from "next/link";
import { getHeroBanners, getProducts, getStoreReviews } from "@/lib/commerce";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, heroBanners, reviewData] = await Promise.all([
    getProducts(),
    getHeroBanners(),
    getStoreReviews({ limit: 6 }),
  ]);

  const hero = heroBanners[0];

  return (
    <main>
      {hero ? (
        <section className="hero rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="eyebrow">Premium Discus Fish</p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {hero.title || "Welcome to Discus World"}
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                {hero.description || "Premium discus fish for sale"}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/store" className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                  Shop now
                </Link>
                <Link href="/about" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                  Learn more
                </Link>
              </div>
            </div>
            <div className="overflow-hidden rounded-[24px]">
              <img src={hero.url} alt={hero.title || "Hero banner"} className="h-64 w-full object-cover lg:h-80" />
            </div>
          </div>
        </section>
      ) : (
        <section className="hero rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="eyebrow">Discus Fish Store</p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Premium discus fish for your aquarium.
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                Browse our selection of healthy, hand-picked discus fish.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/store" className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
                  Shop now
                </Link>
                <Link href="/contact" className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50">
                  Contact us
                </Link>
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Why choose us</p>
              <ul className="mt-4 space-y-3 text-slate-600">
                <li>• Healthy, quarantined discus fish</li>
                <li>• Expert support and guidance</li>
                <li>• Safe, careful shipping</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {reviewData.data.length > 0 ? (
        <section className="section">
          <div className="section-header">
            <h2>What our customers say</h2>
            <p>
              Rated {reviewData.averageRating} / 5 from {reviewData.total} reviews.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviewData.data.slice(0, 3).map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-1 text-amber-500">
                  {"★".repeat(Math.max(0, Math.min(5, Math.round(review.rating))))}
                  {"☆".repeat(Math.max(0, 5 - Math.round(review.rating)))}
                </div>
                {review.title ? <h3 className="mt-2 font-semibold text-slate-900">{review.title}</h3> : null}
                {review.comment ? <p className="mt-2 text-sm text-slate-600">{review.comment}</p> : null}
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {review.users?.full_name || review.users?.email || "Verified customer"}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section-header">
          <h2>Why choose us</h2>
          <p>Built for speed, flexibility, and a polished shopping experience from first click to checkout.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Premium quality</h3>
            <p className="mt-2 text-slate-600">Healthy, vibrant discus fish raised with care and attention.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Expert support</h3>
            <p className="mt-2 text-slate-600">Friendly guidance on fish care, water quality, and aquarium setup.</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Safe shipping</h3>
            <p className="mt-2 text-slate-600">Careful packaging and reliable delivery to protect your fish.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Featured products</h2>
          <p>Explore our selection of premium discus fish.</p>
        </div>
        <div className="product-grid">
          {products.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}