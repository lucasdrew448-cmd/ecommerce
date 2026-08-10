import Image from "next/image";
import Link from "next/link";
import brandImage from "@/components/svg/IMG-20260808-WA0005.jpg";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

const shopLinks = [
  { label: "All Products", href: "/store" },
  { label: "Used Dirt Bikes", href: "/store?search=dirt+bike" },
  { label: "Cart", href: "/cart" },
  { label: "Checkout", href: "/checkout" },
];

const supportLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/contact" },
];

const companyLinks = [
  { label: "Our Story", href: "/about" },

];

const paymentMethods = [
  { name: "Visa", icon: "💳" },
  { name: "Mastercard", icon: "💳" },
  { name: "American Express", icon: "💳" },
  { name: "Discover", icon: "💳" },

];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-[#e5d6c3] bg-[#4a3222] text-[#f7ebdf]">
      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                <Image src={brandImage} alt="Used Dirt Bike Store logo" width={48} height={48} className="h-full w-full object-cover" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Used Dirt Bike Store</h3>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Trusted since 2012</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-[#d8b280]">
              Quality used dirt bikes for sale. Inspected, hand-picked used dirt bikes with
              expert support and safe shipping. Your trusted source for off-road motorcycles.
            </p>
            {/* Social media icons */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5e3f29] text-[#f7ebdf] transition hover:bg-[#8b5e3c] hover:text-white"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Shop</h4>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#e8cfae] transition hover:text-[#f7ebdf]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#e8cfae] transition hover:text-[#f7ebdf]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          
        </div>

        {/* Newsletter signup */}
        <div className="mt-10 rounded-2xl border border-[#6f4c32] bg-[#5e3f29]/70 p-6">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h4 className="text-base font-semibold text-white">Stay in the loop</h4>
              <p className="mt-1 text-sm text-[#e8cfae]">
                Subscribe for maintenance tips, new arrivals, and exclusive offers.
              </p>
            </div>
            <form className="flex w-full max-w-md flex-row items-center gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 flex-1 rounded-full border border-[#7a5337] bg-[#2f241d] px-4 py-2.5 text-sm text-white placeholder-[#c69b6d] focus:border-[#d8b280] focus:outline-none focus:ring-1 focus:ring-[#d8b280]"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-[#8b5e3c] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a76d43]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#6f4c32]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
          <p className="text-sm text-[#d8b280]">
            © {new Date().getFullYear()} Used Dirt Bike Store. All rights reserved.
          </p>

          {/* Payment methods */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#d8b280]">We accept:</span>
            <div className="flex gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method.name}
                  className="flex h-7 items-center justify-center rounded-md border border-[#6f4c32] bg-[#5e3f29] px-2 text-xs font-medium text-[#f7ebdf]"
                >
                  {method.name}
                </span>
              ))}
            </div>
          </div>

          {/* Legal links */}
          <div className="flex gap-4 text-sm text-[#d8b280]">
            <Link href="/about" className="transition hover:text-[#f7ebdf]">
              Privacy Policy
            </Link>
            <Link href="/about" className="transition hover:text-[#f7ebdf]">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}