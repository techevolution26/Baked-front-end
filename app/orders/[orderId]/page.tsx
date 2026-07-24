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

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="font-display text-2xl text-cocoa mb-2">Your order</h1>
      <p className="text-cocoa/60 mb-8">KSh {order.price.toLocaleString()}</p>
      <OrderStatusStepper status={order.order_status} />
    </main>
  );
}
