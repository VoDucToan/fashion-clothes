import {
  paginate,
  paginationQuerySchema,
  toSkipTake,
} from './pagination.dto.js';

describe('pagination', () => {
  it('applies defaults when the client sends nothing', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 });
  });

  it('rejects an oversized limit instead of running the query', () => {
    expect(paginationQuerySchema.safeParse({ limit: 5000 }).success).toBe(
      false,
    );
  });

  it('converts a page number into a Prisma skip/take', () => {
    expect(toSkipTake({ page: 3, limit: 20 })).toEqual({ skip: 40, take: 20 });
  });

  it('reports the number of pages', () => {
    expect(paginate([], 41, { page: 1, limit: 20 }).meta.totalPages).toBe(3);
  });
});
