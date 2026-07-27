import { notFound, redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { fetchOrderById, fetchBlueprintById } from "@/lib/api";
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

  const blueprint = await fetchBlueprintById(order.blueprint_id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-cocoa mb-2">Order detail</h1>
        <p className="text-cocoa/60">KSh {order.price.toLocaleString()}</p>
      </div>
      {blueprint ? (
        <OrderSpecification blueprint={blueprint} />
      ) : (
        <p className="text-cocoa/60">
          Could not load the design specification.
        </p>
      )}
      <DashboardOrderActions
        orderId={order.id}
        currentStatus={order.order_status}
      />
    </div>
  );
}
