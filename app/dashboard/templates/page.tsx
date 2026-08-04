import Link from "next/link";
import { getToken } from "@/lib/session";
import { fetchMyBakery, fetchTemplates } from "@/lib/api";
import { Plus, Palette, Sparkles, Cake, ChevronRight } from "lucide-react";

export default async function DashboardTemplatesPage() {
  const token = await getToken();
  const bakery = token ? await fetchMyBakery(token) : null;
  const templates = bakery ? await fetchTemplates(bakery.id) : [];

  return (
    <div className="space-y-6">
      {/* Header Layer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-cocoa">
            Designs
          </h1>
          <p className="text-sm text-cocoa/60 mt-1">
            Manage your custom bakery products and base pricing.
          </p>
        </div>
        <Link
          href="/dashboard/templates/new"
          className="inline-flex items-center gap-2 rounded-xl bg-berry text-white font-medium px-4 py-2.5 text-sm shadow-sm shadow-berry/20 hover:bg-berry/90 transition-all hover:translate-y-[-1px] active:translate-y-0"
        >
          <Plus className="w-4 h-4" />
          <span>New design</span>
        </Link>
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/templates/${t.id}`}
            className="group rounded-2xl bg-white border border-stone-100 p-5 flex items-center justify-between shadow-sm hover:shadow-md hover:border-stone-200 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              {/* Decorative Icon Container */}
              <div className="p-3 bg-stone-50 rounded-xl text-cocoa/50 group-hover:bg-berry/5 group-hover:text-berry transition-colors">
                <Cake className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-medium text-cocoa group-hover:text-berry transition-colors">
                  {t.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center text-[11px] font-medium bg-stone-100 text-cocoa/60 px-2 py-0.5 rounded-md">
                    Template
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <p className="text-berry font-bold text-lg">
                KSh {t.base_price.toLocaleString()}
              </p>
              <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-cocoa group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {/* Styled Empty State */}
      {templates.length === 0 && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center bg-white/50">
          <div className="p-4 bg-stone-100 rounded-full text-cocoa/40 mb-4 animate-bounce">
            <Palette className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-medium text-cocoa">
            No designs added
          </h3>
          <p className="text-sm text-cocoa/60 max-w-sm mt-1 mb-6">
            Create reusable design catalogs with pricing options to show your
            customers.
          </p>
          <Link
            href="/dashboard/templates/new"
            className="inline-flex items-center gap-2 text-xs font-semibold text-berry bg-berry/5 px-4 py-2 rounded-xl hover:bg-berry/10 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Create your first design
          </Link>
        </div>
      )}
    </div>
  );
}
