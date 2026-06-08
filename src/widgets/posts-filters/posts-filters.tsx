import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@entities/user';
import { getTags } from '@entities/post';
import { usePostFilters } from '@features/posts';
import { useAuthStore } from '@features/auth';

export function PostsFilters() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { filters, setFilters } = usePostFilters();

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-search"
            className="text-xs font-medium uppercase tracking-wide text-gray-500"
          >
            Search
          </label>
          <input
            id="filter-search"
            type="search"
            value={filters.searchQuery}
            onChange={(e) => setFilters({ searchQuery: e.target.value })}
            placeholder="Search posts..."
            className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-author"
            className="text-xs font-medium uppercase tracking-wide text-gray-500"
          >
            Authors
          </label>
          <select
            id="filter-author"
            value={filters.authorId ?? ''}
            onChange={(e) =>
              setFilters({ authorId: e.target.value ? Number(e.target.value) : null })
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="filter-tag"
            className="text-xs font-medium uppercase tracking-wide text-gray-500"
          >
            Tags
          </label>
          <select
            id="filter-tag"
            value={filters.tag ?? ''}
            onChange={(e) => setFilters({ tag: e.target.value || null })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isAuthenticated && (
        <Link
          to="/posts/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:from-blue-800 hover:to-blue-600"
        >
          New Post
        </Link>
      )}
    </div>
  );
}
