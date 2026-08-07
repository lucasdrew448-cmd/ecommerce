"use client";

import { useState } from "react";
import Link from "next/link";

const features = [
  {
    title: "Inventory management",
    description: "Add, edit, and organize products, categories, and suppliers.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
        <path d="M20 7h-9M14 17H5M17 17h3M7 7H4" strokeLinecap="round" />
        <circle cx="12" cy="7" r="2" />
        <circle cx="10" cy="17" r="2" />
      </svg>
    ),
  },
  {
    title: "Order tracking",
    description: "Monitor orders, update statuses, and manage payments in real time.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
        <path d="M3 7h13l1 4h4v6h-2a2 2 0 1 1-4 0H9a2 2 0 1 1-4 0H3z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 7v10M16 11h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Reviews & content",
    description: "Moderate customer reviews and curate your storefront hero content.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
        <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 17.3 5.8 20.9l1.6-6.8L2.2 8.9l6.9-.6L12 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    console.log("login form submit handler called", { email, password: password ? "***" : "" });
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Use a full page reload so the browser sends the newly-set auth cookie
      // to the server-rendered /admin route. A client-side router.push can
      // race with cookie persistence and leave the dashboard unauthenticated.
      window.location.href = "/admin";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-180px)] items-center justify-center px-4 py-10 sm:px-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-2">
        {/* Brand / feature panel */}
        <aside className="relative hidden flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 p-10 text-white lg:flex">
          <div className="pointer-events-none absolute inset-0 opacity-20">
            <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-300/30 blur-3xl" />
          </div>

          <div className="relative">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-lg backdrop-blur-sm">
                🐟
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-base font-extrabold tracking-tight">Discus Fish</span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-blue-100">
                  Admin Console
                </span>
              </span>
            </Link>

            <h2 className="mt-10 text-2xl font-bold leading-tight">
              Welcome back.
              <br />
              Manage your store with confidence.
            </h2>
            <p className="mt-3 max-w-sm text-sm text-blue-100">
              Sign in to oversee products, orders, reviews, and storefront content
              from a single, streamlined dashboard.
            </p>
          </div>

          <ul className="relative mt-10 space-y-4">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                  {feature.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold">{feature.title}</p>
                  <p className="text-xs text-blue-100">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="relative mt-10 text-xs text-blue-100">
            🔒 Secured with encrypted admin authentication.
          </p>
        </aside>

        {/* Form panel */}
        <section className="p-8 sm:p-10">
          <div className="mx-auto flex max-w-sm flex-col">
            {/* Mobile brand */}
            <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-lg shadow-md shadow-blue-600/20">
                🐟
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Discus Fish
                </span>
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-blue-600">
                  Admin Console
                </span>
              </span>
            </Link>

            <div className="mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                </svg>
                Admin sign-in
              </span>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                Sign in to your account
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Enter your credentials to access the administration dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Email address</span>
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <div className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <path d="M3 3l18 18" strokeLinecap="round" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" />
                        <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c5 0 9 4.5 10 8a13.2 13.2 0 0 1-2.2 3.3M6.6 6.6C4.4 8 2.7 10 2 12c1 3.5 5 8 10 8 1.4 0 2.7-.3 3.9-.8" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                        <path d="M2 12c1-3.5 5-8 10-8s9 4.5 10 8c-1 3.5-5 8-10 8s-9-4.5-10-8z" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <Link href="/contact" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
                  Forgot password?
                </Link>
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
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin" aria-hidden="true">
                      <path d="M21 12a9 9 0 1 1-6.2-8.6" strokeLinecap="round" />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3 text-xs font-medium text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              NEW HERE?
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <Link href="/admin/register" className="font-semibold text-blue-600 transition hover:text-blue-700">
                Create an admin account
              </Link>
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to store
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}