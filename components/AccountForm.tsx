"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/types/api";

export default function AccountForm({ user }: { user: CurrentUser }) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [email, setEmail] = useState(user.email ?? "");
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
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || null,
          phone: phone || null,
          email: email || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not save");
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
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">Username</p>
        <p className="font-display text-cocoa">{user.username}</p>
      </div>
      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">Name</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
        />
      </div>
      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">Phone</p>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
        />
      </div>
      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">Email</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
