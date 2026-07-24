import Link from "next/link";
import { getToken } from "@/lib/session";
import { fetchMyOrders } from "@/lib/api";

const STATUS_ICON: Record<string, string> = {
  submitted: "\u{1F4DD}",
  accepted: "\u2705",
  baking: "\u{1F382}",
  ready: "\u{1F381}",
  delivered: "\u{1F69A}",
  rejected: "\u26A0\uFE0F",
};

export default async function DashboardOrdersPage() {
  const token = await getToken();
  const orders = token ? await fetchMyOrders(token) : [];

  return (
    <div>
      <h1 className="font-display text-2xl text-cocoa mb-6">Orders</h1>
      <div className="flex flex-col gap-3">
        {orders.map((o) => (
          <Link
            key={o.id}
            href={`/dashboard/orders/${o.id}`}
            className="rounded-2xl bg-white shadow p-4 flex items-center justify-between hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{STATUS_ICON[o.order_status]}</span>
              <p className="font-display text-cocoa capitalize">{o.order_status}</p>
            </div>
            <p className="text-berry font-semibold">KSh {o.price.toLocaleString()}</p>
          </Link>
        ))}
        {orders.length === 0 && <p className="text-cocoa/60">No orders yet.</p>}
      </div>
    </div>
  );
}
