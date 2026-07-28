import Link from "next/link";
import type { Product } from "@/lib/commerce";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      {product.image ? (
        <img src={product.image} alt={product.name} className="product-image mb-4 w-full object-cover" />
      ) : null}
      <span className="eyebrow">{product.currency}{product.price.toFixed(2)}</span>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <Link href={`/product/${product.slug}`} className="button">
        View product
      </Link>
    </article>
  );
}
