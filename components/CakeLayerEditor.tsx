// components/CakeLayerEditor.tsx
"use client";

/**
 * CakeLayerEditor -- tap-and-drag cake customization canvas.
 *
 * Interaction model (touch + low-literacy first, not text-first):
 * - Tap a tier to select it, tap a swatch to color it
 * - Tap a sticker in the tray to add it to the cake
 * - Drag any placed sticker directly on the canvas to reposition it
 *
 * Emits a `layers[]` array matching the blueprint schema — ready to POST.
 */

import { useState } from "react";
import { Stage, Layer, Circle, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { v4 as uuid } from "uuid";
import type { KonvaEventObject } from "konva/lib/Node";
import type { BlueprintLayer } from "@/types/api";

type ColorSwatch = { id: string; hex: string; name: string };
type StickerAsset = { id: string; thumbnailUrl: string; name: string };
type PlacedSticker = {
  key: string;
  asset: StickerAsset;
  x: number;
  y: number;
  scale: number;
};

const SWATCHES: ColorSwatch[] = [
  { id: "sw_berry", hex: "#C13F5E", name: "Berry" },
  { id: "sw_gold", hex: "#D4A537", name: "Gold" },
  { id: "sw_cream", hex: "#FFF3DE", name: "Cream" },
  { id: "sw_mint", hex: "#8FBF9F", name: "Mint" },
  { id: "sw_cocoa", hex: "#5A3B2E", name: "Cocoa" },
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

const CANVAS_W = 360;
const CANVAS_H = 420;

const TIERS = [
  { cx: CANVAS_W / 2, cy: 300, r: 110 },
  { cx: CANVAS_W / 2, cy: 190, r: 80 },
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
  onChange?: (layers: BlueprintLayer[]) => void;
}) {
  const [tierColors, setTierColors] = useState<string[]>([
    "#FFF3DE",
    "#FFF3DE",
  ]);
  const [selectedTier, setSelectedTier] = useState(0);
  const [placed, setPlaced] = useState<PlacedSticker[]>([]);

  function emit(nextColors: string[], nextPlaced: PlacedSticker[]) {
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

    onChange?.(layers);
  }

  function pickColor(hex: string) {
    const next = [...tierColors];
    next[selectedTier] = hex;
    setTierColors(next);
    emit(next, placed);
  }

  function addSticker(asset: StickerAsset) {
    const next = [
      ...placed,
      {
        key: uuid(),
        asset,
        x: CANVAS_W / 2,
        y: CANVAS_H / 2,
        scale: 1,
      },
    ];
    setPlaced(next);
    emit(tierColors, next);
  }

  function moveSticker(key: string, x: number, y: number) {
    const next = placed.map((s) => (s.key === key ? { ...s, x, y } : s));
    setPlaced(next);
    emit(tierColors, next);
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <div
        className="relative mx-auto overflow-hidden rounded-xl border-4 border-[#D4A537]/40 bg-white shadow-inner"
        style={{ width: CANVAS_W, height: CANVAS_H }}
      >
        <Stage width={CANVAS_W} height={CANVAS_H}>
          <Layer>
            {TIERS.map((t, i) => (
              <Circle
                key={i}
                x={t.cx}
                y={t.cy}
                radius={t.r}
                fill={tierColors[i]}
                stroke={selectedTier === i ? "#C13F5E" : "rgba(0,0,0,0.08)"}
                strokeWidth={selectedTier === i ? 3 : 1}
                onClick={() => setSelectedTier(i)}
                onTap={() => setSelectedTier(i)}
              />
            ))}

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

      <div className="flex w-full flex-col gap-6 md:w-48">
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
                className="h-10 w-10 rounded-full border-2 border-white shadow ring-1 ring-black/10 focus:outline-none focus:ring-2 focus:ring-[#C13F5E]"
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
