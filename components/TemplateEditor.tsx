"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import type { BlueprintLayer, DesignTemplate } from "@/types/api";
import type { TierConfig } from "@/lib/cakeLayout";
import ImageUploadField from "@/components/ImageUploadField";
import {
  Loader2,
  Sparkles,
  Info,
  Coins,
  Camera,
  Layers,
  Rotate3d,
  Settings2,
  Lock,
  Unlock,
  AlertCircle,
  Pencil,
  Save,
} from "lucide-react";

// Lazy Load Complex Visual Components
const CakeLayerEditor = dynamic(() => import("@/components/CakeLayerEditor"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border-2 border-dashed border-stone-200 bg-white p-6 h-[420px] flex flex-col gap-2 items-center justify-center text-cocoa/40">
      <Loader2 className="w-6 h-6 animate-spin text-berry" />
      <span className="text-sm font-medium">Loading digital canvas...</span>
    </div>
  ),
});

const Cake3DPreview = dynamic(() => import("@/components/Cake3DPreview"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-stone-100 border border-stone-200 h-[320px] flex flex-col gap-2 items-center justify-center text-cocoa/40">
      <Loader2 className="w-5 h-5 animate-spin text-cocoa/40" />
      <span className="text-sm font-medium">
        Assembling 3D layout viewport...
      </span>
    </div>
  ),
});

