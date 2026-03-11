import { useState, useMemo, useCallback } from 'react';
import { TableFilters } from '@/types';
import { debounce } from '@/lib/utils';

interface UseTableOptions {
  initialFilters?: Partial<TableFilters>;
  defaultLimit?: number;
}

export function useTable({ initialFilters = {}, defaultLimit = 10 }: UseTableOptions = {}) {
  const [filters, setFilters] = useState<TableFilters>({
    search: '', status: '', page: 1, limit: defaultLimit,
    sort: '-createdAt', ...initialFilters,
  });

  const setSearch = useCallback(
    debounce((search: string) => setFilters(f => ({ ...f, search, page: 1 })), 350),
    []
  );

  const setStatus  = (status: string)  => setFilters(f => ({ ...f, status, page: 1 }));
  const setPage    = (page: number)    => setFilters(f => ({ ...f, page }));
  const setSort    = (sort: string)    => setFilters(f => ({ ...f, sort, page: 1 }));
  const setFilter  = (k: keyof TableFilters, v: any) => setFilters(f => ({ ...f, [k]: v, page: 1 }));
  const resetFilters = () => setFilters({ search:'', status:'', page:1, limit: defaultLimit, sort:'-createdAt' });

  return { filters, setSearch, setStatus, setPage, setSort, setFilter, resetFilters };
}
