import Link from "next/link";
import { getCategories, getProducts } from "@/lib/commerce";

export const metadata = {
  title: "Store — Discus Fish",
};

export const dynamic = "force-dynamic";

interface StorePageProps {
  searchParams: {
    category_id?: string;
    search?: string;
  };
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const categoryId = searchParams.category_id ?? "";
  const search = searchParams.search ?? "";

  const [products, categories] = await Promise.all([
    getProducts({ category_id: categoryId || undefined, search: search || undefined }),
    getCategories(),
  ]);

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Shop the collection
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Browse all products</h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Discover premium discus fish and aquarium products.
        </p>

        <form method="get" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search products…"
              className="w-full rounded-full border border-slate-300 px-4 py-3"
            />
          </div>
          <div>
            <select
              name="category_id"
              defaultValue={categoryId}
              className="w-full rounded-full border border-slate-300 px-4 py-3 sm:w-auto"
            >
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Apply filters
          </button>
          {(categoryId || search) ? (
            <Link
              href="/store"
              className="rounded-full border border-slate-300 px-4 py-3 text-center font-semibold text-slate-700"
            >
              Clear
            </Link>
          ) : null}
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">No products found. Try adjusting your search or filter.</p>
          </div>
        ) : (
          products.map((product) => (
            <article key={product.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              {product.image || product.images?.[0] ? (
                <img
                  src={product.image || product.images?.[0]}
                  alt={product.name}
                  className="product-image mb-4 w-full object-cover"
                />
              ) : null}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                <span className="text-sm font-semibold text-blue-600">{product.currency}{product.price.toFixed(2)}</span>
              </div>
              {product.description ? <p className="mt-3 text-slate-600">{product.description}</p> : null}
              {product.stock === 0 ? (
                <p className="mt-2 text-sm font-semibold text-rose-600">Out of stock</p>
              ) : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/product/${product.slug}`} className="inline-flex rounded-full bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700">
                  View details
                </Link>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}