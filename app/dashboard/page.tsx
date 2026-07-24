import { getToken } from "@/lib/session";
import { fetchMyOrders } from "@/lib/api";

export default async function DashboardOverviewPage() {
  const token = await getToken();
  const orders = token ? await fetchMyOrders(token) : [];

  const stats = [
    { label: "Pending orders", value: orders.filter((o) => o.order_status === "submitted").length },
    { label: "In the oven", value: orders.filter((o) => o.order_status === "baking").length },
    { label: "Ready for pickup", value: orders.filter((o) => o.order_status === "ready").length },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-cocoa mb-6">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white shadow p-5">
            <p className="text-3xl font-display text-berry">{s.value}</p>
            <p className="text-sm text-cocoa/60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {orders.length === 0 && (
        <p className="text-cocoa/60 mt-6">No orders yet -- they'll show up here as customers order.</p>
      )}
    </div>
  );
}
