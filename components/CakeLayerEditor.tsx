"use client";

/**
 * CakeLayerEditor -- tap-and-drag cake customization canvas.
 *
 * Two modes:
 * - Studio/authoring (no `customization` prop): full control -- add/
 *   remove tiers, mix shapes, unrestricted colors and stickers.
 * - Customer (`customization` prop provided): tier shape/count is
 *   fixed (a structural, owner-only decision), colors/stickers gated
 *   by whatever the owner allowed. Weight (kg) per tier is ALWAYS
 *   editable in both modes -- quantity is a checkout concern, not a
 *   visual design one, and directly drives price (see DesignPageClient).
 *
 * Pass `initial` to seed the canvas from an existing design.
 *
 * Geometry comes from lib/cakeLayout.ts, shared with Cake3DPreview.
 * Colors/stickers come from lib/cakeAssets.ts, shared with anything
 * that needs to show a human-readable spec (e.g. the bakery's order
 * detail page).
 *
 * Emits { layers, tiers } via onChange.
 */

import { useState } from "react";
import { Stage, Layer, Ellipse, Rect, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { v4 as uuid } from "uuid";
import type { KonvaEventObject } from "konva/lib/Node";
import type { BlueprintLayer } from "@/types/api";
import { SWATCHES, STICKERS, type StickerAsset } from "@/lib/cakeAssets";
import {
  CANVAS_W,
  CANVAS_H,
  MIN_TIERS,
  MAX_TIERS,
  computeTierLayouts,
  type TierConfig,
  type TierShape,
} from "@/lib/cakeLayout";

type PlacedSticker = {
  key: string;
  asset: StickerAsset;
  x: number;
  y: number;
  scale: number;
};

type CustomizationRules = {
  colorsEditable: boolean;
  stickersEditable: boolean;
  maxStickers: number;
};

function hydrateFromLayers(layers: BlueprintLayer[], tierCount: number) {
  const tierColors = Array.from({ length: tierCount }, (_, i) => {
    const fill = layers.find(
      (l): l is BlueprintLayer & { hex: string } =>
        l.type === "color_fill" && l.target === `tier_${i + 1}_body`,
    );
    return fill?.hex ?? "#FFF3DE";
  });

  const placed: PlacedSticker[] = layers
    .filter(
      (
        l,
      ): l is BlueprintLayer & {
        asset_id: string;
        x: number;
        y: number;
        scale: number;
      } =>
        l.type === "sticker" &&
        typeof l.x === "number" &&
        typeof l.y === "number" &&
        typeof l.asset_id === "string",
    )
    .map((l) => {
      const asset = STICKERS.find((s) => s.id === l.asset_id);
      if (!asset) return null;
      return {
        key: uuid(),
        asset,
        x: l.x * CANVAS_W,
        y: l.y * CANVAS_H,
        scale: l.scale ?? 1,
      };
    })
    .filter((p): p is PlacedSticker => p !== null);

  return { tierColors, placed };
}

function PlacedStickerImage({
  sticker,
  onDrag,
  onRemove,
}: {
  sticker: PlacedSticker;
  onDrag: (key: string, x: number, y: number) => void;
  onRemove: (key: string) => void;
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
      onDblClick={() => onRemove(sticker.key)}
      onDblTap={() => onRemove(sticker.key)}
    />
  );
}

export default function CakeLayerEditor({
  onChange,
  initial,
  customization,
}: {
  onChange?: (data: { layers: BlueprintLayer[]; tiers: TierConfig[] }) => void;
  initial?: { layers: BlueprintLayer[]; tiers: TierConfig[] };
  customization?: CustomizationRules;
}) {
  const startingTiers: TierConfig[] =
    initial?.tiers && initial.tiers.length > 0
      ? initial.tiers
      : [
          { shape: "round", kg: 1 },
          { shape: "round", kg: 1 },
        ];
  const hydrated = initial
    ? hydrateFromLayers(initial.layers, startingTiers.length)
    : null;

  const [tiers, setTiers] = useState<TierConfig[]>(startingTiers);
  const [tierColors, setTierColors] = useState<string[]>(
    hydrated?.tierColors ?? startingTiers.map(() => "#FFF3DE"),
  );
  const [selectedTier, setSelectedTier] = useState(0);
  const [placed, setPlaced] = useState<PlacedSticker[]>(hydrated?.placed ?? []);

  const canEditTiers = !customization; // shape/count -- structural, owner-only
  const canEditColors = !customization || customization.colorsEditable;
  const canEditStickers = !customization || customization.stickersEditable;
  const maxStickers = customization ? customization.maxStickers : Infinity;

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
    if (!canEditColors) return;
    const next = [...tierColors];
    next[selectedTier] = hex;
    setTierColors(next);
    emit(next, placed, tiers);
  }

  function addSticker(asset: StickerAsset) {
    if (!canEditStickers || placed.length >= maxStickers) return;
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

  function removeSticker(key: string) {
    if (!canEditStickers) return;
    const next = placed.filter((s) => s.key !== key);
    setPlaced(next);
    emit(tierColors, next, tiers);
  }

  function addTier() {
    if (!canEditTiers || tiers.length >= MAX_TIERS) return;
    const nextTiers = [...tiers, { shape: "round" as TierShape, kg: 1 }];
    const nextColors = [...tierColors, "#FFF3DE"];
    setTiers(nextTiers);
    setTierColors(nextColors);
    emit(nextColors, placed, nextTiers);
  }

  function removeTier() {
    if (!canEditTiers || tiers.length <= MIN_TIERS) return;
    const nextTiers = tiers.slice(0, -1);
    const nextColors = tierColors.slice(0, -1);
    setTiers(nextTiers);
    setTierColors(nextColors);
    setSelectedTier((s) => Math.min(s, nextTiers.length - 1));
    emit(nextColors, placed, nextTiers);
  }

  function setTierShape(index: number, shape: TierShape) {
    if (!canEditTiers) return;
    const nextTiers = tiers.map((t, i) => (i === index ? { ...t, shape } : t));
    setTiers(nextTiers);
    emit(tierColors, placed, nextTiers);
  }

  function setTierKg(index: number, kg: number) {
    const safeKg = Number.isFinite(kg) && kg > 0 ? kg : 0.5;
    const nextTiers = tiers.map((t, i) =>
      i === index ? { ...t, kg: safeKg } : t,
    );
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
                onRemove={removeSticker}
              />
            ))}
          </Layer>
        </Stage>
      </div>

      <div className="flex w-full flex-col gap-6 md:w-56">
        <div>
          <p className="mb-2 text-sm font-medium text-[#5A3B2E]">
            {canEditTiers ? "Tiers" : "Quantity"}
          </p>
          <div className="flex flex-col gap-2">
            {tiers.map((tier, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5">
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
                {canEditTiers && (
                  <>
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
                  </>
                )}
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={tier.kg}
                  onChange={(e) => setTierKg(i, Number(e.target.value))}
                  aria-label={`Tier ${i + 1} weight in kg`}
                  className="w-16 rounded-lg border border-[#5A3B2E]/20 px-2 py-1 text-xs"
                />
                <span className="text-xs text-[#5A3B2E]/50">kg</span>
              </div>
            ))}
          </div>
          {canEditTiers && (
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
          )}
        </div>

        {canEditColors ? (
          <div>
            <p className="mb-2 text-sm font-medium text-[#5A3B2E]">
              {canEditTiers
                ? "Tap a tier, then a color"
                : "Tap the cake, then a color"}
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
        ) : (
          customization && (
            <p className="text-xs text-cocoa/40">
              This bakery has set fixed colors for this design.
            </p>
          )
        )}

        {canEditStickers ? (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-[#5A3B2E]">
                Tap to add, drag to place
              </p>
              {customization && (
                <p className="text-xs text-cocoa/40">
                  {placed.length}/{maxStickers}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {STICKERS.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => addSticker(asset)}
                  disabled={placed.length >= maxStickers}
                  aria-label={`Add ${asset.name}`}
                  className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#C13F5E] disabled:opacity-40"
                >
                  <img
                    src={asset.thumbnailUrl}
                    alt={asset.name}
                    className="h-8 w-8"
                  />
                </button>
              ))}
            </div>
            {placed.length > 0 && (
              <p className="mt-2 text-xs text-cocoa/40">
                Double-tap a sticker on the cake to remove it.
              </p>
            )}
          </div>
        ) : (
          customization && (
            <p className="text-xs text-cocoa/40">
              This bakery hasn't enabled custom stickers for this design.
            </p>
          )
        )}
      </div>
    </div>
  );
}
