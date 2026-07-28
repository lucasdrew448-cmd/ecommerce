import Link from "next/link";
import { getProducts } from "@/lib/commerce";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      <section className="hero rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow">Headless Ecommerce</p>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Build a faster, more flexible storefront.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-slate-600">
              Browse products, manage a cart, and explore a composable shopping experience designed
              for modern commerce teams.
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

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Why teams choose it</p>
            <ul className="mt-4 space-y-3 text-slate-600">
              <li>• Fast Next.js rendering for better performance</li>
              <li>• API-first architecture for composable integrations</li>
              <li>• Mobile-friendly layouts for every device</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Featured products</h2>
          <p>Connect these pages to your commerce API or use the mock fallback data.</p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
