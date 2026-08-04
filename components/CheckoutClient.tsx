"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutClient({
  blueprintId,
  estimatedPrice,
}: {
  blueprintId: string;
  estimatedPrice: number;
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
      <div className="flex justify-between items-baseline mb-4">
        <p className="text-cocoa/70 text-sm">Estimated total</p>
        <p className="font-display text-xl text-berry">
          KSh {estimatedPrice.toLocaleString()}
        </p>
      </div>
      <p className="text-cocoa/50 text-xs mb-4">
        Final price is confirmed when your order is placed. M-Pesa payment
        isn&apos;t wired up yet -- this places the order with the bakery without
        taking payment.
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
