"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "headless-cart";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const syncCartCount = () => {
      if (typeof window === "undefined") {
        return;
      }

      const stored = window.localStorage.getItem(STORAGE_KEY);
      const cart = stored ? JSON.parse(stored) : [];
      const count = cart.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
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

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <Link href="/">🐟 Discus Fish Store</Link>
        </div>

        <div className="header-actions">
          <Link href="/cart" aria-label="View cart" className="cart-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="cart-icon" aria-hidden="true">
              <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L17 7H7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
            </svg>
            {cartCount > 0 ? <span className="cart-badge">{cartCount}</span> : null}
          </Link>

          <button
            className="nav-toggle"
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="hamburger" />
          </button>
        </div>

        <nav className={`nav ${open ? "open" : ""}`} aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/store">Store</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/admin">Admin</Link>
        </nav>
      </div>
    </header>
  );
}