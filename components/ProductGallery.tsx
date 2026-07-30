"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

export default function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length ? product.images : product.image ? [product.image] : [];
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
