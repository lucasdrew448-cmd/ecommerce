"use client";

import { useState } from "react";
import type { Product } from "@/lib/commerce";

export default function ProductDetailsClient({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    if (typeof window === "undefined") {
      return;
    }

    const currentCart = window.localStorage.getItem("headless-cart");
    const cart = currentCart ? JSON.parse(currentCart) : [];
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        quantity: 1,
      });
    }

    window.localStorage.setItem("headless-cart", JSON.stringify(cart));
    setAdded(true);
  };

  return (
    <div className="card">
      <p className="eyebrow">Ready to purchase</p>
      <p className="product-description">Add this item to a browser cart or integrate a headless cart API here.</p>
      <button className="button" onClick={addToCart}>
        {added ? "Added to cart" : "Add to cart"}
      </button>
    </div>
  );
}
