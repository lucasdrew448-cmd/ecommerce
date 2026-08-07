"use client";

import { useState } from "react";
import type { AdminOrder } from "@/lib/admin";

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [message, setMessage] = useState<string | null>(null);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const handleStatusChange = async (order: AdminOrder, newStatus: string) => {
    setMessage(null);

    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-api-key": "384e88ad67a80921a1f72a213df30b642586af2177609942bff7e3e956758c54" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.ok) {
      setMessage(`Order ${order.id} updated to ${newStatus}.`);
      setOrders((current) =>
        current.map((item) => (item.id === order.id ? { ...item, status: newStatus } : item))
      );
    } else {
      const data = await response.json();
      setMessage(data.error || "Unable to update order status.");
    }
  };

  const handleSendPaymentStatus = async (order: AdminOrder, paymentStatus: "successful" | "unsuccessful") => {
    setMessage(null);
    setSendingTo(order.id);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/payment-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": "384e88ad67a80921a1f72a213df30b642586af2177609942bff7e3e956758c54" },
        body: JSON.stringify({ paymentStatus }),
      });

      if (response.ok) {
        setMessage(`Payment status email (${paymentStatus}) sent for order ${order.id}.`);
      } else {
        const data = await response.json();
        setMessage(data.error || "Unable to send payment status email.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send payment status email.");
    } finally {
      setSendingTo(null);
    }
  };

  const statusColor = (status: string) => {
    const normalized = status.toLowerCase();
    if (["delivered", "shipped"].includes(normalized)) return "bg-emerald-50 text-emerald-700";
    if (normalized === "cancelled") return "bg-rose-50 text-rose-700";
    if (normalized === "processing") return "bg-blue-50 text-blue-700";
    return "bg-amber-50 text-amber-700";
  };

  return (
    <div>
      {message ? <p className="mb-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{message}</p> : null}

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <p className="text-slate-600">No orders returned from the API.</p>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-slate-900">{order.id}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${statusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {order.customer} · {order.email}
                  </p>
                  {order.items.length > 0 ? (
                    <p className="mt-1 text-sm text-slate-600">Items: {order.items.join(", ")}</p>
                  ) : null}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-900">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-slate-600">{order.createdAt}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <select
                  value={order.status.toLowerCase()}
                  onChange={(event) => handleStatusChange(order, event.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  {VALID_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                <span className="mx-2 text-slate-300">|</span>

                <button
                  type="button"
                  disabled={sendingTo === order.id}
                  onClick={() => handleSendPaymentStatus(order, "successful")}
                  className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  Send payment success email
                </button>
                <button
                  type="button"
                  disabled={sendingTo === order.id}
                  onClick={() => handleSendPaymentStatus(order, "unsuccessful")}
                  className="rounded-full border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-700"
                >
                  Send payment failed email
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}