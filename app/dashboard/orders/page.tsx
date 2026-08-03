import Link from "next/link";
import { getToken } from "@/lib/session";
import { fetchMyOrders } from "@/lib/api";

// 1. Centralized Status Configuration for Consistency
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  submitted: {
    label: "New Request",
    color: "bg-blue-50 text-blue-700 border-blue-100",
    icon: "⚡",
  },
  accepted: {
    label: "In Queue",
    color: "bg-amber-50 text-amber-700 border-amber-100",
    icon: "⏳",
  },
  baking: {
    label: "Baking",
    color: "bg-orange-50 text-orange-700 border-orange-100",
    icon: "🔥",
  },
  ready: {
    label: "Ready",
    color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: "📦",
  },
  delivered: {
    label: "Completed",
    color: "bg-cocoa/5 text-cocoa/60 border-cocoa/10",
    icon: "✅",
  },
  rejected: {
    label: "Cancelled",
    color: "bg-rose-50 text-rose-700 border-rose-100",
    icon: "✕",
  },
};

export default async function DashboardOrdersPage() {
  const token = await getToken();
  const orders = token ? await fetchMyOrders(token) : [];

  // 2. Business Logic: Calculate KPIs on the fly
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.order_status !== "rejected" ? o.price : 0),
    0,
  );
  const activeOrders = orders.filter((o) =>
    ["submitted", "accepted", "baking"].includes(o.order_status),
  ).length;
  const pendingActions = orders.filter(
    (o) => o.order_status === "submitted",
  ).length;

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-8">
      {/* KPI Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="col-span-2 md:col-span-1 p-5 bg-cocoa text-white rounded-2xl shadow-lg">
          <p className="text-cocoa-200 text-xs font-medium uppercase tracking-wider mb-1">
            Total Revenue
          </p>
          <p className="font-display text-3xl font-bold">
            KSh {totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="p-5 bg-white border border-cocoa/10 rounded-2xl shadow-sm">
          <p className="text-cocoa/40 text-xs font-bold uppercase tracking-wider mb-1">
            Active Kitchen
          </p>
          <p className="font-display text-3xl text-cocoa font-bold">
            {activeOrders}
          </p>
        </div>
        <div className="p-5 bg-white border border-cocoa/10 rounded-2xl shadow-sm">
          <p className="text-cocoa/40 text-xs font-bold uppercase tracking-wider mb-1">
            New Requests
          </p>
          <div className="flex items-center gap-2">
            <p className="font-display text-3xl text-cocoa font-bold">
              {pendingActions}
            </p>
            {pendingActions > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                Action Needed
              </span>
            )}
          </div>
        </div>
        <div className="p-5 bg-white border border-cocoa/10 rounded-2xl shadow-sm flex flex-col justify-center">
          <button className="w-full h-full border-2 border-dashed border-cocoa/10 rounded-xl text-cocoa/40 font-medium hover:border-berry hover:text-berry hover:bg-berry/5 transition-all flex items-center justify-center gap-2">
            <span>+</span> Manual Order
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div>
        <div className="flex items-end justify-between mb-4 px-1">
          <h1 className="font-display text-2xl text-cocoa font-bold">
            Recent Orders
          </h1>
          <span className="text-xs font-medium text-cocoa/40">
            Showing last {orders.length} transactions
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {orders.map((o) => {
            const status =
              STATUS_CONFIG[o.order_status] || STATUS_CONFIG.delivered;
            const isUrgent = o.order_status === "submitted";

            return (
              <Link
                key={o.id}
                href={`/dashboard/orders/${o.id}`}
                className={`group relative rounded-2xl bg-white p-1 transition-all duration-300
                  ${isUrgent ? "shadow-md ring-2 ring-blue-500/10 z-10" : "shadow-sm hover:shadow-md border border-cocoa/5"}
                `}
              >
                <div
                  className={`rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4
                   ${isUrgent ? "bg-blue-50/30" : "bg-white"}
                `}
                >
                  {/* Left: Identifier & Context */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border
                      ${isUrgent ? "bg-blue-100 text-blue-600 border-blue-200" : "bg-cocoa/5 text-cocoa/60 border-cocoa/5"}
                    `}
                    >
                      {status.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cocoa/50">
                          #{o.id.toString().slice(-4)}
                        </span>
                        {isUrgent && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="font-display font-semibold text-cocoa group-hover:text-berry transition-colors">
                        {/* {o.items_summary || "Custom Bakery Order"} */}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Status Badge */}
                  <div className="flex items-center sm:justify-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  {/* Right: Financials & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 min-w-[140px]">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-cocoa/30">
                        Total
                      </p>
                      <p className="text-berry font-bold font-mono">
                        KSh {o.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-cocoa/10 flex items-center justify-center text-cocoa/40 group-hover:border-berry group-hover:text-berry group-hover:bg-berry/5 transition-all">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {orders.length === 0 && (
            <div className="text-center py-16 bg-cocoa/[0.02] rounded-2xl border-2 border-dashed border-cocoa/5">
              <p className="text-4xl opacity-20 mb-2">📊</p>
              <p className="text-cocoa/40 font-medium">
                No orders recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
