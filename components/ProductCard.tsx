import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductCard({ product }: { product: Product }) {
  const imageSrc = product.image || product.images?.[0];
  const price = Number.isFinite(product.price) ? product.price : 0;
  const stockAvailable = product.stock === undefined || product.stock > 0;

  return (
    <article className="card flex flex-col">
      {imageSrc ? (
        <img src={imageSrc} alt={product.name} className="product-image mb-4 w-full object-cover" />
      ) : (
        <div className="product-image mb-4 flex items-center justify-center rounded-xl bg-slate-100 text-slate-400">
          No image
        </div>
      )}
      <span className="eyebrow">{product.currency || "$"}{price.toFixed(2)}</span>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">{product.name}</h3>
      {typeof product.description === "string" && product.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{product.description}</p>
      ) : null}
      {!stockAvailable ? (
        <p className="mt-2 text-sm font-semibold text-rose-600">Out of stock</p>
      ) : null}
      <div className="mt-4 flex flex-1 items-end">
        <Link href={`/product/${product.slug}`} className="button w-full">
          View product
        </Link>
      </div>
    </article>
  );
}