import { notFound } from "next/navigation";
import { fetchTemplateById } from "@/lib/api";
import { getCurrentBakery } from "@/lib/tenant";
import TemplateEditor from "@/components/TemplateEditor"; // The refactored client component below

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await fetchTemplateById(id);
  if (!template) notFound();

  const currentBakery = await getCurrentBakery();
  if (!currentBakery || template.bakery_id !== currentBakery.id) notFound();

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <TemplateEditor existingTemplate={template} />
    </div>
  );
}
