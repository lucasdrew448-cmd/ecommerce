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
  publicId: string;
  details: string;
  category_id: string;
  product_type_id: string;
  supplier_id: string;
  stock: string;
  sizes: string;
};

const emptyForm = (): AdminFormState => ({
  id: "",
  slug: "",
  name: "",
  description: "",
  price: "",
  currency: "$",
  image: "",
  publicId: "",
  details: "",
  category_id: "",
  product_type_id: "",
  supplier_id: "",
  stock: "",
  sizes: "",
});

interface AdminProductsClientProps {
  initialProducts: Product[];
  categories?: { id: string; name: string }[];
  productTypes?: { id: string; name: string }[];
  suppliers?: { id: string; name: string }[];
}

export default function AdminProductsClient({ initialProducts, categories = [], productTypes = [], suppliers = [] }: AdminProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState<AdminFormState>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const refreshProducts = async () => {
    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await response.json();
    setProducts(data as Product[]);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("Uploading image to Cloudinary…");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Upload failed.");
        return;
      }

      setForm((current) => ({
        ...current,
        image: data.url || "",
        publicId: data.publicId || "",
      }));
      setMessage(`Uploaded ${file.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
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
      category_id: form.category_id || undefined,
      product_type_id: form.product_type_id || undefined,
      supplier_id: form.supplier_id || undefined,
      stock: form.stock !== "" ? Number(form.stock) : undefined,
      sizes: form.sizes ? form.sizes.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
    };

    const endpoint = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = form.id ? "PUT" : "POST";

    try {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to save the product.";
      setMessage(message);
    }
  };

  const startEditing = (product: Product) => {
    let sizes = "";
    if (product.sizes) {
      try {
        const parsed = JSON.parse(product.sizes);
        if (Array.isArray(parsed)) {
          sizes = parsed.join(", ");
        } else if (typeof parsed === "string") {
          sizes = parsed;
        }
      } catch {
        sizes = product.sizes;
      }
    }

    setForm({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: String(product.price),
      currency: product.currency,
      image: product.image || "",
      publicId: "",
      details: product.details.join("\n"),
      category_id: product.category_id || "",
      product_type_id: product.product_type_id || "",
      supplier_id: product.supplier_id || "",
      stock: product.stock !== undefined ? String(product.stock) : "",
      sizes,
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
    } else {
      const data = await response.json();
      setMessage(data.error || "Unable to delete product.");
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span>Stock</span>
              <input
                type="number"
                min="0"
                step="1"
                value={form.stock}
                onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-2">
              <span>Sizes (comma separated)</span>
              <input
                value={form.sizes}
                onChange={(event) => setForm((current) => ({ ...current, sizes: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>

          {categories.length > 0 ? (
            <label className="grid gap-2">
              <span>Category</span>
              <select
                value={form.category_id}
                onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">No category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {productTypes.length > 0 ? (
            <label className="grid gap-2">
              <span>Product type</span>
              <select
                value={form.product_type_id}
                onChange={(event) => setForm((current) => ({ ...current, product_type_id: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">No product type</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {suppliers.length > 0 ? (
            <label className="grid gap-2">
              <span>Supplier</span>
              <select
                value={form.supplier_id}
                onChange={(event) => setForm((current) => ({ ...current, supplier_id: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">No supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="grid gap-2">
            <span>Upload image to Cloudinary</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleImageUpload}
              className="rounded-lg border border-slate-300 px-3 py-2 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-blue-700 disabled:opacity-50"
            />
          </label>

          {form.image ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <img src={form.image} alt="Product image preview" className="h-48 w-full object-cover" />
            </div>
          ) : null}

          {form.publicId ? (
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">Cloudinary public ID: {form.publicId}</p>
          ) : null}

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
              {product.stock !== undefined ? (
                <p className={`mt-2 text-xs font-semibold ${product.stock > 0 ? "text-emerald-700" : "text-rose-600"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                </p>
              ) : null}
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