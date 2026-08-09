"use client";

import { useState } from "react";
import type { Product } from "@/lib/commerce";

export default function ProductDetailsClient({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [reserved, setReserved] = useState(false);
  const reservationFee = 20.0;
  const formattedFee = `${product.currency}${reservationFee.toFixed(2)}`;

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
    window.dispatchEvent(new Event("cart-updated"));
    setAdded(true);
  };

  const reserveWithFee = () => {
    if (typeof window === "undefined") {
      return;
    }

    const currentCart = window.localStorage.getItem("headless-cart");
    const cart = currentCart ? JSON.parse(currentCart) : [];
    const reservationItemId = `${product.id}-reservation`;
    const existingReserve = cart.find((item: any) => item.id === reservationItemId);

    if (existingReserve) {
      existingReserve.quantity += 1;
    } else {
      cart.push({
        id: reservationItemId,
        slug: product.slug,
        name: `${product.name} reservation fee`,
        price: reservationFee,
        currency: product.currency,
        quantity: 1,
        reserved: true,
      });
    }

    window.localStorage.setItem("headless-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    setReserved(true);
  };

  return (
    <div className="card">
      <p className="eyebrow">Ready to purchase</p>
      <div className="flex flex-col gap-3">
        <button className="button" onClick={addToCart}>
          {added ? "Added to cart" : "Add to cart"}
        </button>
        <button
          className="button"
          onClick={reserveWithFee}
        >
          {reserved ? "Reservation added" : `Reserve with fee (${formattedFee})`}
        </button>
      </div>
    </div>
  );
}
