"use client";

import { useState } from "react";
import type { ProductType } from "@/lib/types";

type ProductTypeForm = {
  id: string;
  name: string;
  description: string;
};

const emptyForm = (): ProductTypeForm => ({
  id: "",
  name: "",
  description: "",
});

export default function AdminProductTypesClient({ initialTypes }: { initialTypes: ProductType[] }) {
  const [types, setTypes] = useState<ProductType[]>(initialTypes);
  const [form, setForm] = useState<ProductTypeForm>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    const response = await fetch("/api/admin/product-types", { cache: "no-store" });
    const data = await response.json();
    setTypes(data as ProductType[]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      name: form.name,
      description: form.description || undefined,
    };

    const endpoint = form.id ? `/api/admin/product-types/${form.id}` : "/api/admin/product-types";
    const method = form.id ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Unable to save product type.");
        return;
      }

      setMessage(form.id ? "Product type updated." : "Product type created.");
      setForm(emptyForm());
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save product type.");
    }
  };

  const startEditing = (type: ProductType) => {
    setForm({
      id: type.id,
      name: type.name,
      description: type.description || "",
    });
    setMessage(`Editing ${type.name}.`);
  };

  const handleDelete = async (type: ProductType) => {
    if (!window.confirm(`Delete product type "${type.name}"?`)) {
      return;
    }

    const response = await fetch(`/api/admin/product-types/${type.id}`, { method: "DELETE" });
    if (response.ok) {
      setMessage(`Deleted ${type.name}.`);
      await refresh();
    } else {
      const data = await response.json();
      setMessage(data.error || "Unable to delete product type.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card">
        <div className="section-header" style={{ padding: 0, marginBottom: 16 }}>
          <h2>Product type editor</h2>
          <p>Create or update product types (e.g., Freshwater, Saltwater).</p>
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
              rows={3}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          {message ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="button">
              {form.id ? "Save changes" : "Create product type"}
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
          <h2>Product types</h2>
          <p>Manage the catalog product types.</p>
        </div>

        <div className="grid gap-3">
          {types.length === 0 ? (
            <p className="text-slate-600">No product types returned from the API.</p>
          ) : (
            types.map((type) => (
              <article key={type.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{type.name}</h3>
                    {type.description ? <p className="mt-1 text-sm text-slate-600">{type.description}</p> : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEditing(type)} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(type)} className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}