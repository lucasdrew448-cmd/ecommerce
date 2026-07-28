import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/commerce";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import ProductGallery from "@/components/ProductGallery";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <main>
      <section className="section product-detail">
        <div>
          <ProductGallery product={product} />
          <p className="eyebrow">Product details</p>
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <ul className="feature-list">
            {product.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </div>

        <div className="product-panel">
          <div className="price-block">
            <span className="price">{product.currency}{product.price.toFixed(2)}</span>
            <p className="price-note">Fast, composable checkout ready.</p>
          </div>
          <ProductDetailsClient product={product} />
        </div>
      </section>
    </main>
  );
}
