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

        <nav className={`nav ${open ? "open" : ""}`} aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/store">Store</Link>
          <Link href="/about">About</Link>
          <Link href="/checkout">Checkout</Link>
          <Link href="/cart">Cart</Link>
        </nav>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="hamburger" />
        </button>
      </div>
    </header>
  );
}
