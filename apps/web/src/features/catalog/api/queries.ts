import { queryOptions } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ProductFilters } from "@/features/catalog/schemas";
import type { Facets, ProductDetail, ProductListItem } from "@/features/catalog/types";
import type { Paginated } from "@/types/api";

export const catalogKeys = {
  all: ["catalog"] as const,
  list: (filters: ProductFilters) => [...catalogKeys.all, "list", filters] as const,
  detail: (slug: string) => [...catalogKeys.all, "detail", slug] as const,
};

function toSearchParams(filters: ProductFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined) continue;
    for (const entry of Array.isArray(value) ? value : [value]) {
      params.append(key, String(entry));
    }
  }
  return params.toString();
}

export const productListQuery = (filters: ProductFilters) =>
  queryOptions({
    queryKey: catalogKeys.list(filters),
    queryFn: () =>
      apiClient.get<Paginated<ProductListItem> & { facets: Facets }>(
        `/products?${toSearchParams(filters)}`,
      ),
  });

export const productDetailQuery = (slug: string) =>
  queryOptions({
    queryKey: catalogKeys.detail(slug),
    queryFn: () =>
      apiClient.get<ProductDetail>(`/products/${slug}`, {
        // ISR: rebuilt at most once a minute, or on demand via revalidateTag.
        next: { revalidate: 60, tags: [`product:${slug}`] },
      }),
  });
