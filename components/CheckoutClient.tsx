"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutClient({
  blueprintId,
  basePrice,
}: {
  blueprintId: string;
  basePrice: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function placeOrder() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint_id: blueprintId }),
      });

      if (res.status === 401) {
        router.push(`/login?next=/checkout/${blueprintId}`);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place your order");

      router.push(`/orders/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow p-6 mt-4">
      <p className="text-cocoa/70 text-sm mb-4">
        Starting price KSh {basePrice.toLocaleString()} -- final pricing and M-Pesa payment
        are wired in next.
      </p>
      {error && <p className="text-berry text-sm mb-3">{error}</p>}
      <button
        onClick={placeOrder}
        disabled={loading}
        className="w-full rounded-xl bg-berry text-white font-display py-3 disabled:opacity-50"
      >
        {loading ? "Placing order..." : "Place order"}
      </button>
    </div>
  );
}
