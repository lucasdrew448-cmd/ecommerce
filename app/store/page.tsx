import Link from "next/link";
import { getProducts } from "@/lib/commerce";

export default async function StorePage() {
  const products = (await getProducts()) ?? [];

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Shop the collection
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Browse all products</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Discover the latest headless commerce products in a clean, organized storefront.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const details = Array.isArray(product.details) ? product.details : [];
          const price = Number.isFinite(product.price) ? product.price : 0;
          return (
            <article key={product.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {product.image ? (
                <img src={product.image} alt={product.name} className="product-image mb-4 w-full object-cover" />
              ) : null}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                <span className="text-sm font-semibold text-blue-600">{product.currency}{price.toFixed(2)}</span>
              </div>
              <p className="mt-3 text-slate-600">{product.description}</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-500">
                {details.map((detail) => (
                  <li key={detail}>• {detail}</li>
                ))}
              </ul>
              <Link href={`/product/${product.slug}`} className="mt-6 inline-flex rounded-full bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
                View details
              </Link>
            </article>
          );
        })}
      </section>
    </main>
  );
}
