"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand">
          <Link href="/">Headless Store</Link>
        </div>

        <div className="header-actions">
          <Link href="/cart" aria-label="View cart" className="cart-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="cart-icon" aria-hidden="true">
              <path d="M3 4h2l2.4 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.8L17 7H7" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="10" cy="19" r="1.5" />
              <circle cx="17" cy="19" r="1.5" />
            </svg>
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
          <Link href="/checkout">Checkout</Link>
        </nav>
      </div>
    </header>
  );
}
