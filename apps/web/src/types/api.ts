/** Shape the NestJS API returns for paginated collections. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/** Error envelope thrown by ApiError — mirror this in the Nest exception filter. */
export type ApiErrorBody = {
  statusCode: number;
  message: string;
  /** Stable machine-readable code, e.g. "OUT_OF_STOCK" — switch on this, not on message. */
  code?: string;
};
