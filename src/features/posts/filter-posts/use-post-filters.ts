import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PostFilters {
  searchQuery: string;
  authorId: number | null;
  tag: string | null;
  page: number;
}

const DEBOUNCE_MS = 300;

export const usePostFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const filters: PostFilters = {
    searchQuery: searchParams.get('q') ?? '',
    authorId: searchParams.get('userId') ? Number(searchParams.get('userId')) : null,
    tag: searchParams.get('tag') ?? null,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };

  const commitSearch = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set('q', value);
        else next.delete('q');
        next.delete('page');
        return next;
      });
    },
    [setSearchParams],
  );

  const onSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (value.length >= 3 || value.length === 0) {
          commitSearch(value);
        }
      }, DEBOUNCE_MS);
    },
    [commitSearch],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const setFilters = useCallback(
    (updates: Partial<PostFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const shouldResetPage =
          'authorId' in updates || 'tag' in updates;

        if ('authorId' in updates) {
          if (updates.authorId != null) next.set('userId', String(updates.authorId));
          else next.delete('userId');
        }
        if ('tag' in updates) {
          if (updates.tag) next.set('tag', updates.tag);
          else next.delete('tag');
        }
        if ('page' in updates) {
          if (updates.page > 1) next.set('page', String(updates.page));
          else next.delete('page');
        }
        if (shouldResetPage) next.delete('page');

        return next;
      });
    },
    [setSearchParams],
  );

  return { filters, setFilters, localSearch, onSearchChange };
};
