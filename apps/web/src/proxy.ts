import { NextResponse, type NextRequest } from "next/server";

/**
 * Renamed from middleware.ts — Next 16 deprecated that convention in favour of
 * proxy.ts, and the exported function must be named `proxy`.
 *
 * Cheap gate only: is there a session cookie at all?
 *
 * Real authorisation (is this user actually an ADMIN?) belongs in NestJS. Proxy
 * runs before every matched request — verifying a JWT here costs latency on
 * every navigation and still cannot be trusted as the last word.
 */
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("refresh_token");

  if (!hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/orders/:path*"],
};
