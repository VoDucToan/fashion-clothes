import { z } from 'zod';

/**
 * Shared page/limit contract. Every list endpoint reuses this instead of
 * inventing its own parameter names, and the `.max(100)` stops a client from
 * asking for 50k rows in one query.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface Paginated<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  query: PaginationQuery,
): Paginated<T> {
  return {
    items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}

/** Prisma expects an offset; keep the conversion in one place. */
export function toSkipTake(query: PaginationQuery): {
  skip: number;
  take: number;
} {
  return { skip: (query.page - 1) * query.limit, take: query.limit };
}
