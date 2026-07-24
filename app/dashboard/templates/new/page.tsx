"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTemplatePage() {
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [baseShape, setBaseShape] = useState("round");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          base_shape: baseShape,
          base_price: Number(basePrice),
          cover_image_url: coverImageUrl || "https://placehold.co/600x600?text=Cake",
          tags: [],
          customizable_fields: {},
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not save design");
      }
      router.push("/dashboard/templates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-cocoa mb-6">New design</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          placeholder="Design name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-cocoa/20 px-4 py-3"
          required
        />
        <input
          placeholder="Base price (KSh)"
          type="number"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          className="rounded-xl border border-cocoa/20 px-4 py-3"
          required
        />
        <select
          value={baseShape}
          onChange={(e) => setBaseShape(e.target.value)}
          className="rounded-xl border border-cocoa/20 px-4 py-3"
        >
          <option value="round">Round</option>
          <option value="square">Square</option>
          <option value="tiered">Tiered</option>
        </select>
        <input
          placeholder="Cover image URL (optional)"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          className="rounded-xl border border-cocoa/20 px-4 py-3"
        />
        {error && <p className="text-berry text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-berry text-white font-display py-3 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save design"}
        </button>
      </form>
    </div>
  );
}
