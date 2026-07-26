import { NextResponse } from "next/server";
import { getToken } from "@/lib/session";
import { extractBackendError } from "@/lib/proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const token = await getToken();
  if (!token)
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const formData = await request.formData();
  const res = await fetch(`${API_URL}/uploads/images`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    const message = await extractBackendError(res, "Could not upload image");
    return NextResponse.json({ error: message }, { status: res.status });
  }

  return NextResponse.json(await res.json());
}
