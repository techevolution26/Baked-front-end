import { notFound } from "next/navigation";
import { fetchBlueprintById, fetchTemplateById } from "@/lib/api";
import { getCurrentBakery } from "@/lib/tenant";
import CheckoutClient from "@/components/CheckoutClient";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ blueprintId: string }>;
}) {
  const { blueprintId } = await params;
  const blueprint = await fetchBlueprintById(blueprintId);
  if (!blueprint) notFound();

  // Same tenant-isolation guard as the design page.
  const currentBakery = await getCurrentBakery();
  if (!currentBakery || blueprint.bakery_id !== currentBakery.id) notFound();

  const template = blueprint.template_id ? await fetchTemplateById(blueprint.template_id) : null;

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="font-display text-2xl text-cocoa mb-2">Review &amp; checkout</h1>
      <p className="text-cocoa/60 mb-4">{template?.name ?? "Custom cake"}</p>
      <CheckoutClient blueprintId={blueprint.id} basePrice={template?.base_price ?? 0} />
    </main>
  );
}
