import { notFound, redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { getTenantHost } from "@/lib/tenant";
import {
  fetchOrderById,
  fetchBlueprintById,
  fetchTemplateById,
} from "@/lib/api";
import DashboardOrderActions from "@/components/DashboardOrderActions";
import OrderSpecification from "@/components/OrderSpecification";

export default async function DashboardOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const token = await getToken();
  if (!token) redirect(`/login?next=/dashboard/orders/${orderId}`);

  const order = await fetchOrderById(orderId, token);
  if (!order) notFound();
  const tenantHost = await getTenantHost();
  const blueprint = await fetchBlueprintById(order.blueprint_id, token, tenantHost);
  const template = blueprint?.template_id
    ? await fetchTemplateById(blueprint.template_id)
    : null;

  return (
    <div className="max-w-4xl mx-auto p-2 flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl text-cocoa mb-1">Order detail</h1>
        <p className="text-cocoa/60">
          {template?.name ?? "Custom cake"} &middot; KSh{" "}
          {order.price.toLocaleString()}
        </p>
      </div>

      {blueprint ? (
        <OrderSpecification
          blueprint={blueprint}
          customerName={order.customer_username ?? "Bakery Customer"}
        />
      ) : (
        <p className="text-cocoa/60 italic">
          Could not load the design specifications.
        </p>
      )}

      {template?.story && (
        <div className="rounded-2xl bg-cocoa/5 p-5 border border-cocoa/10">
          <p className="text-xs text-cocoa/50 uppercase tracking-wide font-semibold mb-1.5">
            About this recipe design
          </p>
          <p className="text-sm text-cocoa/80 leading-relaxed italic">
            &ldquo;{template.story}&rdquo;
          </p>
        </div>
      )}

      <DashboardOrderActions
        orderId={order.id}
        currentStatus={order.order_status}
      />
    </div>
  );
}
