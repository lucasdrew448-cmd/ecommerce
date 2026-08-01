"use client";

import { useState } from "react";

export default function ResendConfirmation({ orderId }: { orderId: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleResend = async () => {
    setState("sending");
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}/resend-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (!response.ok) {
        setState("error");
        setMessage(data.error || "Unable to resend confirmation email.");
        return;
      }

      setState("sent");
      setMessage(data.message || "Confirmation email resent successfully.");
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to resend confirmation email.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        disabled={state === "sending"}
        onClick={handleResend}
        className="rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "sending" ? "Resending…" : "Resend confirmation email"}
      </button>
      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}