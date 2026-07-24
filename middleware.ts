import { NextRequest, NextResponse } from "next/server";

// Captures the real, browser-supplied Host header and forwards it
// downstream as a trusted request header. This is how every Server
// Component and Route Handler knows which bakery's domain the request
// actually came in on -- see lib/tenant.ts.
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-host", host);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
