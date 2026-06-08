import { useMemo } from 'react';
import { useMediaQuery } from '@shared/lib/use-media-query';

interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildPages(current: number, total: number, win: number): (number | '...')[] {
  if (total <= 1) return [1];

  const shown = new Set<number>([1, total, current]);
  for (let d = -win; d <= win; d++) {
    const p = current + d;
    if (p >= 1 && p <= total) shown.add(p);
  }

  const sorted = [...shown].sort((a, b) => a - b);
  const result: (number | '...')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) {
      result.push('...');
    }
  }
  return result;
}

export function Paginator({ currentPage, totalPages, onPageChange }: PaginatorProps) {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const windowSize = isMobile ? 0 : 2;

  const pages = useMemo(
    () => buildPages(currentPage, totalPages, windowSize),
    [currentPage, totalPages, windowSize],
  );

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-indigo-50 enabled:hover:text-indigo-700"
        aria-label="Previous page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 py-2 text-sm text-gray-400">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goTo(page)}
            aria-current={page === currentPage ? 'page' : undefined}
            className={
              page === currentPage
                ? 'min-w-9 rounded-lg bg-indigo-600 px-2 py-2 text-sm font-semibold text-white'
                : 'min-w-9 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700'
            }
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:bg-indigo-50 enabled:hover:text-indigo-700"
        aria-label="Next page"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </nav>
  );
}
