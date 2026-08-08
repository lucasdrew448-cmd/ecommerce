import Link from "next/link";
import CartClient from "@/components/CartClient";

export const metadata = {
  title: "Your Cart — Used Dirt Bikes",
};

export default function CartPage() {
  return (
    <main className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-2">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-slate-700">Home</Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-900">Cart</span>
        </nav>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Your cart</h1>
        <p className="text-sm text-slate-600">
          Review your selected dirt bikes and gear before heading to secure checkout.
        </p>
      </div>

      <CartClient />
    </main>
  );
}