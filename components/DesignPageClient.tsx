"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { BlueprintLayer, DesignTemplate } from "@/types/api";
import type { TierConfig } from "@/lib/cakeLayout";

const CakeLayerEditor = dynamic(() => import("@/components/CakeLayerEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-white shadow p-6 h-[420px] flex items-center justify-center text-cocoa/40">
      Loading canvas...
    </div>
  ),
});

export default function DesignPageClient({
  template,
}: {
  template: DesignTemplate;
}) {
  // Starts as the bakery's original design -- if the customer never
  // touches the editor, this is exactly what gets ordered.
  const [layers, setLayers] = useState<BlueprintLayer[]>(
    template.layers as BlueprintLayer[],
  );
  const [tiers, setTiers] = useState<TierConfig[]>(template.tiers);
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
          tiers,
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
    <div>
      <CakeLayerEditor
        initial={{
          layers: template.layers as BlueprintLayer[],
          tiers: template.tiers,
        }}
        onChange={({ layers, tiers }) => {
          setLayers(layers);
          setTiers(tiers);
        }}
      />
      {error && <p className="text-berry text-sm mt-2">{error}</p>}
      <button
        onClick={saveAndContinue}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-berry text-white font-display py-3 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save design & continue"}
      </button>
    </div>
  );
}
