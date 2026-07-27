/**
 * Shared cake geometry -- both CakeLayerEditor (2D Konva) and
 * Cake3DPreview (Three.js) compute tier positions/sizes from this one
 * module instead of each hardcoding their own layout. That's what
 * keeps them visually consistent as tier count/shape changes, and
 * lets a sticker's canvas position be mapped to the correct tier by
 * either renderer.
 */

import type { TierShape, TierConfig } from "@/types/api";
export type { TierShape, TierConfig };

export const CANVAS_W = 360;
export const CANVAS_H = 420;

const TIER_HEIGHT = 70;
const BOTTOM_Y = 380;
const MAX_WIDTH = 260;
const MIN_WIDTH_RATIO = 0.5;

export const MIN_TIERS = 1;
export const MAX_TIERS = 4;

export type TierLayout = {
  shape: TierShape;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
  topY: number;
  bottomY: number;
};

/** Ordered bottom-to-top: index 0 is the biggest, bottom-most tier. */
export function computeTierLayouts(tiers: TierConfig[]): TierLayout[] {
  const n = tiers.length;
  return tiers.map((tier, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    const width = MAX_WIDTH * (1 - t * (1 - MIN_WIDTH_RATIO));
    const topY = BOTTOM_Y - (i + 1) * TIER_HEIGHT;
    const bottomY = topY + TIER_HEIGHT;
    return {
      shape: tier.shape,
      centerX: CANVAS_W / 2,
      centerY: topY + TIER_HEIGHT / 2,
      width,
      height: TIER_HEIGHT,
      topY,
      bottomY,
    };
  });
}

/** Given a normalized (0-1) canvas y, which tier band does it fall in?
 * Used to know which tier a sticker "belongs to" for the 3D preview. */
export function tierIndexForY(tiers: TierConfig[], yNorm: number): number {
  const layouts = computeTierLayouts(tiers);
  const yPx = yNorm * CANVAS_H;
  for (let i = layouts.length - 1; i >= 0; i--) {
    if (yPx <= layouts[i].bottomY) return i;
  }
  return 0;
}

const SCALE_3D = 90; // pixels per 3D unit, tuned to match prior hand-picked sizes

export type Tier3D = {
  shape: TierShape;
  radius: number;
  height: number;
  baseY: number;
};

/** Same geometry, converted to 3D world units and stacked bottom-up. */
export function tierLayoutsTo3D(tiers: TierConfig[]): Tier3D[] {
  const layouts = computeTierLayouts(tiers);
  let cumulativeHeight = 0;
  return layouts.map((l) => {
    const radius = l.width / 2 / SCALE_3D;
    const height = l.height / SCALE_3D;
    const baseY = cumulativeHeight;
    cumulativeHeight += height;
    return { shape: l.shape, radius, height, baseY };
  });
}
