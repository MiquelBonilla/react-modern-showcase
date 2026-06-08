import { useQuery } from '@tanstack/react-query';
import { usePostsPage, useTags } from '@entities/post';
import { getUsers } from '@entities/user';
import { usePostFilters } from '@features/posts';
import { PostsFilters } from '@widgets/posts-filters';
import { PostCard } from '@widgets/post-card';
import { Paginator } from '@widgets/posts-paginator';
import { LoadingSpinner } from '@shared/ui/loading-spinner';
import { EmptyState } from '@shared/ui/empty-state';
import { ErrorState } from '@shared/ui/error-state';
import type { PostWithAuthor } from '@entities/post';

const PAGE_SIZE = 9;

export function PostsListPage() {
  const { filters, setFilters } = usePostFilters();

  const { data: postsData, isLoading, error } = usePostsPage({
    page: filters.page,
    limit: PAGE_SIZE,
    userId: filters.authorId ?? undefined,
    tag: filters.tag ?? undefined,
    query: filters.searchQuery || undefined,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const { data: tags = [] } = useTags();

  const userMap = new Map(users.map((u) => [u.id, u]));

  const postsWithAuthor: PostWithAuthor[] = (postsData?.posts ?? []).map((post) => {
    const user = userMap.get(post.userId);
    return {
      ...post,
      author: {
        id: post.userId,
        name: user?.name ?? 'Unknown',
        avatar: user?.avatar,
      },
    };
  });

  const totalPages = Math.ceil((postsData?.total ?? 0) / PAGE_SIZE);
  const shownCount = Math.min(filters.page * PAGE_SIZE, postsData?.total ?? 0);

  if (isLoading) {
    return <LoadingSpinner message="Loading posts..." />;
  }

  if (error) {
    return <ErrorState message="Failed to load posts" onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Posts</h1>

      <PostsFilters />

      {postsData && postsData.total > 0 && (
        <p className="text-sm text-gray-500">
          Showing <span className="font-medium text-gray-700">{shownCount}</span> of{' '}
          <span className="font-medium text-gray-700">{postsData.total}</span> results
        </p>
      )}

      {postsWithAuthor.length === 0 ? (
        <EmptyState message="No posts found" />
      ) : (
        <div className="transition-opacity duration-150">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {postsWithAuthor.map((post, index) => (
              <li key={post.id}>
                <PostCard post={post} index={index} />
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="mt-6">
              <Paginator
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={(page) => setFilters({ page })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
