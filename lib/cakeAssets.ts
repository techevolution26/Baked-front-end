/**
 * Shared color palette and sticker catalog -- used by CakeLayerEditor
 * (for picking/placing) and OrderSpecification (for turning a saved
 * blueprint back into human-readable names for the baker). Kept in one
 * place so a color's hex always maps to the same name everywhere.
 */

export type ColorSwatch = { id: string; hex: string; name: string };
export type StickerAsset = { id: string; thumbnailUrl: string; name: string };

export const SWATCHES: ColorSwatch[] = [
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

function svgToDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5 C2,5.41 4.42,3 7.5,3 C9.24,3 10.91,3.81 12,5.08 C13.09,3.81 14.76,3 16.5,3 C19.58,3 22,5.41 22,8.5 C22,12.27 18.6,15.36 13.45,20.03 L12,21.35 Z" fill="#C13F5E"/></svg>`;
const STAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" fill="#D4A537"/></svg>`;
const FLOWER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><g fill="#F3C6D3"><ellipse cx="12" cy="6" rx="3" ry="4.2"/><ellipse cx="12" cy="6" rx="3" ry="4.2" transform="rotate(72 12 12)"/><ellipse cx="12" cy="6" rx="3" ry="4.2" transform="rotate(144 12 12)"/><ellipse cx="12" cy="6" rx="3" ry="4.2" transform="rotate(216 12 12)"/><ellipse cx="12" cy="6" rx="3" ry="4.2" transform="rotate(288 12 12)"/></g><circle cx="12" cy="12" r="3" fill="#D4A537"/></svg>`;

export const STICKERS: StickerAsset[] = [
  { id: "sticker_heart", thumbnailUrl: svgToDataUri(HEART_SVG), name: "Heart" },
  { id: "sticker_star", thumbnailUrl: svgToDataUri(STAR_SVG), name: "Star" },
  {
    id: "sticker_flower",
    thumbnailUrl: svgToDataUri(FLOWER_SVG),
    name: "Flower",
  },
];
