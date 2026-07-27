export type Bakery = {
  id: string;
  name: string;
  location: string;
  mpesa_till: string | null;
  verified: boolean;
  rating: number;
};

export type DesignTemplate = {
  id: string;
  bakery_id: string;
  name: string;
  story: string | null;
  tiers: TierConfig[];
  base_price: number;
  cover_image_url: string;
  tags: string[];
  layers: Record<string, unknown>[];
  customizable_fields: TemplateCustomizationRules;
};

export type BlueprintLayer =
  | { type: "color_fill"; target: string; swatch_id: string; hex: string }
  | {
      type: "sticker";
      asset_id: string;
      x: number;
      y: number;
      scale: number;
      rotation: number;
    };

export type TierShape = "round" | "square";
export type TierConfig = { shape: TierShape };

export type Blueprint = {
  id: string;
  template_id: string | null;
  bakery_id: string;
  tiers: TierConfig[];
  layers: Record<string, unknown>[];
  preview_render_url: string | null;
};

export type Order = {
  id: string;
  blueprint_id: string;
  price: number;
  payment_status: string;
  order_status: string;
  created_at: string;
};

export type CurrentUser = {
  id: string;
  username: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  role: "customer" | "bakery_owner" | "admin";
};

export type TemplateCustomizationRules = {
  colors_editable: boolean;
  stickers_editable: boolean;
  max_stickers: number;
};
