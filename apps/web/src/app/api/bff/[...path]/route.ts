import { cookies } from "next/headers";
import { env } from "@/config/env";

/**
 * Thin pass-through to the NestJS API.
 *
 * Why this exists: the refresh token lives in an httpOnly + SameSite cookie,
 * so the browser will not attach it to a cross-origin request to the API. This
 * handler runs same-origin, reads the cookie, and forwards it.
 *
 * What does NOT belong here: Prisma queries, order creation, inventory locking,
 * VNPay IPN handling. The moment business logic lands in this file you have two
 * backends to keep in sync. Proxy only.
 */
async function proxy(request: Request, path: string[]) {
  const cookieStore = await cookies();
  const url = new URL(request.url);
  const target = `${env.server.API_URL}/${path.join("/")}${url.search}`;

  const response = await fetch(target, {
    method: request.method,
    headers: {
      "Content-Type": request.headers.get("content-type") ?? "application/json",
      cookie: cookieStore.toString(),
    },
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    // Required by undici whenever a streaming body is forwarded.
    duplex: "half",
    redirect: "manual",
  } as RequestInit & { duplex: "half" });

  // Pass Set-Cookie straight back so token rotation reaches the browser.
  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.delete("content-length");

  return new Response(response.body, { status: response.status, headers });
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: Request, { params }: Ctx) {
  return proxy(request, (await params).path);
}
export async function POST(request: Request, { params }: Ctx) {
  return proxy(request, (await params).path);
}
export async function PATCH(request: Request, { params }: Ctx) {
  return proxy(request, (await params).path);
}
export async function DELETE(request: Request, { params }: Ctx) {
  return proxy(request, (await params).path);
}
