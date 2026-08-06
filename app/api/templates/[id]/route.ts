import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";
import { extractBackendError } from "@/lib/proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// Handle PATCH requests for /api/templates/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Forward the request to your Python backend using PUT or PATCH
  const res = await fetch(`${API_URL}/templates/${id}`, {
    method: "PUT", // Change to "PATCH" if your Python backend route uses @router.patch
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await extractBackendError(res, "Could not update design");
    return NextResponse.json({ error: message }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
