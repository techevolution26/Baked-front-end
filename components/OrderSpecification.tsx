"use client";

import dynamic from "next/dynamic";
import { SWATCHES, STICKERS } from "@/lib/cakeAssets";
import type { Blueprint, BlueprintLayer } from "@/types/api";

const Cake3DPreview = dynamic(() => import("@/components/Cake3DPreview"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl bg-cocoa/5 h-[320px] flex items-center justify-center text-cocoa/40">
      Loading preview...
    </div>
  ),
});

// Explicit Type Guards merged from the new layout variation
function isColorFill(
  l: BlueprintLayer,
): l is BlueprintLayer & { target: string; hex: string } {
  return (
    l.type === "color_fill" &&
    typeof l.target === "string" &&
    typeof l.hex === "string"
  );
}

function isSticker(
  l: BlueprintLayer,
): l is BlueprintLayer & { asset_id: string } {
  return l.type === "sticker" && typeof l.asset_id === "string";
}

// Safe case-insensitive asset text name match resolution
function colorName(hex: string): string {
  if (!hex || typeof hex !== "string") return "Custom Color";
  return (
    SWATCHES.find((s) => s?.hex?.toLowerCase() === hex.toLowerCase())?.name ??
    hex
  );
}

//  Safe sticker name resolution
function stickerName(assetId: string): string {
  if (!assetId) return "Sticker";
  return STICKERS.find((s) => s?.id === assetId)?.name ?? "Custom Sticker";
}

interface OrderSpecificationProps {
  blueprint: Blueprint;
  customerName?: string; // 👈 Added optional property for explicit name or username
}

export default function OrderSpecification({
  blueprint,
  customerName = "Valued Customer", // Default fallback if data is omitted
}: OrderSpecificationProps) {
  const layers = (blueprint?.layers ?? []) as BlueprintLayer[];
  const tiers = blueprint?.tiers ?? [];

  const colorFills = layers.filter(isColorFill);
  const stickers = layers.filter(isSticker);

  // Group stickers to show aggregate counts (e.g., "2x Star")
  const stickerCounts = new Map<string, number>();
  for (const s of stickers) {
    stickerCounts.set(s.asset_id, (stickerCounts.get(s.asset_id) ?? 0) + 1);
  }

  return (
    <div className="rounded-2xl bg-white shadow p-6 flex flex-col gap-5">
      {/*  New Feature: Customer metadata header profile info block */}
      <div className="border-b border-cocoa/10 pb-3">
        <p className="text-xs text-cocoa/50 uppercase tracking-wide font-semibold">
          Ordered By
        </p>
        <p className="font-display text-lg text-cocoa font-medium mt-0.5">
          {customerName}
        </p>
      </div>

      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide font-semibold mb-3">
          Tier Specifications
        </p>
        <div className="flex flex-col gap-2.5">
          {tiers.map((tier, i) => {
            const fill = colorFills.find(
              (f) => f.target === `tier_${i + 1}_body`,
            );
            const tierLabel =
              i === 0
                ? "Bottom tier"
                : i === tiers.length - 1
                  ? "Top tier"
                  : `Tier ${i + 1}`;

            return (
              <div
                key={i}
                className="flex items-center justify-between text-sm border-b border-cocoa/5 pb-2 last:border-0 last:pb-0"
              >
                <p className="text-cocoa/70">
                  {tierLabel} &middot;{" "}
                  <span className="capitalize font-medium text-cocoa">
                    {tier.shape}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  {/* Merged Visual Color Indicator Badge */}
                  {fill && (
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-cocoa/20 shadow-sm"
                      style={{ backgroundColor: fill.hex }}
                    />
                  )}
                  <p className="text-cocoa font-medium">
                    {fill ? colorName(fill.hex) : "Cream (default)"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs text-cocoa/50 uppercase tracking-wide font-semibold mb-2">
          Sticker Assets Layout{" "}
          {stickers.length > 0 ? `(${stickers.length})` : ""}
        </p>
        {stickerCounts.size === 0 ? (
          <p className="text-sm text-cocoa/40 italic">
            No custom stickers applied to canvas layout
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2 pt-1">
            {Array.from(stickerCounts.entries()).map(([assetId, count]) => (
              <li
                key={assetId}
                className="rounded-xl bg-cocoa/5 border border-cocoa/10 px-3 py-1 text-xs text-cocoa/80 font-medium"
              >
                {count}x {stickerName(assetId)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3D Preview Engine Rendering */}
      <div className="mt-2 border-t border-cocoa/10 pt-4">
        <p className="text-xs text-cocoa/50 uppercase tracking-wide font-semibold mb-3">
          3D Render Canvas View
        </p>
        <Cake3DPreview layers={layers} tiers={tiers} />
      </div>
    </div>
  );
}
