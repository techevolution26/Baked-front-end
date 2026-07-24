import Link from "next/link";
import { getToken } from "@/lib/session";
import { fetchMyBakery, fetchTemplates } from "@/lib/api";

export default async function DashboardTemplatesPage() {
  const token = await getToken();
  const bakery = token ? await fetchMyBakery(token) : null;
  const templates = bakery ? await fetchTemplates(bakery.id) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-cocoa">Designs</h1>
        <Link
          href="/dashboard/templates/new"
          className="rounded-xl bg-berry text-white font-display px-4 py-2 text-sm"
        >
          + New design
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {templates.map((t) => (
          <div key={t.id} className="rounded-2xl bg-white shadow p-4 flex items-center justify-between">
            <p className="font-display text-cocoa">{t.name}</p>
            <p className="text-berry font-semibold">KSh {t.base_price.toLocaleString()}</p>
          </div>
        ))}
        {templates.length === 0 && (
          <p className="text-cocoa/60">No designs yet -- create your first one.</p>
        )}
      </div>
    </div>
  );
}
