import { notFound, redirect } from "next/navigation";
import { getToken } from "@/lib/session";
import { fetchOrderById } from "@/lib/api";
import DashboardOrderActions from "@/components/DashboardOrderActions";

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

  return (
    <div>
      <h1 className="font-display text-2xl text-cocoa mb-2">Order detail</h1>
      <p className="text-cocoa/60 mb-6">KSh {order.price.toLocaleString()}</p>
      <DashboardOrderActions orderId={order.id} currentStatus={order.order_status} />
    </div>
  );
}
