"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

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

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 12 : 0;
  const total = subtotal + shipping;

  const isComplete = useMemo(() => {
    return form.name && form.email && form.address;
  }, [form]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    alert("Checkout complete — this is a demo flow for your headless storefront.");
  };

  return (
    <main className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Checkout
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Complete your order</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Alex Morgan"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="alex@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Shipping address</label>
            <textarea
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              rows={4}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Market Street"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={!isComplete}
          >
            Place order
          </button>
        </form>
      </section>

      <aside className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
        {items.length > 0 ? (
          <div className="mt-6 space-y-3 text-slate-600">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>
                  {item.currency}
                  {(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-slate-700">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-slate-600">Your cart is empty. Add products before checking out.</p>
        )}
      </aside>
    </main>
  );
}
