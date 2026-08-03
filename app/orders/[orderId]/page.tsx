import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { fetchOrderById } from "@/lib/api";
import OrderStatusStepper from "@/components/OrderStatusStepper";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const token = await getToken();
  if (!token) redirect(`/login?next=/orders/${orderId}`);

  const order = await fetchOrderById(orderId, token);
  if (!order) notFound();

  // Safely evaluate timestamps or present local dates
  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString("en-KE", {
        dateStyle: "long",
        timeStyle: "short",
      })
    : "Just now";

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      {/* 1. Header Section with Reassurance Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-cocoa/10 pb-6 gap-4">
        <div className="space-y-1">
          <nav className="text-xs text-cocoa/40 font-medium flex items-center gap-1.5">
            <Link href="/orders" className="hover:text-berry transition-colors">
              My Orders
            </Link>
            <span>/</span>
            <span className="text-cocoa/60">
              #{orderId.slice(-6).toUpperCase()}
            </span>
          </nav>
          <h1 className="font-display text-3xl font-bold tracking-tight text-cocoa">
            Track Order Details
          </h1>
          <p className="text-xs text-cocoa/50 font-medium">
            Placed on {formattedDate}
          </p>
        </div>

        {/* Dynamic Trust Alert Banner */}
        <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl px-4 py-3 flex items-center gap-2.5 max-w-sm">
          <span className="text-xl">🧁</span>
          <div className="text-xs">
            <p className="font-bold">Bakeries preparing your order</p>
            <p className="text-emerald-700/80 font-medium">
              Estimated ready window: 45-60 mins
            </p>
          </div>
        </div>
      </div>

      {/* 2. Isolated Progress Tracking Card */}
      <section className="bg-white border border-cocoa/10 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-cocoa/5 pb-3">
          <h2 className="text-xs font-bold text-cocoa/40 uppercase tracking-wider">
            Live Processing Steps
          </h2>
          <span className="text-xs font-semibold text-berry bg-berry/5 px-2.5 py-1 rounded-md">
            Status: {order.order_status}
          </span>
        </div>
        <OrderStatusStepper status={order.order_status} />
      </section>

      {/* 3. Deep Order Item Summary Card */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border border-cocoa/10 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-cocoa/40 uppercase tracking-wider border-b border-cocoa/5 pb-2">
            Itemized Invoice Summary
          </h2>

          {/* Detailed Item Layout Block */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm py-1">
              <div className="flex gap-3">
                <span className="w-8 h-8 rounded-lg bg-cocoa/5 flex items-center justify-center font-bold text-cocoa text-xs">
                  1x
                </span>
                <div>
                  <p className="font-semibold text-cocoa">
                    {/* {order.summary_text || "Custom Design Cake Selection"} */}
                  </p>
                  <p className="text-xs text-cocoa/50">
                    Multi-layered Custom Fondant Configuration
                  </p>
                </div>
              </div>
              <p className="font-mono font-bold text-cocoa">
                KSh {order.price.toLocaleString()}
              </p>
            </div>

            {/* Financial breakdown totals stack */}
            <div className="border-t border-cocoa/5 pt-3 space-y-2 text-xs font-medium text-cocoa/60">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>KSh {order.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Value Added Tax (VAT)</span>
                <span>Included</span>
              </div>
              <div className="flex justify-between text-cocoa font-bold text-sm pt-1 border-t border-dashed border-cocoa/10">
                <span>Total Settled Amount</span>
                <span className="text-berry text-base font-display">
                  KSh {order.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Trust & Fulfillment Meta Block */}
        <div className="bg-white border border-cocoa/10 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold text-cocoa/40 uppercase tracking-wider mb-2">
                Fulfillment Method
              </h2>
              <div className="flex items-start gap-2.5 text-xs">
                <span className="text-lg">🏪</span>
                <div>
                  <p className="font-bold text-cocoa">
                    In-Store Counter Pickup
                  </p>
                  <p className="text-cocoa/60 mt-0.5 leading-relaxed">
                    Main Branch Counter, Nairobi, Kenya.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-bold text-cocoa/40 uppercase tracking-wider mb-2">
                Payment Assurance
              </h2>
              <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl">
                <span className="font-bold">M-PESA</span>
                <div className="font-medium">
                  <p className="font-bold">Transaction Secured</p>
                  <p className="opacity-80 text-[10px]">
                    Reference code verified successfully
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. What Now? Contextual Action Trigger Stack */}
          <div className="space-y-2 pt-4 border-t border-cocoa/5">
            <button className="w-full py-2.5 bg-cocoa text-white hover:bg-cocoa/90 rounded-xl font-semibold text-xs shadow-sm transition-all text-center">
              📞 Direct Line to Baker
            </button>
            <button className="w-full py-2.5 bg-white border border-cocoa/10 hover:bg-cocoa/5 text-cocoa/70 rounded-xl font-medium text-xs transition-all text-center">
              📄 Download Receipt PDF
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
