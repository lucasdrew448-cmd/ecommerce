"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";

async function safeParseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return {} as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return {} as T;
  }
}

type AdminFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category_id: string;
  product_type_id: string;
  supplier_id: string;
  image_url: string;
  publicId: string;
  additional_images: string[];
  additional_public_ids: string[];
  sizes: string;
};

const emptyForm = (): AdminFormState => ({
  name: "",
  description: "",
  price: "",
  stock: "",
  category_id: "",
  product_type_id: "",
  supplier_id: "",
  image_url: "",
  publicId: "",
  additional_images: [],
  additional_public_ids: [],
  sizes: "",
});

interface AdminProductsClientProps {
  initialProducts: Product[];
  categories?: { id: string; name: string }[];
  productTypes?: { id: string; name: string }[];
  suppliers?: { id: string; name: string }[];
}

async function uploadToCloudinary(file: File): Promise<{ url?: string; publicId?: string; error?: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await safeParseJson<{ url?: string; publicId?: string; error?: string }>(response);
  if (!response.ok) {
    throw new Error(data.error || "Upload failed.");
  }

  return data;
}

export default function AdminProductsClient({ initialProducts, categories = [], productTypes = [], suppliers = [] }: AdminProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState<AdminFormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const refreshProducts = async () => {
    const response = await fetch("/api/admin/products", { cache: "no-store" });
    const data = await safeParseJson<Product[]>(response);
    setProducts(Array.isArray(data) ? data : []);
  };

  const handleMainImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setMessage("Uploading image to Cloudinary…");

    try {
      const data = await uploadToCloudinary(file);
      setForm((current) => ({
        ...current,
        image_url: data.url || "",
        publicId: data.publicId || "",
      }));
      setMessage(`Uploaded ${file.name}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleAdditionalImagesUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setMessage(`Uploading ${files.length} image${files.length > 1 ? "s" : ""} to Cloudinary…`);

    try {
      const uploadedUrls: string[] = [];
      const uploadedPublicIds: string[] = [];

      for (const file of files) {
        const data = await uploadToCloudinary(file);
        if (data.url) {
          uploadedUrls.push(data.url);
        }
        if (data.publicId) {
          uploadedPublicIds.push(data.publicId);
        }
      }

      if (uploadedUrls.length > 0) {
        setForm((current) => ({
          ...current,
          additional_images: [...current.additional_images, ...uploadedUrls],
          additional_public_ids: [...current.additional_public_ids, ...uploadedPublicIds],
        }));
        setMessage(`Uploaded ${uploadedUrls.length} image${uploadedUrls.length > 1 ? "s" : ""}.`);
      } else {
        setMessage("No images were uploaded.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price || 0),
      stock: form.stock !== "" ? Number(form.stock) : undefined,
      category_id: form.category_id || undefined,
      product_type_id: form.product_type_id || undefined,
      supplier_id: form.supplier_id || undefined,
      image_url: form.image_url || undefined,
      additional_images: form.additional_images.length > 0 ? form.additional_images : undefined,
      sizes: form.sizes ? form.sizes.split(",").map((item) => item.trim()).filter(Boolean) : undefined,
    };

    const endpoint = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeParseJson<{ error?: string }>(response);
      if (!response.ok) {
        setMessage(data.error || "Unable to save the product.");
        return;
      }

      setMessage(editingId ? "Product updated." : "Product created.");
      setForm(emptyForm());
      setEditingId(null);
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
          sizes = parsed.map((item) => (typeof item === "string" ? item : typeof item === "object" && item !== null && typeof (item as { size?: unknown }).size === "string" ? (item as { size: string }).size : String(item))).join(", ");
        } else if (typeof parsed === "string") {
          sizes = parsed;
        }
      } catch {
        sizes = product.sizes;
      }
    }

    let additionalImages: string[] = [];
    if (product.additional_images) {
      try {
        const parsed = JSON.parse(product.additional_images);
        if (Array.isArray(parsed)) {
          additionalImages = parsed.filter((item): item is string => typeof item === "string");
        } else if (typeof parsed === "string") {
          additionalImages = [parsed];
        }
      } catch {
        additionalImages = [product.additional_images];
      }
    }

    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: product.stock !== undefined ? String(product.stock) : "",
      category_id: product.category_id || "",
      product_type_id: product.product_type_id || "",
      supplier_id: product.supplier_id || "",
      image_url: product.image_url || product.image || "",
      publicId: "",
      additional_images: additionalImages,
      additional_public_ids: [],
      sizes,
    });
    setEditingId(product.id);
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
      const data = await safeParseJson<{ error?: string }>(response);
      setMessage(data.error || "Unable to delete product.");
    }
  };

  const removeAdditionalImage = (index: number) => {
    setForm((current) => ({
      ...current,
      additional_images: current.additional_images.filter((_, i) => i !== index),
      additional_public_ids: current.additional_public_ids.filter((_, i) => i !== index),
    }));
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

          <div className="grid gap-2">
            <span>Main image</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleMainImageUpload}
              className="rounded-lg border border-slate-300 px-3 py-2 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-blue-700 disabled:opacity-50"
            />
          </div>

          {form.image_url ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <img src={form.image_url} alt="Product main image preview" className="h-48 w-full object-cover" />
            </div>
          ) : null}

          {form.publicId ? (
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">Cloudinary public ID: {form.publicId}</p>
          ) : null}

          <div className="grid gap-2">
            <span>Additional images (upload to Cloudinary)</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleAdditionalImagesUpload}
              className="rounded-lg border border-slate-300 px-3 py-2 file:mr-3 file:rounded-full file:border-0 file:bg-blue-50 file:px-3 file:py-1 file:text-sm file:font-semibold file:text-blue-700 disabled:opacity-50"
            />
          </div>

          {form.additional_images.length > 0 ? (
            <div className="grid gap-3">
              <span className="text-sm font-semibold text-slate-700">Uploaded additional images ({form.additional_images.length})</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {form.additional_images.map((imageUrl, index) => (
                  <div key={`${imageUrl}-${index}`} className="relative overflow-hidden rounded-xl border border-slate-200">
                    <img src={imageUrl} alt={`Additional image ${index + 1}`} className="h-32 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white shadow"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <label className="grid gap-2">
            <span>Sizes (comma separated)</span>
            <input
              value={form.sizes}
              onChange={(event) => setForm((current) => ({ ...current, sizes: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          {message ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="button">
              {editingId ? "Save changes" : "Create product"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(emptyForm());
                setEditingId(null);
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
              {product.additional_images ? (
                <p className="mt-2 text-xs text-slate-500">{(() => {
                  try {
                    const parsed = JSON.parse(product.additional_images);
                    return Array.isArray(parsed) ? `${parsed.length} additional image${parsed.length > 1 ? "s" : ""}` : "";
                  } catch {
                    return "Has additional images";
                  }
                })()}</p>
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