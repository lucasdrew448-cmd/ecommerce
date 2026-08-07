"use client";

import { useState } from "react";
import type { Supplier } from "@/lib/types";

type SupplierForm = {
  id: string;
  name: string;
  description: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  status: string;
};

const emptyForm = (): SupplierForm => ({
  id: "",
  name: "",
  description: "",
  contact_person: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  status: "active",
});

export default function AdminSuppliersClient({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [form, setForm] = useState<SupplierForm>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    const response = await fetch("/api/admin/suppliers", {
      cache: "no-store",
      headers: { "x-api-key": "384e88ad67a80921a1f72a213df30b642586af2177609942bff7e3e956758c54" },
    });
    const data = await response.json();
    setSuppliers(data as Supplier[]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      name: form.name,
      description: form.description || undefined,
      contact_person: form.contact_person || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      status: form.status || undefined,
    };

    const endpoint = form.id ? `/api/admin/suppliers/${form.id}` : "/api/admin/suppliers";
    const method = form.id ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json", "x-api-key": "384e88ad67a80921a1f72a213df30b642586af2177609942bff7e3e956758c54" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Unable to save supplier.");
        return;
      }

      setMessage(form.id ? "Supplier updated." : "Supplier created.");
      setForm(emptyForm());
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save supplier.");
    }
  };

  const startEditing = (supplier: Supplier) => {
    setForm({
      id: supplier.id,
      name: supplier.name,
      description: supplier.description || "",
      contact_person: supplier.contact_person || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      city: supplier.city || "",
      country: supplier.country || "",
      status: supplier.status || "active",
    });
    setMessage(`Editing ${supplier.name}.`);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!window.confirm(`Delete supplier "${supplier.name}"?`)) {
      return;
    }

    const response = await fetch(`/api/admin/suppliers/${supplier.id}`, {
      method: "DELETE",
      headers: { "x-api-key": "384e88ad67a80921a1f72a213df30b642586af2177609942bff7e3e956758c54" },
    });
    if (response.ok) {
      setMessage(`Deleted ${supplier.name}.`);
      await refresh();
    } else {
      const data = await response.json();
      setMessage(data.error || "Unable to delete supplier.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="card">
        <div className="section-header" style={{ padding: 0, marginBottom: 16 }}>
          <h2>Supplier editor</h2>
          <p>Create or update fish suppliers.</p>
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

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span>Contact person</span>
              <input
                value={form.contact_person}
                onChange={(event) => setForm((current) => ({ ...current, contact_person: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-2">
              <span>Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-2">
              <span>Phone</span>
              <input
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-2">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2">
            <span>Address</span>
            <input
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span>City</span>
              <input
                value={form.city}
                onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>

            <label className="grid gap-2">
              <span>Country</span>
              <input
                value={form.country}
                onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))}
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
          </div>

          {message ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="button">
              {form.id ? "Save changes" : "Create supplier"}
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
          <h2>Suppliers</h2>
          <p>Manage the fish supplier directory.</p>
        </div>

        <div className="grid gap-3">
          {suppliers.length === 0 ? (
            <p className="text-slate-600">No suppliers returned from the API.</p>
          ) : (
            suppliers.map((supplier) => (
              <article key={supplier.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{supplier.name}</h3>
                    {supplier.contact_person ? <p className="mt-1 text-sm text-slate-600">{supplier.contact_person}</p> : null}
                    {supplier.email ? <p className="mt-1 text-sm text-slate-600">{supplier.email}</p> : null}
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    {supplier.status || "unknown"}
                  </span>
                </div>
                {supplier.description ? <p className="mt-2 text-sm text-slate-600">{supplier.description}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => startEditing(supplier)} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(supplier)} className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">
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