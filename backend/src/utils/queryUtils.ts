import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export function getPaginationParams(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function getSortParams(req: Request, defaultField = 'createdAt'): SortParams {
  const field = (req.query.sortBy as string) || defaultField;
  const order = (req.query.sortOrder as 'asc' | 'desc') || 'desc';

  return { field, order };
}

export function getFilterParams(req: Request): FilterParams {
  const filters: FilterParams = {};
  const allowedFilters = ['status', 'customerName', 'whatsappNumber', 'orderDate'];

  for (const filter of allowedFilters) {
    if (req.query[filter]) {
      filters[filter] = req.query[filter];
    }
  }

  if (req.query.search) {
    filters.search = req.query.search;
  }

  return filters;
}
