import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api-client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, an immediate refetch on the client throws away the
        // markup the server just rendered. 60s is enough to skip it.
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          // 4xx is our own bug or a real rejection — retrying just burns time.
          if (error instanceof ApiError && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // Server: always a fresh client, so requests never share a cache.
  if (isServer) return makeQueryClient();
  // Browser: one client, kept across renders and Suspense retries.
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
