import Link from "next/link";
import { getProducts } from "@/lib/commerce";
import ProductCard from "@/components/ProductCard";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main>
      <header className="hero">
        <div>
          <p className="eyebrow">Headless Ecommerce</p>
          <h1>Build a fast composable storefront with Next.js.</h1>
          <p>Browse products, view details, and manage a client-side cart backed by headless commerce APIs.</p>
        </div>
        <Link href="/cart" className="button">
          View cart
        </Link>
      </header>

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
