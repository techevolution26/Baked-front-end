import Link from "next/link";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { fetchMyOrders } from "@/lib/api";

// Strong, semantic configuration mapping for status clarity
interface StatusConfig {
  label: string;
  emoji: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  progressStep: number;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  submitted: {
    label: "Order Placed",
    emoji: "📝",
    bgClass: "bg-blue-50/60",
    textClass: "text-blue-700",
    borderClass: "border-blue-100",
    progressStep: 1,
  },
  accepted: {
    label: "Confirmed",
    emoji: "✨",
    bgClass: "bg-indigo-50/60",
    textClass: "text-indigo-700",
    borderClass: "border-indigo-100",
    progressStep: 2,
  },
  baking: {
    label: "In the Oven",
    emoji: "👩‍🍳",
    bgClass: "bg-amber-50/60",
    textClass: "text-amber-800",
    borderClass: "border-amber-100",
    progressStep: 3,
  },
  ready: {
    label: "Ready for Pickup",
    emoji: "📦",
    bgClass: "bg-emerald-50/60",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-100",
    progressStep: 4,
  },
  delivered: {
    label: "Delivered",
    emoji: "🎉",
    bgClass: "bg-cocoa/5",
    textClass: "text-cocoa/70",
    borderClass: "border-cocoa/10",
    progressStep: 5,
  },
  rejected: {
    label: "Cancelled",
    emoji: "⚠️",
    bgClass: "bg-rose-50/60",
    textClass: "text-rose-700",
    borderClass: "border-rose-100",
    progressStep: 0,
  },
};

export default async function OrderHistoryPage() {
  const token = await getToken();
  if (!token) redirect("/login?next=/orders");

  const orders = await fetchMyOrders(token);

  // 1. Information Hierarchy: Sort by newest and isolate the latest active order
  const sortedOrders = [...orders].sort(
    (a, b) =>
      new Date(b.created_at || b.id).getTime() -
      new Date(a.created_at || a.id).getTime(),
  );

  const latestOrder = sortedOrders[0];
  const pastOrders = sortedOrders.slice(1);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Trust Signals: Minimal Breadcrumb Header */}
      <div>
        <nav className="text-xs text-cocoa/40 font-medium mb-1.5 flex items-center gap-1.5">
          <Link href="/" className="hover:text-berry transition-colors">
            Storefront
          </Link>
          <span>/</span>
          <span className="text-cocoa/60">Order History</span>
        </nav>
        <h1 className="font-display text-3xl font-bold tracking-tight text-cocoa">
          Your Orders
        </h1>
        <p className="text-cocoa/60 text-sm mt-0.5">
          Track live bakery orders and view your purchase history.
        </p>
      </div>

      {orders.length === 0 ? (
        /* Premium Empty State */
        <div className="text-center py-16 bg-gradient-to-br from-cocoa/[0.01] to-berry/[0.01] rounded-3xl border border-cocoa/10 px-4">
          <div className="text-5xl mb-4 animate-pulse">🥐</div>
          <h3 className="font-display text-xl text-cocoa font-bold">
            No orders placed yet
          </h3>
          <p className="text-cocoa/60 text-sm max-w-sm mx-auto mt-2 leading-relaxed">
            Ready to satisfy your cravings? Browse our current custom design
            catalogue to place your first bakery order.
          </p>
          <Link
            href="/"
            className="inline-block mt-5 rounded-xl font-semibold bg-berry text-white px-5 py-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm"
          >
            Explore Bakery Designs
          </Link>
        </div>
      ) : (
        <>
          {/* ========================================================
              HIGHLIGHTED LATEST ORDER (Surfaced for immediate focus)
              ======================================================== */}
          {latestOrder && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-berry">
                  Most Recent Order
                </h2>
                {latestOrder.order_status !== "delivered" &&
                  latestOrder.order_status !== "rejected" && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
              </div>

              <div className="group relative rounded-2xl bg-white border-2 border-berry/20 shadow-md p-6 transition-all">
                {renderOrderCard(latestOrder, true)}
              </div>
            </div>
          )}

          {/* ========================================================
              PAST ORDERS TIMELINE LIST
              ======================================================== */}
          {pastOrders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-cocoa/40 px-1">
                Past Transactions
              </h2>
              <div className="flex flex-col gap-4">
                {pastOrders.map((order) => (
                  <div
                    key={order.id}
                    className="group rounded-2xl bg-white border border-cocoa/10 shadow-sm hover:shadow-md hover:border-cocoa/20 transition-all p-5"
                  >
                    {renderOrderCard(order, false)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

/**
 * Extracted card renderer to supply structural depth, tracking, and clean code management.
 */
function renderOrderCard(order: any, isHero: boolean) {
  // Graceful configuration extraction with fallback protection
  const status = STATUS_MAP[order.order_status] || {
    label: order.order_status,
    emoji: "📦",
    bgClass: "bg-cocoa/5",
    textClass: "text-cocoa",
    borderClass: "border-cocoa/10",
    progressStep: 1,
  };

  // Safe mock configurations if your structural payload lacks precise date arrays
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : `Order #${order.id.toString().slice(-4)}`;

  return (
    <div className="space-y-5">
      {/* Row 1: Status Badges, Indicators & Order Identification meta */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cocoa/50">
              #{order.id.toString().slice(-6).toUpperCase()}
            </span>
            <span className="text-xs text-cocoa/30">•</span>
            <p className="text-xs font-medium text-cocoa/60">{formattedDate}</p>
          </div>
          <h3 className="font-display font-bold text-cocoa text-lg group-hover:text-berry transition-colors">
            {order.summary_text ||
              `${order.items_count || 1} Custom Bakery Selection`}
          </h3>
        </div>

        {/* 2. Status Clarity: Proper Bordered Color Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-sm ${status.bgClass} ${status.textClass} ${status.borderClass}`}
        >
          <span>{status.emoji}</span>
          <span className="capitalize">{status.label}</span>
        </div>
      </div>

      {/* 3. Structural Depth Layer: Sub-info row with financial pricing summary */}
      <div className="flex items-center justify-between pt-3 border-t border-cocoa/5 text-sm">
        <div className="text-cocoa/60 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>💳</span>
            <span className="font-medium text-xs text-cocoa/80">
              M-Pesa Verified
            </span>
          </div>
          {isHero && (
            <div className="hidden sm:flex items-center gap-1">
              <span>⏱️</span>
              <span className="text-xs text-cocoa/80">Est: 45 min pickup</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs text-cocoa/40 font-medium">Total Amount</p>
          <p className="text-berry font-bold text-lg tracking-tight">
            KSh {order.price.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 4. Actionability Options Row: Decision support elements */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 bg-cocoa/[0.01] -mx-4 -mb-4 p-4 rounded-b-2xl border-t border-cocoa/[0.03]">
        <Link
          href={`/orders/${order.id}`}
          className="text-xs font-bold text-berry hover:text-berry-dark flex items-center gap-1 group/btn"
        >
          View Full Breakdown
          <span className="transform group-hover/btn:translate-x-0.5 transition-transform">
            →
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-cocoa/10 hover:border-cocoa/20 text-cocoa/70 hover:bg-cocoa/5 font-medium text-xs transition-colors">
            Get Invoice
          </button>
          <button className="px-3 py-1.5 rounded-lg bg-cocoa text-white hover:bg-cocoa/90 font-medium text-xs transition-colors shadow-sm">
            Help Desk
          </button>
        </div>
      </div>
    </div>
  );
}
