import { notFound } from "next/navigation";
import {
  fetchBlueprintById,
  fetchTemplateById,
  fetchPricingConfig,
} from "@/lib/api";
import { getCurrentBakery } from "@/lib/tenant";
import CheckoutClient from "@/components/CheckoutClient";
import OrderSpecification from "@/components/OrderSpecification";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ blueprintId: string }>;
}) {
  const { blueprintId } = await params;
  const blueprint = await fetchBlueprintById(blueprintId);
  if (!blueprint) notFound();

  const currentBakery = await getCurrentBakery();
  if (!currentBakery || blueprint.bakery_id !== currentBakery.id) notFound();

  const template = blueprint.template_id
    ? await fetchTemplateById(blueprint.template_id)
    : null;
  const pricingConfig = await fetchPricingConfig();

  const rate =
    pricingConfig.categories.find((c) => c.id === blueprint.category)
      ?.price_per_kg ?? 0;
  const totalKg = blueprint.tiers.reduce((sum, t) => sum + (t.kg ?? 1), 0);
  const stickerCount = blueprint.layers.filter(
    (l) => (l as { type?: string }).type === "sticker",
  ).length;
  const estimatedPrice =
    rate * totalKg +
    (template?.base_price ?? 0) +
    pricingConfig.sticker_surcharge * stickerCount;

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="font-display text-2xl text-cocoa mb-2">
        Review &amp; checkout
      </h1>
      <p className="text-cocoa/60 mb-4">{template?.name ?? "Custom cake"}</p>
      {/* "Ordered By" reads a little oddly here since nothing's been
          ordered yet -- this is the customer's own in-progress cart,
          not someone else reviewing a placed order. Flagging rather
          than silently hiding it: worth deciding whether checkout
          should suppress that section, or if generic copy is fine. */}
      <OrderSpecification blueprint={blueprint} />
      <CheckoutClient
        blueprintId={blueprint.id}
        estimatedPrice={estimatedPrice}
      />
    </main>
  );
}
