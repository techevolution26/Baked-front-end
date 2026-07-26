"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { BlueprintLayer } from "@/types/api";
import type { TierConfig } from "@/lib/cakeLayout";
import ImageUploadField from "@/components/ImageUploadField";

const CakeLayerEditor = dynamic(() => import("@/components/CakeLayerEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-white shadow p-6 h-[420px] flex items-center justify-center text-cocoa/40">
      Loading canvas...
    </div>
  ),
});

const Cake3DPreview = dynamic(() => import("@/components/Cake3DPreview"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-cocoa/5 h-[320px] flex items-center justify-center text-cocoa/40">
      Loading 3D preview...
    </div>
  ),
});

export default function NewTemplatePage() {
  const [name, setName] = useState("");
  const [story, setStory] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [layers, setLayers] = useState<BlueprintLayer[]>([]);
  const [tiers, setTiers] = useState<TierConfig[]>([
    { shape: "round" },
    { shape: "round" },
  ]);
  const [colorsEditable, setColorsEditable] = useState(true);
  const [stickersEditable, setStickersEditable] = useState(true);
  const [maxStickers, setMaxStickers] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coverImageUrl) {
      setError("Please provide a cover Photo");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          story: story || null,
          tiers,
          base_price: Number(basePrice),
          cover_image_url: coverImageUrl,
          tags: [],
          layers,
          customizable_fields: {
            colors_editable: colorsEditable,
            stickers_editable: stickersEditable,
            max_stickers: Number(maxStickers),
          },
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
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-cocoa mb-2">Bakery Studio</h1>
      <p className="text-sm text-cocoa/60 mb-6">
        Assemble the default look of a new design, then decide what customers
        are allowed to change later.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <div className="rounded-2xl bg-white shadow p-6 flex flex-col gap-4">
          <div>
            <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">
              Cake name
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
              required
            />
          </div>
          <div>
            <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">
              Fun fact or story (optional)
            </p>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
              placeholder="Where did this recipe come from? What makes it special?"
              className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
            />
          </div>
          <div>
            <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">
              Base price (KSh)
            </p>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full rounded-xl border border-cocoa/20 px-4 py-3"
              required
            />
          </div>
          <div>
            <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">
              Cover photo -- what customers actually see and order
            </p>
            <ImageUploadField
              value={coverImageUrl}
              onChange={setCoverImageUrl}
            />
          </div>
        </div>

        <div>
          <p className="font-display text-cocoa mb-2">
            Design the default look
          </p>
          <CakeLayerEditor
            onChange={({ layers, tiers }) => {
              setLayers(layers);
              setTiers(tiers);
            }}
          />
        </div>

        <div>
          <p className="font-display text-cocoa mb-2">3D preview</p>
          <Cake3DPreview layers={layers} tiers={tiers} />
        </div>

        <div className="rounded-2xl bg-white shadow p-6 flex flex-col gap-4">
          <p className="font-display text-cocoa">What can customers change?</p>
          <label className="flex items-center gap-3 text-sm text-cocoa/80">
            <input
              type="checkbox"
              checked={colorsEditable}
              onChange={(e) => setColorsEditable(e.target.checked)}
            />
            Let customers change the colors
          </label>
          <label className="flex items-center gap-3 text-sm text-cocoa/80">
            <input
              type="checkbox"
              checked={stickersEditable}
              onChange={(e) => setStickersEditable(e.target.checked)}
            />
            Let customers add their own stickers
          </label>
          {stickersEditable && (
            <div className="pl-7">
              <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-1">
                Max stickers a customer can add
              </p>
              <input
                type="number"
                min={0}
                value={maxStickers}
                onChange={(e) => setMaxStickers(e.target.value)}
                className="w-32 rounded-xl border border-cocoa/20 px-4 py-3"
              />
            </div>
          )}
        </div>

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
