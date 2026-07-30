import Link from "next/link";
import type { Product } from "@/lib/commerce";

export default function ProductCard({ product }: { product: Product }) {
  const imageSrc = product.image || product.images?.[0];

  return (
    <article className="card">
      {imageSrc ? (
        <img src={imageSrc} alt={product.name} className="product-image mb-4 w-full object-cover" />
      ) : null}
      <span className="eyebrow">{product.currency}{product.price.toFixed(2)}</span>
      <h3>{product.name}</h3>
      <Link href={`/product/${product.slug}`} className="button">
        View product
      </Link>
    </article>
  );
}
