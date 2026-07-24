import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";
import { extractBackendError } from "@/lib/proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const res = await fetch(`${API_URL}/blueprints`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await extractBackendError(res, "Could not save your design");
    return NextResponse.json({ error: message }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
