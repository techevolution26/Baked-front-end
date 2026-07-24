"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const FLOW = ["submitted", "accepted", "baking", "ready", "delivered"];

export default function DashboardOrderActions({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not update status");
      }
      const updated = await res.json();
      setStatus(updated.order_status);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const nextIndex = FLOW.indexOf(status) + 1;
  const nextStatus = nextIndex < FLOW.length ? FLOW[nextIndex] : null;

  return (
    <div className="rounded-2xl bg-white shadow p-6">
      <p className="text-sm text-cocoa/60 mb-4">
        Current status: <span className="font-display text-cocoa capitalize">{status}</span>
      </p>
      {error && <p className="text-berry text-sm mb-4">{error}</p>}
      <div className="flex gap-3">
        {status === "submitted" && (
          <button
            onClick={() => updateStatus("rejected")}
            disabled={loading}
            className="rounded-xl border border-cocoa/20 text-cocoa font-display px-4 py-2 disabled:opacity-50"
          >
            Decline
          </button>
        )}
        {nextStatus && (
          <button
            onClick={() => updateStatus(nextStatus)}
            disabled={loading}
            className="rounded-xl bg-berry text-white font-display px-4 py-2 disabled:opacity-50 capitalize"
          >
            {loading ? "Updating..." : `Mark as ${nextStatus}`}
          </button>
        )}
      </div>
    </div>
  );
}
