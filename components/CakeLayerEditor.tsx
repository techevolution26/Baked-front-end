"use client";

import { useState } from "react";
import { Stage, Layer, Ellipse, Rect, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { v4 as uuid } from "uuid";
import type { KonvaEventObject } from "konva/lib/Node";
import {
  Minus,
  Plus,
  Circle,
  Square,
  Palette,
  Check,
  Sticker,
  Lock,
  Trash2,
} from "lucide-react";

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

// --- Types ---

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

// --- Helper Functions ---

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
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "move";
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) container.style.cursor = "default";
      }}
    />
  );
}

// --- Main Component ---

export default function CakeLayerEditor({
  onChange,
  initial,
  customization,
}: {
  onChange?: (data: { layers: BlueprintLayer[]; tiers: TierConfig[] }) => void;
  initial?: { layers: BlueprintLayer[]; tiers: TierConfig[] };
  customization?: CustomizationRules;
}) {
  // 1. Initialization Logic
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

  // 2. State Management
  const [tiers, setTiers] = useState<TierConfig[]>(startingTiers);
  const [tierColors, setTierColors] = useState<string[]>(
    hydrated?.tierColors ?? startingTiers.map(() => "#FFF3DE"),
  );
  const [selectedTier, setSelectedTier] = useState(0);
  const [placed, setPlaced] = useState<PlacedSticker[]>(hydrated?.placed ?? []);

  // 3. Permission Logic
  const canEditTiers = !customization;
  const canEditColors = !customization || customization.colorsEditable;
  const canEditStickers = !customization || customization.stickersEditable;
  const maxStickers = customization ? customization.maxStickers : Infinity;

  // 4. Update Emitter
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

  // 5. Action Handlers
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
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      {/* ---------------- LEFT: INTERACTIVE CANVAS ---------------- */}
      <div className="relative group mx-auto flex-shrink-0">
        <div
          className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          style={{ width: CANVAS_W, height: CANVAS_H }}
        >
          <Stage width={CANVAS_W} height={CANVAS_H}>
            <Layer>
              {tierLayouts.map((t, i) => {
                const isSelected = selectedTier === i;
                const stroke = isSelected ? "#C13F5E" : "rgba(90, 59, 46, 0.1)";
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
                    onMouseEnter={(e) => {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = "default";
                    }}
                  />
                ) : (
                  <Rect
                    key={i}
                    x={t.centerX - t.width / 2}
                    y={t.centerY - t.height / 2}
                    width={t.width}
                    height={t.height}
                    cornerRadius={6}
                    fill={tierColors[i]}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    onClick={onSelect}
                    onTap={onSelect}
                    onMouseEnter={(e) => {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = "pointer";
                    }}
                    onMouseLeave={(e) => {
                      const container = e.target.getStage()?.container();
                      if (container) container.style.cursor = "default";
                    }}
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

        {/* Canvas Meta Hint */}
        <div className="absolute bottom-4 right-4 pointer-events-none bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-stone-200 text-[10px] font-semibold text-cocoa/50 shadow-sm flex items-center gap-1">
          <span>
            {CANVAS_W} x {CANVAS_H}px
          </span>
        </div>
      </div>

      {/* ---------------- RIGHT: CONTROL PANEL ---------------- */}
      <div className="flex-1 flex flex-col gap-6 min-w-[300px] w-full">
        {/* PANEL A: TIERS & STRUCTURE */}
        <div className="rounded-2xl bg-white border border-stone-100 shadow-sm overflow-hidden">
          <div className="bg-stone-50/80 border-b border-stone-100 px-5 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-cocoa text-sm">
                {canEditTiers ? "Structure Configuration" : "Tier Quantity"}
              </h3>
              <p className="text-[10px] text-cocoa/50 mt-0.5">
                {canEditTiers
                  ? "Define shapes and stack height"
                  : "Fixed design structure"}
              </p>
            </div>

            {/* Add/Remove Buttons (Owner Only) */}
            {canEditTiers && (
              <div className="flex gap-1">
                <button
                  onClick={removeTier}
                  disabled={tiers.length <= MIN_TIERS}
                  className="p-1.5 rounded-lg text-cocoa/40 hover:bg-red-50 hover:text-red-500 disabled:opacity-20 transition-colors"
                  title="Remove top tier"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-stone-200 my-auto mx-1" />
                <button
                  onClick={addTier}
                  disabled={tiers.length >= MAX_TIERS}
                  className="p-1.5 rounded-lg text-cocoa/40 hover:bg-berry/5 hover:text-berry disabled:opacity-20 transition-colors"
                  title="Add tier"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="divide-y divide-stone-100">
            {tiers.map((tier, i) => (
              <div
                key={i}
                className={`px-5 py-3 flex items-center gap-3 transition-colors cursor-pointer ${selectedTier === i ? "bg-berry/[0.02]" : "hover:bg-stone-50"}`}
                onClick={() => setSelectedTier(i)}
              >
                {/* Active Indicator */}
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1 ${selectedTier === i ? "bg-berry" : "bg-stone-200"}`}
                />

                {/* Tier Label */}
                <span
                  className={`text-xs font-bold uppercase tracking-wider min-w-[48px] ${selectedTier === i ? "text-berry" : "text-cocoa/60"}`}
                >
                  Tier {i + 1}
                </span>

                {/* Shape Toggles (Owner Only) */}
                {canEditTiers && (
                  <div className="flex bg-stone-100 rounded-lg p-0.5 mx-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTierShape(i, "round");
                      }}
                      className={`p-1.5 rounded-md transition-all ${tier.shape === "round" ? "bg-white shadow-sm text-cocoa" : "text-cocoa/40"}`}
                      title="Round Shape"
                    >
                      <Circle className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setTierShape(i, "square");
                      }}
                      className={`p-1.5 rounded-md transition-all ${tier.shape === "square" ? "bg-white shadow-sm text-cocoa" : "text-cocoa/40"}`}
                      title="Square Shape"
                    >
                      <Square className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Weight Input (Spacer) */}
                <div className="ml-auto flex items-center gap-2">
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={tier.kg}
                    onChange={(e) => setTierKg(i, parseFloat(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="w-14 rounded-lg border border-stone-200 text-xs font-medium text-center py-1.5 px-1 focus:border-berry focus:ring-1 focus:ring-berry/20 outline-none text-cocoa"
                  />
                  <span className="text-[10px] font-bold text-cocoa/40 uppercase">
                    kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL B: DECORATION */}
        <div className="rounded-2xl bg-white border border-stone-100 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="bg-stone-50/80 border-b border-stone-100 px-5 py-4">
            <h3 className="font-display font-bold text-cocoa text-sm">
              Decoration Suite
            </h3>
            <p className="text-[10px] text-cocoa/50 mt-0.5">
              {canEditColors
                ? "Customize colors and toppings"
                : "This design has fixed styling"}
            </p>
          </div>

          <div className="p-5 space-y-6">
            {/* 1. Color Picker */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-cocoa/60 uppercase tracking-wide flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  Frosting Color
                </label>
                {!canEditColors && (
                  <span className="flex items-center gap-1 bg-stone-100 text-stone-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>

              {canEditColors ? (
                <div className="grid grid-cols-6 gap-2">
                  {SWATCHES.map((sw) => (
                    <button
                      key={sw.id}
                      onClick={() => pickColor(sw.hex)}
                      className={`relative w-8 h-8 rounded-full shadow-sm border border-black/5 transition-all hover:scale-110 active:scale-95 ${tierColors[selectedTier] === sw.hex ? "ring-2 ring-offset-1 ring-berry" : ""}`}
                      style={{ backgroundColor: sw.hex }}
                      title={sw.name}
                    >
                      {tierColors[selectedTier] === sw.hex && (
                        <Check className="w-3.5 h-3.5 text-black/50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl text-center">
                  <p className="text-xs text-cocoa/40">
                    The bakery has set a fixed color theme.
                  </p>
                </div>
              )}
              {canEditColors && (
                <p className="text-[10px] text-cocoa/40 mt-2 text-right italic">
                  Applying to Tier {selectedTier + 1}
                </p>
              )}
            </div>

            <div className="h-px bg-stone-100 w-full" />

            {/* 2. Sticker Tray */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-cocoa/60 uppercase tracking-wide flex items-center gap-1.5">
                  <Sticker className="w-3.5 h-3.5" />
                  Toppings
                </label>
                <div className="flex items-center gap-2">
                  {canEditStickers && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${placed.length >= maxStickers ? "bg-red-50 text-red-500" : "bg-stone-100 text-cocoa/50"}`}
                    >
                      {placed.length} /{" "}
                      {maxStickers === Infinity ? "∞" : maxStickers}
                    </span>
                  )}
                  {!canEditStickers && (
                    <span className="flex items-center gap-1 bg-stone-100 text-stone-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  )}
                </div>
              </div>

              {canEditStickers ? (
                <>
                  <div
                    className={`grid grid-cols-4 gap-3 ${placed.length >= maxStickers ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {STICKERS.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => addSticker(asset)}
                        disabled={placed.length >= maxStickers}
                        className="group flex flex-col items-center gap-1 focus:outline-none"
                      >
                        <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 flex items-center justify-center p-1.5 shadow-sm transition-all group-hover:border-berry/30 group-hover:shadow-md group-active:scale-95">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                  {placed.length > 0 && (
                    <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50/50 border border-amber-100 text-amber-800/60">
                      <Trash2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <p className="text-[10px] leading-relaxed">
                        To remove an item,{" "}
                        <span className="font-semibold">double-tap</span> it
                        directly on the cake preview.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl text-center">
                  <p className="text-xs text-cocoa/40">
                    Custom toppings are not enabled for this design.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
