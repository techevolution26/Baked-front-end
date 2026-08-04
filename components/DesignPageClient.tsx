"use client";

/**
 * The customer's design/customization page. Behaves like a shopping
 * cart: every change (flavor, tier weight, colors, stickers) updates
 * a live running total immediately, in-memory, with no navigation and
 * no save happening until the customer explicitly clicks the one
 * "Save design & continue" button at the bottom.
 *
 * The live price mirrors the backend's formula in
 * app/services/pricing.py for instant feedback with no network
 * round-trip per interaction -- but the category price *data* comes
 * from the backend (pricingConfig, fetched server-side), so the price
 * list itself is never hardcoded here.
 */

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type {
  BlueprintLayer,
  DesignTemplate,
  PricingConfig,
} from "@/types/api";
import type { TierConfig } from "@/lib/cakeLayout";

const CakeLayerEditor = dynamic(() => import("@/components/CakeLayerEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-white shadow p-6 h-[420px] flex items-center justify-center text-cocoa/40">
      Loading canvas...
    </div>
  ),
});

function computeLivePrice(
  designPrice: number,
  category: string,
  tiers: TierConfig[],
  layers: BlueprintLayer[],
  pricingConfig: PricingConfig,
) {
  const rate =
    pricingConfig.categories.find((c) => c.id === category)?.price_per_kg ?? 0;
  const totalKg = tiers.reduce((sum, t) => sum + (t.kg ?? 1), 0);
  const stickerCount = layers.filter((l) => l.type === "sticker").length;
  const price =
    rate * totalKg +
    designPrice +
    pricingConfig.sticker_surcharge * stickerCount;
  return { price, totalKg, stickerCount };
}

export default function DesignPageClient({
  template,
  pricingConfig,
}: {
  template: DesignTemplate;
  pricingConfig: PricingConfig;
}) {
  // Starts as the bakery's original design -- if the customer never
  // touches the editor, this is exactly what gets ordered.
  const [layers, setLayers] = useState<BlueprintLayer[]>(
    template.layers as BlueprintLayer[],
  );
  const [tiers, setTiers] = useState<TierConfig[]>(template.tiers);
  const [category, setCategory] = useState(
    pricingConfig.categories[0]?.id ?? "vanilla",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { price, totalKg, stickerCount } = useMemo(
    () =>
      computeLivePrice(
        template.base_price,
        category,
        tiers,
        layers,
        pricingConfig,
      ),
    [template.base_price, category, tiers, layers, pricingConfig],
  );

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
          category,
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
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">
          Flavor
        </p>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
        >
          {pricingConfig.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label} -- KSh {c.price_per_kg.toLocaleString()}/kg
            </option>
          ))}
        </select>
      </div>

      <CakeLayerEditor
        initial={{
          layers: template.layers as BlueprintLayer[],
          tiers: template.tiers,
        }}
        onChange={({ layers, tiers }) => {
          setLayers(layers);
          setTiers(tiers);
        }}
        customization={{
          colorsEditable: template.customizable_fields.colors_editable,
          stickersEditable: template.customizable_fields.stickers_editable,
          maxStickers: template.customizable_fields.max_stickers,
        }}
      />

      <div className="rounded-2xl bg-white shadow p-6 flex flex-col gap-2 sticky bottom-4">
        <div className="flex justify-between text-sm text-cocoa/70">
          <span>Total weight</span>
          <span>{totalKg} kg</span>
        </div>
        <div className="flex justify-between text-sm text-cocoa/70">
          <span>Stickers</span>
          <span>{stickerCount}</span>
        </div>
        <div className="flex justify-between font-display text-lg text-cocoa border-t border-cocoa/10 pt-2 mt-1">
          <span>Total</span>
          <span className="text-berry">KSh {price.toLocaleString()}</span>
        </div>
      </div>

      {error && <p className="text-berry text-sm">{error}</p>}
      <button
        onClick={saveAndContinue}
        disabled={loading}
        className="w-full rounded-xl bg-berry text-white font-display py-3 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save design & continue"}
      </button>
    </div>
  );
}
