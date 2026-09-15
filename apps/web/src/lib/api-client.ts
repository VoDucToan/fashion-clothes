import { env } from "@/config/env";
import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiErrorBody,
  ) {
    super(body.message);
    this.name = "ApiError";
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  /** Next fetch cache options — only meaningful on the server. */
  next?: NextFetchRequestConfig;
};

/**
 * Single entry point to the NestJS API.
 *
 * On the server it talks to API_URL directly. In the browser it goes through
 * /api/bff so the refresh-token cookie stays httpOnly + SameSite and is never
 * readable by JS.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const isServer = typeof window === "undefined";
  const baseUrl = isServer ? env.server.API_URL : "/api/bff";

  const response = await fetch(`${baseUrl}${path}`, {
    ...rest,
    credentials: isServer ? undefined : "include",
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const fallback: ApiErrorBody = {
      statusCode: response.status,
      message: response.statusText,
    };
    const parsed = await response.json().catch(() => fallback);
    throw new ApiError(response.status, parsed);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
