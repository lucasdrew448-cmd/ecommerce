"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/types";

type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  reserved?: boolean;
};

const STORAGE_KEY = "headless-cart";
const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 12;

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
  window.dispatchEvent(new Event("cart-updated"));
}

const trustBadges = [
  { label: "Secure checkout", icon: "🔒" },
  { label: "Encrypted payment", icon: "🛡️" },
  { label: "100% inspected", icon: "🏍️" },
  { label: "Free returns", icon: "↩️" },
];

export default function CartClient({ products }: { products: Product[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    setItems(readCart());
  }, []);

  // Show up to 4 products from the API that aren't already in the cart
  const suggestedProducts = useMemo(() => {
    const cartItemIds = new Set(items.map((item) => item.id.replace(/-reservation$/, "")));
    return products
      .filter((p) => !cartItemIds.has(p.id))
      .slice(0, 4)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        currency: p.currency,
        image: p.image || p.images?.[0] || "",
      }));
  }, [products, items]);

  const updateQuantity = (id: string, delta: number) => {
    const next = items
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    setItems(next);
    writeCart(next);
  };

  const removeItem = (id: string) => {
    setRemovingId(id);
    // Small delay for visual feedback
    setTimeout(() => {
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      writeCart(next);
      setRemovingId(null);
    }, 200);
  };

  const clearCart = () => {
    setItems([]);
    writeCart([]);
  };

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "DIRT10") {
      setPromoApplied(true);
      setPromoError(null);
    } else {
      setPromoApplied(false);
      setPromoError("Invalid promo code. Try DIRT10 for 10% off.");
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoApplied ? subtotal * 0.1 : 0;
  // Reservation fees are deposits to hold a bike — no physical product is shipped,
  // so they don't count toward shipping or the free shipping threshold.
  const hasShippableItems = items.some((item) => !item.id.endsWith("-reservation"));
  const shippableSubtotal = items
    .filter((item) => !item.id.endsWith("-reservation"))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = hasShippableItems
    ? (shippableSubtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST)
    : 0;
  const tax = (subtotal - discount) * 0.0;
  const total = subtotal - discount + shipping + tax;
  const currency = items[0]?.currency || "$";
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const shippingProgress = useMemo(() => {
    if (shippableSubtotal === 0) return 0;
    return Math.min(100, (shippableSubtotal / FREE_SHIPPING_THRESHOLD) * 100);
  }, [shippableSubtotal]);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - shippableSubtotal);

  if (!items.length) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 text-4xl">
          🛒
        </span>
        <h2 className="mt-6 text-2xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
          Looks like you haven't added anything yet. Explore our collection of inspected, hand-picked used dirt bikes and riding gear.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700"
          >
            Browse the store
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          >
            Learn about us
          </Link>
        </div>

        {/* Suggested products */}
        {suggestedProducts.length > 0 ? (
          <div className="mt-12 border-t border-slate-100 pt-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">You might also like</h3>
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {suggestedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl text-slate-300" aria-hidden="true">
                        🏍️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-900">{product.name}</p>
                    <p className="mt-1 text-sm font-bold text-blue-600">
                      {product.currency}{product.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Cart items column */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-slate-900">Cart items</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {itemCount} item{itemCount === 1 ? "" : "s"} in your cart
            </p>
          </div>
          <button
            type="button"
            onClick={clearCart}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Clear cart
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="mt-4 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-3.5 sm:mt-5 sm:p-4">
          {remainingForFreeShipping > 0 ? (
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold text-blue-800 sm:text-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path d="M5 18H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-1" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 9h4l3 3v5a1 1 0 0 1-1 1h-1" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
                Add {currency}{remainingForFreeShipping.toFixed(2)} more for free shipping
              </p>
              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700 sm:text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              You've unlocked free express shipping!
            </p>
          )}
        </div>

        {/* Cart items list */}
        <ul className="mt-4 divide-y divide-slate-100 sm:mt-6">
          {items.map((item) => {
            const isReservation = item.id.endsWith("-reservation");
            const lineTotal = item.price * item.quantity;
            const isRemoving = removingId === item.id;

            return (
              <li
                key={item.id}
                className={`flex gap-3 py-4 transition-opacity duration-200 sm:gap-4 sm:py-5 ${isRemoving ? "opacity-0" : "opacity-100"}`}
              >
                {/* Product image placeholder */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 sm:h-28 sm:w-28 sm:rounded-2xl">
                  {isReservation ? (
                    <span className="text-2xl sm:text-3xl" aria-hidden="true">📋</span>
                  ) : (
                    <span className="text-2xl sm:text-3xl" aria-hidden="true">🏍️</span>
                  )}
                </div>

                {/* Item details */}
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2 sm:gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/product/${item.slug}`}
                        className="line-clamp-2 text-sm font-semibold text-slate-900 transition hover:text-blue-600 sm:line-clamp-1 sm:text-base"
                      >
                        {item.name}
                      </Link>
                      {isReservation ? (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-semibold text-amber-700">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Reservation fee
                        </span>
                      ) : (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          In stock
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-900 sm:text-base">
                      {item.currency}{lineTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Mobile: unit price below name */}
                  <span className="mt-1 text-xs text-slate-500 sm:hidden">
                    {item.currency}{item.price.toFixed(2)} each
                  </span>

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    {/* Quantity controls */}
                    <div className="flex items-center rounded-full border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                          <path d="M5 12h14" strokeLinecap="round" />
                        </svg>
                      </button>
                      <span className="w-8 text-center text-sm font-semibold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {/* Unit price (desktop only) */}
                    <span className="hidden text-xs text-slate-500 sm:inline">
                      {item.currency}{item.price.toFixed(2)} each
                    </span>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Continue shopping */}
        <div className="mt-4 border-t border-slate-100 pt-4 sm:mt-6 sm:pt-5">
          <Link
            href="/store"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-blue-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Continue shopping
          </Link>
        </div>
      </section>

      {/* Order summary column */}
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
          <p className="mt-1 text-xs text-slate-500">
            {itemCount} item{itemCount === 1 ? "" : "s"} · {currency}{subtotal.toFixed(2)} subtotal
          </p>

          {/* Mini item list */}
          <ul className="mt-4 space-y-2.5 sm:mt-5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[0.65rem] font-bold text-slate-600">
                    {item.quantity}
                  </span>
                  <span className="line-clamp-1 text-slate-700">{item.name}</span>
                </span>
                <span className="shrink-0 font-semibold text-slate-900">
                  {item.currency}{(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          {/* Promo code */}
          <div className="mt-4 sm:mt-5">
            <label htmlFor="promo" className="mb-1.5 block text-xs font-semibold text-slate-700">
              Promo code
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
              <input
                id="promo"
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoError(null);
                }}
                placeholder="e.g. DIRT10"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={applyPromo}
                className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
              >
                Apply
              </button>
            </div>
            {promoError ? (
              <p className="mt-1.5 text-xs font-medium text-rose-600">{promoError}</p>
            ) : null}
            {promoApplied ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                DIRT10 applied — 10% off
              </p>
            ) : null}
          </div>

          {/* Totals */}
          <dl className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-sm sm:mt-5 sm:pt-5">
            <div className="flex justify-between text-slate-600">
              <dt>Subtotal</dt>
              <dd className="font-medium text-slate-900">{currency}{subtotal.toFixed(2)}</dd>
            </div>
            {promoApplied ? (
              <div className="flex justify-between text-emerald-600">
                <dt>Discount (10%)</dt>
                <dd className="font-semibold">−{currency}{discount.toFixed(2)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between text-slate-600">
              <dt>Shipping</dt>
              <dd className="font-medium text-slate-900">
                {shipping === 0 ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Free
                  </span>
                ) : (
                  `${currency}${shipping.toFixed(2)}`
                )}
              </dd>
            </div>
            <div className="flex justify-between text-slate-600">
              <dt>Tax</dt>
              <dd className="font-medium text-slate-900">{currency}{tax.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-base font-bold text-slate-900">
              <dt>Total</dt>
              <dd>{currency}{total.toFixed(2)}</dd>
            </div>
          </dl>

          {/* Checkout button */}
          <Link
            href="/checkout"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 sm:mt-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
            </svg>
            Proceed to checkout
          </Link>

          {/* Trust badges */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 sm:mt-5 sm:pt-5">
            {trustBadges.map((badge) => (
              <span key={badge.label} className="flex items-center gap-1.5">
                <span aria-hidden="true">{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
