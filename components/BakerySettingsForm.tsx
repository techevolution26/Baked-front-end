"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Bakery } from "@/types/api";

export default function BakerySettingsForm({ bakery }: { bakery: Bakery }) {
  const [name, setName] = useState(bakery.name);
  const [location, setLocation] = useState(bakery.location);
  const [mpesaTill, setMpesaTill] = useState(bakery.mpesa_till ?? "");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/bakeries/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, location, mpesa_till: mpesaTill || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not save settings");
      }
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow p-6 flex flex-col gap-4">
      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">Bakery name</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
          required
        />
      </div>
      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">Location</p>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
          required
        />
      </div>
      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">M-Pesa till</p>
        <input
          value={mpesaTill}
          onChange={(e) => setMpesaTill(e.target.value)}
          placeholder="Not connected"
          className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
        />
      </div>
      {error && <p className="text-berry text-sm">{error}</p>}
      {saved && <p className="text-sm text-cocoa/60">Saved.</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-berry text-white font-display py-3 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
