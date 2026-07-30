"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export default function ProductGallery({ product }: { product: Product }) {
  const productImages = (() => {
    const mainImage = product.image;
    const directImages = Array.isArray(product.images) ? product.images : [];
    const additionalImages = (product as Product & { additional_images?: unknown }).additional_images;

    const parsedAdditionalImages = Array.isArray(additionalImages)
      ? additionalImages.filter((value): value is string => typeof value === "string")
      : typeof additionalImages === "string"
      ? [additionalImages]
      : additionalImages && typeof additionalImages === "object"
      ? (() => {
          const nested = additionalImages as Record<string, unknown>;
          if (Array.isArray(nested.images)) {
            return nested.images.filter((value): value is string => typeof value === "string");
          }
          if (Array.isArray(nested.urls)) {
            return nested.urls.filter((value): value is string => typeof value === "string");
          }
          if (typeof nested.url === "string") {
            return [nested.url];
          }
          return [];
        })()
      : [];

    const images = [mainImage, ...directImages, ...parsedAdditionalImages].filter(
      (value): value is string => typeof value === "string" && value.length > 0
    );

    return images;
  })();

  const images = productImages.length ? productImages : product.image ? [product.image] : [];
  const [selectedImage, setSelectedImage] = useState(images[0] ?? "");

  if (!images.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      <img
        src={selectedImage}
        alt={`${product.name} preview`}
        className="product-hero mb-2 w-full object-cover"
      />

      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => {
          const isActive = selectedImage === image;

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`overflow-hidden rounded-2xl border transition ${
                isActive ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-200"
              }`}
            >
              <img
                src={image}
                alt={`${product.name} thumbnail ${index + 1}`}
                className="h-20 w-full object-cover"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
