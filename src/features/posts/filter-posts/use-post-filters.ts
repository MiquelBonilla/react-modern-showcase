import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface PostFilters {
  searchQuery: string;
  authorId: number | null;
  tag: string | null;
  page: number;
}

export const usePostFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isUpdating = useRef(false);

  const filters: PostFilters = {
    searchQuery: searchParams.get('q') ?? '',
    authorId: searchParams.get('userId') ? Number(searchParams.get('userId')) : null,
    tag: searchParams.get('tag') ?? null,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  };

  const setFilters = useCallback(
    (updates: Partial<PostFilters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const shouldResetPage =
          'searchQuery' in updates || 'authorId' in updates || 'tag' in updates;

        if ('searchQuery' in updates) {
          if (updates.searchQuery) next.set('q', updates.searchQuery);
          else next.delete('q');
        }
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

  useEffect(() => {
    isUpdating.current = false;
  }, [searchParams]);

  return { filters, setFilters, isUpdating };
};
