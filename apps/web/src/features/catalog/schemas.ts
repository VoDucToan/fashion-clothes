import { z } from "zod";

/**
 * Parses the URL query string into typed filters.
 *
 * The URL is the source of truth for filter state — not React state. That is
 * what makes a filtered listing shareable, back-button-correct and indexable.
 */
export const productFiltersSchema = z.object({
  q: z.string().trim().min(1).optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  size: z.union([z.string(), z.array(z.string())]).optional(),
  color: z.union([z.string(), z.array(z.string())]).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "best-selling"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;
