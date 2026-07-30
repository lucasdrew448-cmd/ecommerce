"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

type AdminFormState = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  image: string;
  details: string;
};

const emptyForm = (): AdminFormState => ({
  id: "",
  slug: "",
  name: "",
  description: "",
  price: "",
  currency: "$",
  image: "",
  details: "",
});

interface AdminProductsClientProps {
  initialProducts: Product[];
}

export default function AdminProductsClient({ initialProducts }: AdminProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState<AdminFormState>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);

  const refreshProducts = async () => {
    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await response.json();
    setProducts(data as Product[]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      id: form.id || undefined,
      slug: form.slug || undefined,
      name: form.name,
      description: form.description,
      price: Number(form.price || 0),
      currency: form.currency,
      image: form.image || undefined,
      details: form.details.split("\n").map((item) => item.trim()).filter(Boolean),
    };

    const endpoint = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = form.id ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Unable to save the product.");
      return;
    }

    setMessage(form.id ? "Product updated." : "Product created.");
    setForm(emptyForm());
    await refreshProducts();
  };

  const startEditing = (product: Product) => {
    setForm({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: String(product.price),
      currency: product.currency,
      image: product.image || "",
      details: product.details.join("\n"),
    });
    setMessage(`Editing ${product.name}.`);
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(`Delete ${product.name}?`);
    if (!confirmed) {
      return;
    }

    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (response.ok) {
      setMessage(`Deleted ${product.name}.`);
      await refreshProducts();
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="card">
        <div className="section-header" style={{ padding: 0, marginBottom: 16 }}>
          <h2>Product editor</h2>
          <p>Use this form to create or update products from the configured commerce API.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span>Name</span>
            <input
              required
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2">
            <span>Slug</span>
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2">
            <span>Description</span>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span>Price</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-2">
              <span>Currency</span>
              <input
                value={form.currency}
                onChange={(event) => setForm((current) => ({ ...current, currency: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>

          <label className="grid gap-2">
            <span>Image URL</span>
            <input
              value={form.image}
              onChange={(event) => setForm((current) => ({ ...current, image: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2">
            <span>Details (one per line)</span>
            <textarea
              rows={4}
              value={form.details}
              onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          {message ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="button">
              {form.id ? "Save changes" : "Create product"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm());
                setMessage(null);
              }}
              className="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700"
            >
              Reset
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-header" style={{ padding: 0, marginBottom: 16 }}>
          <h2>Inventory</h2>
          <p>Manage existing products and push changes through the connected API.</p>
        </div>

        <div className="grid gap-3">
          {products.map((product) => (
            <article key={product.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{product.name}</h3>
                  <p className="text-sm text-slate-600">{product.slug}</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                  {product.currency}{product.price}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{product.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => startEditing(product)} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(product)} className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
