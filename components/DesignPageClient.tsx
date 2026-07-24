// components/DesignPageClient.tsx
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { DesignTemplate, BlueprintLayer } from "@/types/api";

const CakeLayerEditor = dynamic(() => import("@/components/CakeLayerEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-black/10 bg-white p-6 text-sm text-black/60">
      Loading editor...
    </div>
  ),
});

export default function DesignPageClient({
  template,
}: {
  template: DesignTemplate;
}) {
  const [layers, setLayers] = useState<BlueprintLayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function saveAndContinue() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/blueprints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: template.id,
          bakery_id: template.bakery_id,
          base: { shape: template.base_shape, tiers: 2, size_inches: 10 },
          layers,
          printable_elements: [],
        }),
      });

      if (res.status === 401) {
        router.push(`/login?next=/design/${template.id}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save your design");

      router.push(`/checkout/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <CakeLayerEditor onChange={setLayers} />

      <button
        onClick={saveAndContinue}
        disabled={loading}
        className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
      >
        {loading ? "Saving..." : "Save design & continue"}
      </button>
    </div>
  );
}
