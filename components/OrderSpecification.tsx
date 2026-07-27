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

// Crash-proof case-insensitive lookup
function colorName(hex: string): string {
  if (!hex || typeof hex !== "string") return "Custom Color";

  return (
    SWATCHES.find((s) => s?.hex?.toLowerCase() === hex.toLowerCase())?.name ??
    hex
  );
}

function stickerName(assetId: string): string {
  if (!assetId) return "Sticker";
  return STICKERS.find((s) => s?.id === assetId)?.name ?? "Sticker";
}

export default function OrderSpecification({
  blueprint,
}: {
  blueprint: Blueprint;
}) {
  const layers = (blueprint?.layers ?? []) as BlueprintLayer[];
  const tiers = blueprint?.tiers ?? [];

  const tierSpecs = tiers.map((tier, i) => {
    const fill = layers.find(
      (l): l is BlueprintLayer & { hex: string } =>
        l.type === "color_fill" && l.target === `tier_${i + 1}_body`,
    );
    const label =
      i === 0
        ? "Bottom tier"
        : i === tiers.length - 1
          ? "Top tier"
          : `Tier ${i + 1}`;
    return {
      label,
      shape: tier.shape,
      colorLabel: fill ? colorName(fill.hex) : "Cream (default)",
    };
  });

  const stickerCounts = new Map<string, number>();
  for (const l of layers) {
    if (l.type === "sticker" && l.asset_id) {
      stickerCounts.set(l.asset_id, (stickerCounts.get(l.asset_id) ?? 0) + 1);
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow p-6">
      <p className="font-display text-cocoa mb-4">
        Customer&apos;s specification
      </p>

      <div className="mb-4">
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-2">
          Tiers
        </p>
        <ul className="space-y-1 text-sm text-cocoa/80">
          {tierSpecs.map((t, i) => (
            <li key={i} className="capitalize">
              {t.label} -- {t.shape} -- {t.colorLabel}
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <p className="text-xs text-cocoa/50 uppercase tracking-wide mb-2">
          Stickers
        </p>
        {stickerCounts.size === 0 ? (
          <p className="text-sm text-cocoa/40">None</p>
        ) : (
          <ul className="space-y-1 text-sm text-cocoa/80">
            {Array.from(stickerCounts.entries()).map(([assetId, count]) => (
              <li key={assetId}>
                {count}x {stickerName(assetId)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Cake3DPreview layers={layers} tiers={tiers} />
    </div>
  );
}
