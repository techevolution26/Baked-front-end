import { notFound } from "next/navigation";
import { Store, ChefHat, Sparkles } from "lucide-react";
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
    <div className="min-h-screen bg-stone-50/30 pb-12">
      {/* Storefront Header */}
      <div className="bg-white border-b border-stone-200 pt-10 pb-8 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Breadcrumb / Store Label */}
          <div className="flex items-center gap-2 text-xs font-bold text-berry uppercase tracking-wider mb-3">
            <Store className="w-3.5 h-3.5" />
            <span>{currentBakery.name}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-cocoa mb-2">
                {template.name}
              </h1>
              <p className="text-cocoa/60 max-w-xl text-sm leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-cocoa/40 mt-0.5 shrink-0" />
                {template.story ||
                  "Customize this signature design to make it your own."}
              </p>
            </div>

            {/* Trust Badge */}
            <div className="hidden md:flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-full border border-stone-100 text-xs font-medium text-cocoa/50">
              <ChefHat className="w-3.5 h-3.5" />
              <span>Baked fresh to order</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="max-w-5xl mx-auto p-4 md:p-6">
        <DesignPageClient template={template} pricingConfig={pricingConfig} />
      </main>
    </div>
  );
}
