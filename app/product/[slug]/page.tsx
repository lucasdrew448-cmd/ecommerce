import { notFound } from "next/navigation";
import { getProductBySlug, getProductReviews } from "@/lib/commerce";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const reviewData = product.id
    ? await getProductReviews(product.id)
    : { data: [], averageRating: "0", total: 0 };

  return (
    <main>
      <section className="section product-detail">
        <div>
          <ProductGallery product={product} />
          <p className="eyebrow">Product details</p>
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          {product.stock !== undefined ? (
            <p className={`mb-3 text-sm font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-rose-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
          ) : null}
          <ul className="feature-list">
            {product.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>

        <div className="product-panel">
          <div className="price-block">
            <span className="price">{product.currency}{product.price.toFixed(2)}</span>
            <p className="price-note">Fast and secure checkout</p>
          </div>
          <ProductDetailsClient product={product} />
        </div>
      </section>

      <section className="section">
        <ProductReviews
          reviews={reviewData.data}
          averageRating={reviewData.averageRating}
          total={reviewData.total}
        />
      </section>
    </main>
  );
}