import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";
import { extractBackendError } from "@/lib/proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const token = await getToken();
  if (!token) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { orderId } = await params;
  const { status } = await request.json();

  const url = new URL(`${API_URL}/orders/${orderId}/status`);
  url.searchParams.set("new_status", status);

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const message = await extractBackendError(res, "Could not update status");
    return NextResponse.json({ error: message }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
