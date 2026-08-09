"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import cardValidator from "card-validator";
import searchIcon from "@/components/svg/Secure-Medium-Silver.svg";
import paymentIcon from "@/components/svg/payment-card-svgrepo-com.svg";
import inspect from "@/components/svg/search-look-inspect-magnifying-glass-svgrepo-com.svg"

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

const trustBadges = [
  { label: "Secure checkout", icon: searchIcon },
  { label: "Encrypted payment", icon: paymentIcon },
  { label: "100% inspected", icon: inspect },
];

function SectionHeader({ index, title, subtitle }: { index: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {index}
      </span>
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-600">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
      </svg>
      {message}
    </p>
  );
}

export default function CheckoutPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    country: "United States",
    billingAddress: "",
    billingAddressNumber: "",
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [sameAsShipping, setSameAsShipping] = useState(true);

  useEffect(() => {
    setItems(readCart());
  }, []);

  // Keep billing fields in sync with shipping when "same as shipping" is on
  useEffect(() => {
    if (sameAsShipping) {
      setForm((prev) => ({
        ...prev,
        billingAddress: prev.address,
        billingCountry: prev.country,
      }));
    }
  }, [sameAsShipping, form.address, form.country]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Reservation fees are deposits to hold a bike — no physical product is shipped,
  // so they don't incur shipping costs.
  const hasShippableItems = items.some((item) => !item.id.endsWith("-reservation"));
  const shipping = hasShippableItems ? 12 : 0;
  const tax = subtotal * 0.0;
  const total = subtotal + shipping + tax;
  const currency = items[0]?.currency || "$";

  // Card validation using card-validator
  const cardNumberValidation = useMemo(() => {
    const clean = form.cardNumber.replace(/\s/g, "");
    if (!clean) return { valid: false, card: null as null | { type: string; niceType: string; gaps: number[]; lengths: number[]; code: { name: string; size: number } }, error: null as string | null };
    const validation = cardValidator.number(clean);
    return {
      valid: validation.isValid,
      card: validation.card,
      error: validation.isValid ? null : "Card number is invalid.",
    };
  }, [form.cardNumber]);

  const cardType = cardNumberValidation.card?.niceType || null;
  const cvvLength = cardNumberValidation.card?.code?.size || 3;

  const expiryValidation = useMemo(() => {
    if (!form.expiry) return { valid: false, error: null as string | null };
    const validation = cardValidator.expirationDate(form.expiry);
    return {
      valid: validation.isValid,
      error: validation.isValid ? null : "Expiry date is invalid or has passed.",
    };
  }, [form.expiry]);

  const cvvValidation = useMemo(() => {
    if (!form.cvv) return { valid: false, error: null as string | null };
    const validation = cardValidator.cvv(form.cvv, cvvLength);
    return {
      valid: validation.isValid,
      error: validation.isValid ? null : `CVV must be ${cvvLength} digits.`,
    };
  }, [form.cvv, cvvLength]);

  const cardNameValidation = useMemo(() => {
    if (!form.cardName) return { valid: false, error: null as string | null };
    const validation = cardValidator.cardholderName(form.cardName);
    return {
      valid: validation.isValid,
      error: validation.isValid ? null : "Cardholder name is required.",
    };
  }, [form.cardName]);

  const cardValidation = {
    number: cardNumberValidation,
    expiry: expiryValidation,
    cvv: cvvValidation,
    name: cardNameValidation,
  };

  const isCardValid = cardNumberValidation.valid && expiryValidation.valid && cvvValidation.valid && cardNameValidation.valid;

  const billingAddressValue = sameAsShipping ? form.address : [form.billingAddressNumber, form.billingAddress].filter(Boolean).join(" ");

  const isComplete = useMemo(() => {
    return Boolean(form.name && form.email && form.address && billingAddressValue && isCardValid);
  }, [form, billingAddressValue, isCardValid]);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const formatted = digits.match(/.{1,4}/g)?.join(" ") || "";
    return formatted;
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!isCardValid) {
      setError("Please fix the card validation errors before placing your order.");
      setSubmitting(false);
      return;
    }

    const orderPayload = {
      items: items.map((item) => ({
        product_id: item.id.replace(/-reservation$/, ""),
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
      billing_address: billingAddressValue,
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

  const showFieldError = (field: string, validation: { valid: boolean; error: string | null }) => {
    return touched[field] && !validation.valid ? validation.error : null;
  };

  const baseInput =
    "w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30";
  const inputClass = (hasError: boolean) =>
    `${baseInput} ${hasError ? "border-rose-400 bg-rose-50 focus:border-rose-400 focus:ring-rose-500/30" : "border-slate-300 focus:border-blue-500"}`;

  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

  return (
    <main className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
          <Link href="/cart" className="transition hover:text-slate-700">Cart</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900">Checkout</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Checkout</h1>
        <p className="text-sm text-slate-600">
          Complete your order securely. Your dirt bike will be carefully crated and shipped with our inspection guarantee.
        </p>
      </div>

      {items.length === 0 ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-cyan-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-blue-600" aria-hidden="true">
              <rect x="3" y="6" width="18" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 10h17.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 15h2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 text-sm text-slate-600">Add products before checking out.</p>
          <Link
            href="/store"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Browse the store
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </section>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Form column */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact */}
              <div className="space-y-4">
                <SectionHeader index={1} title="Contact information" subtitle="We'll send your order confirmation here." />
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass} htmlFor="name">Full name</label>
                    <input
                      id="name"
                      className={inputClass(false)}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Alex Morgan"
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="email">Email</label>
                    <input
                      id="email"
                      className={inputClass(false)}
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="alex@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping */}
              {!sameAsShipping ? (
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <SectionHeader index={2} title="Shipping address" subtitle="Where should we deliver your order?" />
                  <div>
                    <label className={labelClass} htmlFor="address">Street address</label>
                    <textarea
                      id="address"
                      className={`${inputClass(false)} min-h-[72px] resize-y`}
                      rows={2}
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="123 Market Street, Apt 4B"
                      autoComplete="street-address"
                      required
                    />
                  </div>
                </div>
              ) : null}

              {/* Payment */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <SectionHeader index={3} title="Payment details" subtitle="Encrypted and securely processed." />
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                          <rect x="2" y="5" width="20" height="14" rx="2" />
                          <path d="M2 10h20" strokeLinecap="round" />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold text-slate-900">Credit / debit card</span>
                    </div>
                    {cardType ? (
                      <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {cardType}
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className={labelClass} htmlFor="cardName">Name on card</label>
                      <input
                        id="cardName"
                        className={inputClass(!!showFieldError("cardName", cardValidation.name))}
                        value={form.cardName}
                        onChange={(e) => setForm({ ...form, cardName: e.target.value })}
                        onBlur={() => handleBlur("cardName")}
                        placeholder="Alex Morgan"
                        autoComplete="cc-name"
                        required
                      />
                      <FieldError message={showFieldError("cardName", cardValidation.name)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass} htmlFor="cardNumber">Card number</label>
                      <div className="relative">
                        <input
                          id="cardNumber"
                          className={`${inputClass(!!showFieldError("cardNumber", cardValidation.number))} pr-10`}
                          value={form.cardNumber}
                          onChange={(e) => setForm({ ...form, cardNumber: formatCardNumber(e.target.value) })}
                          onBlur={() => handleBlur("cardNumber")}
                          placeholder="4242 4242 4242 4242"
                          inputMode="numeric"
                          autoComplete="cc-number"
                          required
                        />
                        {cardNumberValidation.valid ? (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        ) : null}
                      </div>
                      <FieldError message={showFieldError("cardNumber", cardValidation.number)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:col-span-2">
                      <div className="min-w-0">
                        <label className={labelClass} htmlFor="expiry">Expiry</label>
                        <input
                          id="expiry"
                          className={inputClass(!!showFieldError("expiry", cardValidation.expiry))}
                          value={form.expiry}
                          onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })}
                          onBlur={() => handleBlur("expiry")}
                          placeholder="MM/YY"
                          autoComplete="cc-exp"
                          required
                        />
                        <FieldError message={showFieldError("expiry", cardValidation.expiry)} />
                      </div>
                      <div className="min-w-0">
                        <label className={labelClass} htmlFor="cvv">CVV</label>
                        <input
                          id="cvv"
                          className={inputClass(!!showFieldError("cvv", cardValidation.cvv))}
                          value={form.cvv}
                          onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, cvvLength) })}
                          onBlur={() => handleBlur("cvv")}
                          placeholder="123"
                          inputMode="numeric"
                          autoComplete="cc-csc"
                          required
                        />
                        <FieldError message={showFieldError("cvv", cardValidation.cvv)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div className="space-y-4 border-t border-slate-100 pt-6">
                <SectionHeader index={4} title="Billing address" subtitle="The address associated with your card." />
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Billing details</p>
                      <p className="text-xs text-slate-500">You can use your shipping address or enter a different billing address.</p>
                    </div>
                    {sameAsShipping ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5" aria-hidden="true">
                          <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Matching shipping
                      </span>
                    ) : null}
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="flex items-center gap-1.5">
                      <span className="text-emerald-600">✓</span>
                      Use shipping address for billing
                    </span>
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass} htmlFor="billingAddressNumber">Phone number</label>
                      <input
                        id="billingAddressNumber"
                        className={inputClass(false)}
                        value={form.billingAddressNumber}
                        onChange={(e) => setForm({ ...form, billingAddressNumber: e.target.value })}
                        placeholder="+1 555 123 4567"
                        disabled={sameAsShipping}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="billingAddress">Billing street address</label>
                      <textarea
                        id="billingAddress"
                        className={`${inputClass(false)} min-h-[72px] resize-y`}
                        rows={2}
                        value={form.billingAddress}
                        onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
                        placeholder="Billing Avenue"
                        required
                        disabled={sameAsShipping}
                      />
                    </div>
                  </div>
                  <div className="grid gap-4 grid-cols-3 sm:grid-cols-3">
                    <div>
                      <label className={labelClass} htmlFor="billingCity">City</label>
                      <input
                        id="billingCity"
                        className={inputClass(false)}
                        value={form.billingCity}
                        onChange={(e) => setForm({ ...form, billingCity: e.target.value })}
                        placeholder="New York"
                        autoComplete="address-level2"
                        disabled={sameAsShipping}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="billingState">State</label>
                      <input
                        id="billingState"
                        className={inputClass(false)}
                        value={form.billingState}
                        onChange={(e) => setForm({ ...form, billingState: e.target.value })}
                        placeholder="NY"
                        autoComplete="address-level1"
                        disabled={sameAsShipping}
                      />
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="billingZip">ZIP</label>
                      <input
                        id="billingZip"
                        className={inputClass(false)}
                        value={form.billingZip}
                        onChange={(e) => setForm({ ...form, billingZip: e.target.value })}
                        placeholder="10001"
                        autoComplete="postal-code"
                        disabled={sameAsShipping}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error ? (
                <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!isComplete || submitting}
              >
                {submitting ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.2-8.6" strokeLinecap="round" />
                    </svg>
                    Placing order…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                    </svg>
                    Place order — {currency}{total.toFixed(2)}
                  </>
                )}
              </button>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-5 text-xs font-medium text-slate-500">
                {trustBadges.map((badge) => (
                  <span key={badge.label} className="flex items-center gap-2">
                    <img src={badge.icon} alt="" className="h-4 w-4" aria-hidden="true" />
                    {badge.label}
                  </span>
                ))}
              </div>
            </form>
          </section>

          {/* Summary column */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8">
              <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
              <p className="mt-1 text-xs text-slate-500">{items.length} item{items.length === 1 ? "" : "s"} in your cart</p>

              <ul className="mt-5 space-y-3">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.currency}{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-900">
                      {item.currency}{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-2.5 border-t border-slate-200 pt-5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-slate-900">{currency}{subtotal.toFixed(2)}</dd>
                </div>
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
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900">
                  <dt>Total</dt>
                  <dd>{currency}{total.toFixed(2)}</dd>
                </div>
              </dl>

              {/* Promo placeholder */}
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-white p-3">
                <p className="text-xs font-semibold text-slate-600">Have a promo code?</p>
                <p className="mt-0.5 text-xs text-slate-400">Apply it on the cart page before checkout.</p>
              </div>

              <Link
                href="/cart"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Edit cart
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}