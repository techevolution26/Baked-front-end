import { getToken } from "@/lib/session";
import { fetchMyBakery } from "@/lib/api";
import BakerySettingsForm from "@/components/BakerySettingsForm";

export default async function DashboardSettingsPage() {
  const token = await getToken();
  const bakery = token ? await fetchMyBakery(token) : null;

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-cocoa mb-6">Bakery settings</h1>
      {bakery ? (
        <BakerySettingsForm bakery={bakery} />
      ) : (
        <p className="text-cocoa/60">Could not load your bakery.</p>
      )}
    </div>
  );
}
