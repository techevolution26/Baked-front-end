import { getToken } from "@/lib/session";
import { fetchMyOrders } from "@/lib/api";
import { Clock, Flame, Smile, BoxIcon } from "lucide-react";

export default async function DashboardOverviewPage() {
  const token = await getToken();
  const orders = token ? await fetchMyOrders(token) : [];

  const submittedCount = orders.filter(
    (o) => o.order_status === "submitted",
  ).length;
  const bakingCount = orders.filter((o) => o.order_status === "baking").length;
  const readyCount = orders.filter((o) => o.order_status === "ready").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-cocoa">Overview</h1>
        <p className="text-sm text-cocoa/60 mt-1">
          Here is what is happening in your kitchen today.
        </p>
      </div>

      {/* Enhanced Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white border border-stone-100 p-6 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-cocoa/60">Pending orders</p>
            <p className="text-4xl font-display font-bold text-cocoa mt-2">
              {submittedCount}
            </p>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-100 p-6 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-cocoa/60">In the oven</p>
            <p className="text-4xl font-display font-bold text-berry mt-2">
              {bakingCount}
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600 animate-pulse">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-stone-100 p-6 flex justify-between items-start shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-medium text-cocoa/60">
              Ready for pickup
            </p>
            <p className="text-4xl font-display font-bold text-emerald-600 mt-2">
              {readyCount}
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Smile className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Styled Empty State */}
      {orders.length === 0 && (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-3xl p-12 text-center bg-white/50">
          <div className="p-4 bg-stone-100 rounded-full text-cocoa/40 mb-4">
            <BoxIcon className="w-8 h-8" />
          </div>
          <h3 className="font-display text-lg font-medium text-cocoa">
            No orders yet
          </h3>
          <p className="text-sm text-cocoa/60 max-w-sm mt-1">
            They will show up here automatically as soon as customers start
            placing orders.
          </p>
        </div>
      )}
    </div>
  );
}
