import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/commerce";
import ResendConfirmation from "@/components/ResendConfirmation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Confirmation",
};

interface OrderConfirmationPageProps {
  params: {
    id: string;
  };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  const orderItems = order.order_items ?? [];
  const total = order.total_price ?? 0;

  return (
    <main>
      <section className="section">
        <div className="section-header text-center">
          <p className="mx-auto inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            ✓ Order confirmed
          </p>
          <h1>Thank you, {order.customer_name || "customer"}!</h1>
          <p className="mx-auto max-w-xl text-slate-600">
            Your order has been placed successfully. A confirmation email has been sent to {order.customer_email || "your email"}.
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <p className="eyebrow">Order number</p>
                <h2 className="text-lg font-semibold text-slate-900">{order.id}</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                {order.status || "pending"}
              </span>
            </div>

            <div className="mt-4 grid gap-4">
              {orderItems.length > 0 ? (
                orderItems.map((item, index) => (
                  <div key={item.id || index} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                    <span className="text-slate-700">
                      {item.product_id} × {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">Order items are not available in the response.</p>
              )}

              <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-semibold text-slate-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {order.shipping_address ? (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Shipping address</p>
                <p className="mt-1 text-sm text-slate-600">{order.shipping_address}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/store" className="rounded-full bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700">
              Continue shopping
            </Link>
            <ResendConfirmation orderId={order.id} />
          </div>
        </div>
      </section>
    </main>
  );
}