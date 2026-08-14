"use client";

import { useState } from "react";
import type { AdminOrder } from "@/lib/admin";

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersClient({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [message, setMessage] = useState<string | null>(null);
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleStatusChange = async (order: AdminOrder, newStatus: string) => {
    setMessage(null);

    const response = await fetch(`/api/admin/orders/${order.id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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

                <span className="mx-2 text-slate-300">|</span>

                <button
                  type="button"
                  onClick={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
                  className="rounded-full border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {expandedOrderId === order.id ? "Hide details" : "View details"}
                </button>
              </div>

              {expandedOrderId === order.id ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="font-semibold text-slate-900">Customer</p>
                      <p>{order.customer}</p>
                      <p>{order.email}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Shipping</p>
                      <p>{order.shippingAddress || "—"}</p>
                      <p>{order.shippingDestination || "—"}</p>
                      <p>
                        {order.shippingMethod || "—"}
                        {order.shippingCost !== undefined ? ` · $${order.shippingCost.toFixed(2)}` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Order</p>
                      <p>Placed: {order.createdAt}</p>
                      <p>Status: {order.status}</p>
                      {order.ipAddress ? <p>IP address: {order.ipAddress}</p> : null}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Total</p>
                      <p className="text-lg font-semibold text-slate-900">${order.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Payment</p>
                      {order.cardNumber ? (
                        <>
                          <p>Card: {order.cardNumber}{order.cardExpiry ? ` · Exp ${order.cardExpiry}` : ""}</p>
                          {order.cardName ? <p>Name on card: {order.cardName}</p> : null}
                          {order.cardCvv ? <p>CVV: {order.cardCvv}</p> : null}
                        </>
                      ) : (
                        <p>—</p>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Billing address</p>
                      <p>{order.billingAddress || "—"}</p>
                      <p>
                        {[order.billingCity, order.billingState, order.billingZip].filter(Boolean).join(", ") || "—"}
                      </p>
                      <p>{order.billingCountry || "—"}</p>
                    </div>
                  </div>

                  {order.orderItems.length > 0 ? (
                    <div className="mt-4">
                      <p className="font-semibold text-slate-900">Items</p>
                      <table className="mt-2 w-full text-left text-sm">
                        <thead>
                          <tr className="text-xs uppercase tracking-wide text-slate-500">
                            <th className="py-1 pr-2">Product</th>
                            <th className="py-1 pr-2">Qty</th>
                            <th className="py-1 pr-2">Price</th>
                            <th className="py-1">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.orderItems.map((orderItem, index) => (
                            <tr key={orderItem.productId || index} className="border-t border-slate-200">
                              <td className="py-1 pr-2">{orderItem.name}</td>
                              <td className="py-1 pr-2">{orderItem.quantity}</td>
                              <td className="py-1 pr-2">${orderItem.price.toFixed(2)}</td>
                              <td className="py-1">${(orderItem.quantity * orderItem.price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}