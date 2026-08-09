"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import brandImage from "@/components/svg/IMG-20260808-WA0005.jpg";

const STORAGE_KEY = "headless-cart";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Store", href: "/store" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Admin", href: "/admin" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const syncCartCount = () => {
      if (typeof window === "undefined") {
        return;
      }

      const stored = window.localStorage.getItem(STORAGE_KEY);
      const cart = stored ? JSON.parse(stored) : [];
      const count = cart.reduce(
        (sum: number, item: { quantity: number }) => sum + item.quantity,
        0,
      );
      setCartCount(count);
    };

    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("cart-updated", syncCartCount);

    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("cart-updated", syncCartCount);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/store?search=${encodeURIComponent(q)}` : "/store");
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="flex items-center gap-2 font-medium">
            <span className="hidden sm:inline">
              Free express shipping on orders over $150 — inspected, hand-picked used dirt bikes delivered to your door.
            </span>
            <span className="sm:hidden">Free shipping over $150</span>
          </p>
          <div className="hidden items-center gap-4 sm:flex">
            <Link href="/store" className="font-medium transition hover:text-blue-100">
              Shop now
            </Link>
            <span className="text-blue-300" aria-hidden="true">|</span>
            <a
              href="tel:+18005551234"
              className="flex items-center gap-1.5 font-medium transition hover:text-blue-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              1-800-555-1234
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div
        className={`border-b transition-all duration-300 ${
          scrolled
            ? "border-slate-200 bg-white/90 shadow-sm backdrop-blur-md"
            : "border-transparent bg-white/70 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:gap-6 lg:px-8">
          {/* Brand */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Used Dirt Bike Store home">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md shadow-blue-600/20">
              <Image src={brandImage} alt="Used Dirt Bike Store logo" width={40} height={40} className="h-full w-full object-cover" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                Used Dirt Bike
              </span>
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-blue-600">
                Store
              </span>
            </span>
          </Link>

          {/* Search (desktop) */}
          <form
            onSubmit={handleSearch}
            role="search"
            className="relative hidden flex-1 items-center md:flex"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search used dirt bikes, parts, gear…"
              aria-label="Search products"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-24 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <button
              type="submit"
              className="absolute right-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              Search
            </button>
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2.5">
            {/* Account */}
            <Link
              href="/admin"
              aria-label="Account"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-blue-600 sm:inline-flex"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label={`View cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true">
                <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L17 7H7" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="10" cy="19" r="1.5" />
                <circle cx="17" cy="19" r="1.5" />
              </svg>
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1 text-[0.7rem] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {/* Mobile nav toggle */}
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 lg:hidden"
            >
              {open ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Search (mobile) */}
        <div className="px-4 pb-3 sm:px-6 md:hidden">
          <form onSubmit={handleSearch} role="search" className="relative flex items-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </form>
        </div>

        {/* Primary nav (desktop) */}
        <nav className="hidden border-t border-slate-100 lg:block" aria-label="Main navigation">
          <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 sm:px-6 lg:px-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative -mb-px border-b-2 px-3 py-3 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-700 hover:border-slate-300 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <span className="ml-auto py-3 text-xs font-medium text-slate-400">
              100% inspected guarantee
            </span>
          </div>
        </nav>
      </div>

      {/* Mobile menu */}
      {open ? (
        <nav
          className="border-b border-slate-200 bg-white shadow-lg lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="space-y-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/store"
              className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-600"
            >
              Shop now
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}