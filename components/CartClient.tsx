"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
};

const STORAGE_KEY = "headless-cart";

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? (JSON.parse(stored) as CartItem[]) : [];
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const removeItem = (id: string) => {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    writeCart(next);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!items.length) {
    return <p>Your cart is empty. Add a product from the store page.</p>;
  }

  return (
    <div>
      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.currency}{item.price.toFixed(2)} x {item.quantity}
              </span>
            </div>
            <button onClick={() => removeItem(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="cart-summary">
        <span>Total</span>
        <strong>{items[0]?.currency}{total.toFixed(2)}</strong>
      </div>
      <div className="mt-4 flex justify-end">
        <Link href="/checkout" className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
