"use client";

import { useState } from "react";
import type { HeroBanner } from "@/lib/types";

type HeroForm = {
  id: string;
  url: string;
  title: string;
  description: string;
};

const emptyForm = (): HeroForm => ({
  id: "",
  url: "",
  title: "",
  description: "",
});

export default function AdminHeroClient({ initialBanners }: { initialBanners: HeroBanner[] }) {
  const [banners, setBanners] = useState<HeroBanner[]>(initialBanners);
  const [form, setForm] = useState<HeroForm>(emptyForm());
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => {
    const response = await fetch("/api/admin/hero", {
      cache: "no-store",
      headers: {},
    });
    const data = await response.json();
    setBanners(data as HeroBanner[]);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const payload = {
      url: form.url,
      title: form.title || undefined,
      description: form.description || undefined,
    };

    const endpoint = form.id ? `/api/admin/hero/${form.id}` : "/api/admin/hero";
    const method = form.id ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error || "Unable to save banner.");
        return;
      }

      setMessage(form.id ? "Banner updated." : "Banner created.");
      setForm(emptyForm());
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save banner.");
    }
  };

  const startEditing = (banner: HeroBanner) => {
    setForm({
      id: banner.id,
      url: banner.url,
      title: banner.title || "",
      description: banner.description || "",
    });
    setMessage(`Editing ${banner.title || banner.url}.`);
  };

  const handleDelete = async (banner: HeroBanner) => {
    if (!window.confirm(`Delete banner "${banner.title || banner.url}"?`)) {
      return;
    }

    const response = await fetch(`/api/admin/hero/${banner.id}`, {
      method: "DELETE",
      headers: {},
    });
    if (response.ok) {
      setMessage("Banner deleted.");
      await refresh();
    } else {
      const data = await response.json();
      setMessage(data.error || "Unable to delete banner.");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="card">
        <div className="section-header" style={{ padding: 0, marginBottom: 16 }}>
          <h2>Hero banner editor</h2>
          <p>Create or update hero slider banners.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="grid gap-2">
            <span>Image URL</span>
            <input
              required
              value={form.url}
              onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
              className="rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="grid gap-2">
            <span>Title</span>
            <input
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
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

          {form.url ? (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <img src={form.url} alt="Banner preview" className="h-40 w-full object-cover" />
            </div>
          ) : null}

          {message ? <p className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="button">
              {form.id ? "Save changes" : "Create banner"}
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
          <h2>Hero banners</h2>
          <p>Manage the homepage slider.</p>
        </div>

        <div className="grid gap-3">
          {banners.length === 0 ? (
            <p className="text-slate-600">No hero banners returned from the API.</p>
          ) : (
            banners.map((banner) => (
              <article key={banner.id} className="overflow-hidden rounded-2xl border border-slate-200">
                {banner.url ? <img src={banner.url} alt={banner.title || "Hero banner"} className="h-36 w-full object-cover" /> : null}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900">{banner.title || "Untitled banner"}</h3>
                  {banner.description ? <p className="mt-1 text-sm text-slate-600">{banner.description}</p> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => startEditing(banner)} className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDelete(banner)} className="rounded-full border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700">
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}