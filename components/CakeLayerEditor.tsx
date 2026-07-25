"use client";

/**
 * CakeLayerEditor -- tap-and-drag cake customization canvas.
 *
 * Interaction model (touch + low-literacy first, not text-first):
 * - Tap a tier to select it, tap a swatch to color it
 * - Tap a sticker in the tray to add it to the cake
 * - Drag any placed sticker directly on the canvas to reposition it
 * - Add/remove tiers and pick each tier's shape independently (they
 *   can be mixed -- a round bottom with a square top, etc.)
 *
 * Geometry comes from lib/cakeLayout.ts, shared with Cake3DPreview so
 * the two never disagree about tier sizes/positions.
 *
 * Emits { layers, tiers } via onChange -- ready to POST as part of a
 * blueprint or template.
 */

import { useState } from "react";
import { Stage, Layer, Ellipse, Rect, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { v4 as uuid } from "uuid";
import type { KonvaEventObject } from "konva/lib/Node";
import type { BlueprintLayer } from "@/types/api";
import {
  CANVAS_W,
  CANVAS_H,
  MIN_TIERS,
  MAX_TIERS,
  computeTierLayouts,
  type TierConfig,
  type TierShape,
} from "@/lib/cakeLayout";

type ColorSwatch = { id: string; hex: string; name: string };
type StickerAsset = { id: string; thumbnailUrl: string; name: string };
type PlacedSticker = {
  key: string;
  asset: StickerAsset;
  x: number;
  y: number;
  scale: number;
};

// A proper palette, not five colors -- the "cake museum" range across
// warm, cool, pastel, and deep tones.
const SWATCHES: ColorSwatch[] = [
  { id: "sw_berry", hex: "#C13F5E", name: "Berry" },
  { id: "sw_gold", hex: "#D4A537", name: "Gold" },
  { id: "sw_cream", hex: "#FFF3DE", name: "Cream" },
  { id: "sw_mint", hex: "#8FBF9F", name: "Mint" },
  { id: "sw_cocoa", hex: "#5A3B2E", name: "Cocoa" },
  { id: "sw_blush", hex: "#F3C6D3", name: "Blush" },
  { id: "sw_sky", hex: "#A9D3E5", name: "Sky" },
  { id: "sw_lavender", hex: "#C9B6E4", name: "Lavender" },
  { id: "sw_sunshine", hex: "#F6D86B", name: "Sunshine" },
  { id: "sw_coral", hex: "#F2896B", name: "Coral" },
  { id: "sw_sage", hex: "#B4C7A5", name: "Sage" },
  { id: "sw_charcoal", hex: "#3B2E35", name: "Charcoal" },
  { id: "sw_ivory", hex: "#FBF8F1", name: "Ivory" },
  { id: "sw_plum", hex: "#7B4B6A", name: "Plum" },
];

const STICKERS: StickerAsset[] = [
  { id: "sticker_heart", thumbnailUrl: "/stickers/heart.png", name: "Heart" },
  { id: "sticker_star", thumbnailUrl: "/stickers/star.png", name: "Star" },
  {
    id: "sticker_flower",
    thumbnailUrl: "/stickers/flower.png",
    name: "Flower",
  },
];

function PlacedStickerImage({
  sticker,
  onDrag,
}: {
  sticker: PlacedSticker;
  onDrag: (key: string, x: number, y: number) => void;
}) {
  const [img] = useImage(sticker.asset.thumbnailUrl);

  return (
    <KonvaImage
      image={img}
      x={sticker.x}
      y={sticker.y}
      offsetX={24}
      offsetY={24}
      scaleX={sticker.scale}
      scaleY={sticker.scale}
      draggable
      onDragEnd={(e: KonvaEventObject<DragEvent>) =>
        onDrag(sticker.key, e.target.x(), e.target.y())
      }
    />
  );
}

export default function CakeLayerEditor({
  onChange,
}: {
  onChange?: (data: { layers: BlueprintLayer[]; tiers: TierConfig[] }) => void;
}) {
  const [tiers, setTiers] = useState<TierConfig[]>([
    { shape: "round" },
    { shape: "round" },
  ]);
  const [tierColors, setTierColors] = useState<string[]>([
    "#FFF3DE",
    "#FFF3DE",
  ]);
  const [selectedTier, setSelectedTier] = useState(0);
  const [placed, setPlaced] = useState<PlacedSticker[]>([]);

  function emit(
    nextColors: string[],
    nextPlaced: PlacedSticker[],
    nextTiers: TierConfig[],
  ) {
    const layers: BlueprintLayer[] = [
      ...nextColors.map((hex, i) => ({
        type: "color_fill" as const,
        target: `tier_${i + 1}_body`,
        swatch_id: SWATCHES.find((s) => s.hex === hex)?.id ?? "custom",
        hex,
      })),
      ...nextPlaced.map((s) => ({
        type: "sticker" as const,
        asset_id: s.asset.id,
        x: s.x / CANVAS_W,
        y: s.y / CANVAS_H,
        scale: s.scale,
        rotation: 0,
      })),
    ];

    onChange?.({ layers, tiers: nextTiers });
  }

  function pickColor(hex: string) {
    const next = [...tierColors];
    next[selectedTier] = hex;
    setTierColors(next);
    emit(next, placed, tiers);
  }

  function addSticker(asset: StickerAsset) {
    const next = [
      ...placed,
      { key: uuid(), asset, x: CANVAS_W / 2, y: CANVAS_H / 2, scale: 1 },
    ];
    setPlaced(next);
    emit(tierColors, next, tiers);
  }

  function moveSticker(key: string, x: number, y: number) {
    const next = placed.map((s) => (s.key === key ? { ...s, x, y } : s));
    setPlaced(next);
    emit(tierColors, next, tiers);
  }

  function addTier() {
    if (tiers.length >= MAX_TIERS) return;
    const nextTiers = [...tiers, { shape: "round" as TierShape }];
    const nextColors = [...tierColors, "#FFF3DE"];
    setTiers(nextTiers);
    setTierColors(nextColors);
    emit(nextColors, placed, nextTiers);
  }

  function removeTier() {
    if (tiers.length <= MIN_TIERS) return;
    const nextTiers = tiers.slice(0, -1);
    const nextColors = tierColors.slice(0, -1);
    setTiers(nextTiers);
    setTierColors(nextColors);
    setSelectedTier((s) => Math.min(s, nextTiers.length - 1));
    emit(nextColors, placed, nextTiers);
  }

  function setTierShape(index: number, shape: TierShape) {
    const nextTiers = tiers.map((t, i) => (i === index ? { shape } : t));
    setTiers(nextTiers);
    emit(tierColors, placed, nextTiers);
  }

  const tierLayouts = computeTierLayouts(tiers);

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <div
        className="relative mx-auto overflow-hidden rounded-xl border-4 border-[#D4A537]/40 bg-white shadow-inner"
        style={{ width: CANVAS_W, height: CANVAS_H }}
      >
        <Stage width={CANVAS_W} height={CANVAS_H}>
          <Layer>
            {tierLayouts.map((t, i) => {
              const isSelected = selectedTier === i;
              const stroke = isSelected ? "#C13F5E" : "rgba(0,0,0,0.08)";
              const strokeWidth = isSelected ? 3 : 1;
              const onSelect = () => setSelectedTier(i);

              return t.shape === "round" ? (
                <Ellipse
                  key={i}
                  x={t.centerX}
                  y={t.centerY}
                  radiusX={t.width / 2}
                  radiusY={t.height / 2}
                  fill={tierColors[i]}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  onClick={onSelect}
                  onTap={onSelect}
                />
              ) : (
                <Rect
                  key={i}
                  x={t.centerX - t.width / 2}
                  y={t.topY}
                  width={t.width}
                  height={t.height}
                  cornerRadius={6}
                  fill={tierColors[i]}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  onClick={onSelect}
                  onTap={onSelect}
                />
              );
            })}

            {placed.map((s) => (
              <PlacedStickerImage
                key={s.key}
                sticker={s}
                onDrag={moveSticker}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="flex w-full flex-col gap-6 md:w-56">
        <div>
          <p className="mb-2 text-sm font-medium text-[#5A3B2E]">Tiers</p>
          <div className="flex flex-col gap-2">
            {tiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedTier(i)}
                  className={`rounded-lg px-2 py-1 text-xs ${
                    selectedTier === i
                      ? "bg-[#C13F5E] text-white"
                      : "border border-[#5A3B2E]/20 bg-white text-[#5A3B2E]"
                  }`}
                >
                  Tier {i + 1}
                </button>
                <button
                  onClick={() => setTierShape(i, "round")}
                  aria-label={`Tier ${i + 1} round`}
                  className={`rounded-lg px-2 py-1 text-xs ${
                    tier.shape === "round"
                      ? "bg-[#D4A537] text-white"
                      : "border border-[#5A3B2E]/20 bg-white text-[#5A3B2E]"
                  }`}
                >
                  Round
                </button>
                <button
                  onClick={() => setTierShape(i, "square")}
                  aria-label={`Tier ${i + 1} square`}
                  className={`rounded-lg px-2 py-1 text-xs ${
                    tier.shape === "square"
                      ? "bg-[#D4A537] text-white"
                      : "border border-[#5A3B2E]/20 bg-white text-[#5A3B2E]"
                  }`}
                >
                  Square
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <button
              onClick={addTier}
              disabled={tiers.length >= MAX_TIERS}
              className="rounded-lg border border-[#5A3B2E]/20 bg-white px-3 py-1.5 text-xs disabled:opacity-40"
            >
              + Add tier
            </button>
            <button
              onClick={removeTier}
              disabled={tiers.length <= MIN_TIERS}
              className="rounded-lg border border-[#5A3B2E]/20 bg-white px-3 py-1.5 text-xs disabled:opacity-40"
            >
              − Remove tier
            </button>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-[#5A3B2E]">
            Tap a tier, then a color
          </p>
          <div className="flex flex-wrap gap-2">
            {SWATCHES.map((sw) => (
              <button
                key={sw.id}
                aria-label={sw.name}
                onClick={() => pickColor(sw.hex)}
                className="h-9 w-9 rounded-full border-2 border-white shadow ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#C13F5E]"
                style={{ backgroundColor: sw.hex }}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-[#5A3B2E]">
            Tap to add, drag to place
          </p>
          <div className="flex flex-wrap gap-3">
            {STICKERS.map((asset) => (
              <button
                key={asset.id}
                onClick={() => addSticker(asset)}
                aria-label={`Add ${asset.name}`}
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#C13F5E]"
              >
                <img
                  src={asset.thumbnailUrl}
                  alt={asset.name}
                  className="h-8 w-8"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
