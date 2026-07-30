import { headers } from "next/headers";
import { listAdminOrders } from "@/lib/admin";

export const metadata = {
  title: "Admin Orders",
};

export default async function AdminOrdersPage() {
  const requestHeaders = headers();
  const orders = await listAdminOrders(requestHeaders);

  return (
    <main>
      <section className="section">
        <div className="section-header">
          <h1>Order overview</h1>
          <p>Review recent orders and their statuses from the connected commerce API.</p>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="px-3 py-3">Order</th>
                  <th className="px-3 py-3">Customer</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Total</th>
                  <th className="px-3 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="px-3 py-3 font-semibold text-slate-900">{order.id}</td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-slate-900">{order.customer}</div>
                      <div className="text-slate-600">{order.email}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">${order.total.toFixed(2)}</td>
                    <td className="px-3 py-3">{order.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
