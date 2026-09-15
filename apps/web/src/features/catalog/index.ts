/**
 * Public API of the catalog feature.
 *
 * Other features and app/ routes import from "@/features/catalog" only —
 * never from a path inside it. That boundary is what keeps the slices from
 * fusing into one ball of mud by week 4.
 */
export { catalogKeys, productDetailQuery, productListQuery } from "./api/queries";
export { productFiltersSchema, type ProductFilters } from "./schemas";
export type { Facets, ProductDetail, ProductListItem, Variant } from "./types";
