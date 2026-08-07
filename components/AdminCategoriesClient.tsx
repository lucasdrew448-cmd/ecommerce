"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";

type CategoryForm = {
  id: string;
  name: string;
  description: string;
};

const emptyForm = (): CategoryForm => ({
  id: "",
  name: "",
  description: "",
});

export default function AdminCategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [form, setForm] = useState<CategoryForm>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    const response = await fetch("/api/admin/categories", {
      cache: "no-store",
      headers: { "x-api-key": "384e88ad67a80921a1f72a213df30b642586af2177609942bff7e3e956758c54" },
    });
    const data = await response.json();
    setCategories(data as Category[]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      name: form.name,
      description: form.description || undefined,
    };

    const endpoint = form.id ? `/api/admin/categories/${form.id}` : "/api/admin/categories";
    const method = form.id ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", "x-api-key": "384e88ad67a80921a1f72a213df30b642586af2177609942bff7e3e956758c54" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Unable to save category.");
        return;
      }

      setMessage(form.id ? "Category updated." : "Category created.");
      setForm(emptyForm());
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save category.");
    }
  };

  const startEditing = (category: Category) => {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description || "",
    });
    setMessage(`Editing ${category.name}.`);
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) {
      return;
    }

    const response = await fetch(`/api/admin/categories/${category.id}`, {
      method: "DELETE",
      headers: { "x-api-key": "384e88ad67a80921a1f72a213df30b642586af2177609942bff7e3e956758c54" },
    });
    if (response.ok) {
      setMessage(`Deleted ${category.name}.`);
      await refresh();
    } else {
      const data = await response.json();
      setMessage(data.error || "Unable to delete category.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card">
        <div className="section-header" style={{ padding: 0, marginBottom: 16 }}>
          <h2>Category editor</h2>
          <p>Create or update product categories.</p>
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
              {form.id ? "Save changes" : "Create category"}
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
          <h2>Categories</h2>
          <p>Manage the product catalog taxonomy.</p>
        </div>

        <div className="grid gap-3">
          {categories.length === 0 ? (
            <p className="text-slate-600">No categories returned from the API.</p>
          ) : (
            categories.map((category) => (
              <article key={category.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                    {category.description ? <p className="mt-1 text-sm text-slate-600">{category.description}</p> : null}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEditing(category)} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(category)} className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">
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