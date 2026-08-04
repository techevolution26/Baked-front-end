import { notFound } from "next/navigation";
import { fetchTemplateById, fetchPricingConfig } from "@/lib/api";
import { getCurrentBakery } from "@/lib/tenant";
import DesignPageClient from "@/components/DesignPageClient";

export default async function DesignPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const template = await fetchTemplateById(templateId);
  if (!template) notFound();

  const currentBakery = await getCurrentBakery();
  if (!currentBakery || template.bakery_id !== currentBakery.id) notFound();

  const pricingConfig = await fetchPricingConfig();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="font-display text-2xl text-cocoa">{template.name}</h1>
      <p className="text-cocoa/60 mb-4">{currentBakery.name}</p>
      <DesignPageClient template={template} pricingConfig={pricingConfig} />
    </main>
  );
}
