import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/session";
import { getTenantHost } from "@/lib/tenant";
import { extractBackendError } from "@/lib/proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  const { username, password } = await request.json();
  const tenantHost = await getTenantHost();

  const registerRes = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Tenant-Host": tenantHost,
    },
    body: JSON.stringify({ username, password, role: "customer" }),
  });

  if (!registerRes.ok) {
    const message = await extractBackendError(registerRes, "Could not register");
    return NextResponse.json({ error: message }, { status: registerRes.status });
  }

  // auto-login right after registering so there's one less step
  const form = new URLSearchParams();
  form.set("username", username);
  form.set("password", password);

  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Tenant-Host": tenantHost,
    },
    body: form.toString(),
  });

  if (!loginRes.ok) {
    return NextResponse.json({ ok: true, autoLogin: false });
  }

  const data = await loginRes.json();
  const response = NextResponse.json({ ok: true, autoLogin: true });
  response.cookies.set(SESSION_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  return response;
}
