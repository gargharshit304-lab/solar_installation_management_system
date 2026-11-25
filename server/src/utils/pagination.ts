/**
 * Reusable Server-Side Pagination Utility for SolarOS
 * Standardizes page, pageSize, offset, search, sorting, and pagination metadata.
 */

export interface PaginationParams {
  page: number;
  pageSize: number;
  offset: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder: 'asc' | 'desc';
}

export interface PaginationResult {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function parsePaginationParams(
  query: Record<string, any>,
  defaultPageSize: number = 20
): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const rawSize = parseInt((query.pageSize || query.limit) as string, 10);
  // Allowed rows per page options: 10, 20, 50, 100 or positive integers up to 100
  const pageSize = Number.isInteger(rawSize) && rawSize > 0
    ? Math.min(100, rawSize)
    : defaultPageSize;
  const offset = (page - 1) * pageSize;
  const search = typeof query.search === 'string' && query.search.trim().length > 0
    ? query.search.trim()
    : undefined;
  const sortBy = typeof query.sortBy === 'string' ? query.sortBy.trim() : undefined;
  const sortOrder = query.sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return {
    page,
    pageSize,
    offset,
    limit: pageSize,
    search,
    sortBy,
    sortOrder
  };
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  totalRecords: number
): PaginationResult {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    page: safePage,
    pageSize,
    totalRecords,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1
  };
}
