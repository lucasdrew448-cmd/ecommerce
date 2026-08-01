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
    city: "",
    state: "",
    zip: "",
    country: "United States",
    billingAddress: "",
    billingCity: "",
    billingState: "",
    billingZip: "",
    billingCountry: "United States",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 12 : 0;
  const total = subtotal + shipping;

  const isComplete = useMemo(() => {
    return form.name && form.email && form.address && form.billingAddress && form.cardName && form.cardNumber && form.expiry && form.cvv;
  }, [form]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const orderPayload = {
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      customer_email: form.email,
      customer_name: form.name,
      shipping_address: form.address,
      shipping_destination: "domestic",
      shipping_method: "standard",
      shipping_cost: shipping,
      total_price: total,
      card_number: form.cardNumber.replace(/\s/g, ""),
      card_name: form.cardName,
      card_expiry: form.expiry,
      card_cvv: form.cvv,
      billing_address: form.billingAddress,
      billing_city: form.billingCity,
      billing_state: form.billingState,
      billing_zip: form.billingZip,
      billing_country: form.billingCountry,
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to place order.");
        return;
      }

      const orderId = data.id || data.order_id;
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("cart-updated"));
      window.location.href = `/order/${orderId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to place order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Checkout
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Complete your order</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Shipping address</label>
            <textarea
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="123 Market Street"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="New York"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">State</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="NY"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">ZIP</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={form.zip}
                onChange={(e) => setForm({ ...form, zip: e.target.value })}
                placeholder="10001"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Billing address</label>
            <textarea
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              rows={3}
              value={form.billingAddress}
              onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
              placeholder="456 Billing Avenue"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Billing city</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={form.billingCity}
                onChange={(e) => setForm({ ...form, billingCity: e.target.value })}
                placeholder="New York"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Billing state</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={form.billingState}
                onChange={(e) => setForm({ ...form, billingState: e.target.value })}
                placeholder="NY"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Billing ZIP</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={form.billingZip}
                onChange={(e) => setForm({ ...form, billingZip: e.target.value })}
                placeholder="10001"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="text-lg font-semibold text-slate-900">Card details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name on card</label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  value={form.cardName}
                  onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                  placeholder="Alex Morgan"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Card number</label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  value={form.cardNumber}
                  onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Expiry</label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">CVV</label>
                <input
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                  value={form.cvv}
                  onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </div>

          {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            className="w-full rounded-full bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={!isComplete || submitting}
          >
            {submitting ? "Placing order…" : "Place order"}
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