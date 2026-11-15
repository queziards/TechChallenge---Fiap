import type { PaginatedResponse, PaginationMeta } from '@/services/api';

export function getPaginatedList<T>(
  response: T[] | PaginatedResponse<T>,
  requestedPage: number,
  perPage: number
): PaginatedResponse<T> {
  if (!Array.isArray(response)) return response;

  const pageSize = Math.max(1, perPage);
  const lastPage = Math.max(1, Math.ceil(response.length / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), lastPage);
  const start = (currentPage - 1) * pageSize;
  const meta: PaginationMeta = {
    currentPage,
    lastPage,
    total: response.length,
    perPage: pageSize,
  };

  return {
    data: response.slice(start, start + pageSize),
    meta,
  };
}