export default function TemplateEditor({
  existingTemplate,
}: {
  existingTemplate?: DesignTemplate;
}) {
  const isEditing = !!existingTemplate;
  const router = useRouter();

  // --- State Initialization (Seeds with existing data if editing) ---
  const [name, setName] = useState(existingTemplate?.name ?? "");
  const [story, setStory] = useState(existingTemplate?.story ?? "");
  const [basePrice, setBasePrice] = useState(
    existingTemplate?.base_price?.toString() ?? "",
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    existingTemplate?.cover_image_url ?? "",
  );
  const [layers, setLayers] = useState<BlueprintLayer[]>(
    (existingTemplate?.layers as BlueprintLayer[]) ?? [],
  );
  const [tiers, setTiers] = useState<TierConfig[]>(
    existingTemplate?.tiers ?? [
      { shape: "round", kg: 1 },
      { shape: "round", kg: 1 },
    ],
  );

  // Customization Permissions
  const [colorsEditable, setColorsEditable] = useState(
    existingTemplate?.customizable_fields.colors_editable ?? true,
  );
  const [stickersEditable, setStickersEditable] = useState(
    existingTemplate?.customizable_fields.stickers_editable ?? true,
  );
  const [maxStickers, setMaxStickers] = useState(
    existingTemplate?.customizable_fields.max_stickers?.toString() ?? "5",
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Submission Handler (Switches Method based on Mode) ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!coverImageUrl) {
      setError(
        "Please upload or provide a cover photo to showcase your design.",
      );
      return;
    }
    setLoading(true);
    setError(null);

    const payload = {
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
    };

    try {
      const url = isEditing
        ? `/api/templates/${existingTemplate.id}`
        : "/api/templates";

      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Could not save design layout template");
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
    <div className="space-y-6">
      {/* Header Context */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cocoa flex items-center gap-2">
            {isEditing ? (
              <Pencil className="w-6 h-6 text-berry" />
            ) : (
              <Sparkles className="w-6 h-6 text-berry" />
            )}
            {isEditing ? "Edit Design" : "Bakery Studio"}
          </h1>
          <p className="text-sm text-cocoa/60 mt-1">
            {isEditing
              ? "Update your design visuals, pricing, or customer permissions."
              : "Assemble the default look of a new design."}
          </p>
        </div>
        {isEditing && (
          <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-1 rounded-md font-mono">
            ID: {existingTemplate.id.slice(0, 8)}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Card Frame 1: Core Metadata */}
        <div className="rounded-2xl bg-white border border-stone-100 p-6 flex flex-col gap-5 shadow-sm">
          <div>
            <label className="flex items-center gap-1.5 text-xs text-cocoa/50 font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-berry" />
              Cake Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Midnight Raspberry Velvet"
              className="w-full rounded-xl border border-stone-200 focus:border-berry focus:ring-1 focus:ring-berry/20 outline-none px-4 py-3 text-cocoa text-sm transition-all"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs text-cocoa/50 font-bold uppercase tracking-wider mb-2">
              <Info className="w-3.5 h-3.5 text-cocoa/40" />
              Fun fact or story (optional)
            </label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              rows={3}
              placeholder="Where did this recipe come from? What makes it custom or special?"
              className="w-full rounded-xl border border-stone-200 focus:border-berry focus:ring-1 focus:ring-berry/20 outline-none px-4 py-3 text-cocoa text-sm transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs text-cocoa/50 font-bold uppercase tracking-wider mb-2">
                <Coins className="w-3.5 h-3.5 text-cocoa/40" />
                Base price (KSh)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="4,500"
                className="w-full rounded-xl border border-stone-200 focus:border-berry focus:ring-1 focus:ring-berry/20 outline-none px-4 py-3 text-cocoa text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs text-cocoa/50 font-bold uppercase tracking-wider mb-2">
                <Camera className="w-3.5 h-3.5 text-cocoa/40" />
                Cover photo
              </label>
              <ImageUploadField
                value={coverImageUrl}
                onChange={setCoverImageUrl}
              />
            </div>
          </div>
        </div>

        {/* Card Frame 2: The Studio Canvas */}
        <div className="space-y-2">
          <p className="font-display font-medium text-cocoa flex items-center gap-2">
            <Layers className="w-4 h-4 text-berry" />
            Design the default look
          </p>
          <CakeLayerEditor
            initial={isEditing ? { layers, tiers } : undefined} // Pass existing data to canvas
            onChange={({ layers, tiers }) => {
              setLayers(layers);
              setTiers(tiers);
            }}
          />
        </div>

        {/* Card Frame 3: Viewport Mesh */}
        <div className="space-y-2">
          <p className="font-display font-medium text-cocoa flex items-center gap-2">
            <Rotate3d className="w-4 h-4 text-berry" />
            3D dynamic canvas preview
          </p>
          <Cake3DPreview layers={layers} tiers={tiers} />
        </div>

        {/* Card Frame 4: Permissions */}
        <div className="rounded-2xl bg-white border border-stone-100 p-6 flex flex-col gap-4 shadow-sm">
          <div>
            <p className="font-display font-medium text-cocoa flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-berry" />
              What can customers change?
            </p>
            <p className="text-xs text-cocoa/50 mt-0.5">
              Toggle active permissions parameters below.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <label
              className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all select-none ${
                colorsEditable
                  ? "border-berry/20 bg-berry/[0.01]"
                  : "border-stone-100 bg-stone-50/50 opacity-70"
              }`}
            >
              <input
                type="checkbox"
                checked={colorsEditable}
                onChange={(e) => setColorsEditable(e.target.checked)}
                className="rounded border-stone-300 text-berry focus:ring-berry/20 w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-cocoa flex items-center gap-1.5">
                  {colorsEditable ? (
                    <Unlock className="w-3.5 h-3.5 text-berry" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  Color adjustments
                </span>
                <span className="text-xs text-cocoa/50 mt-0.5">
                  Allow custom frosting changes
                </span>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all select-none ${
                stickersEditable
                  ? "border-berry/20 bg-berry/[0.01]"
                  : "border-stone-100 bg-stone-50/50 opacity-70"
              }`}
            >
              <input
                type="checkbox"
                checked={stickersEditable}
                onChange={(e) => setStickersEditable(e.target.checked)}
                className="rounded border-stone-300 text-berry focus:ring-berry/20 w-4 h-4"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-cocoa flex items-center gap-1.5">
                  {stickersEditable ? (
                    <Unlock className="w-3.5 h-3.5 text-berry" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-stone-400" />
                  )}
                  Sticker application
                </span>
                <span className="text-xs text-cocoa/50 mt-0.5">
                  Allow custom decal decoration placements
                </span>
              </div>
            </label>
          </div>

          {stickersEditable && (
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between gap-4 mt-1">
              <div>
                <p className="text-sm font-medium text-cocoa">
                  Maximum decoration slots
                </p>
                <p className="text-xs text-cocoa/50 mt-0.5">
                  Limit the total number of items allowed per layout order.
                </p>
              </div>
              <input
                type="number"
                min={0}
                value={maxStickers}
                onChange={(e) => setMaxStickers(e.target.value)}
                className="w-24 rounded-xl border border-stone-200 focus:border-berry focus:ring-1 focus:ring-berry/20 outline-none px-3 py-2 text-cocoa text-sm font-medium text-center bg-white transition-all"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 p-4 text-red-700 text-sm font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-berry text-white font-display font-medium py-3.5 shadow-sm shadow-berry/20 hover:bg-berry/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isEditing ? "Updating..." : "Saving..."}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>
                {isEditing ? "Update Design" : "Publish Design Template"}
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
