import { useInfiniteComments, getUsers } from '@entities/comment';
import { useQuery } from '@tanstack/react-query';
import { useIntersectionObserver } from '@shared/lib/use-intersection-observer';
import type { CommentWithAuthor } from '@entities/comment';

export const useInfiniteCommentsFeature = (postId: number) => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteComments(postId);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const userMap = new Map(users.map((u) => ({ id: u.id, name: u.name, avatar: u.avatar })).map((u) => [u.id, u]));

  const comments: CommentWithAuthor[] = (data?.pages ?? []).flatMap((page) =>
    page.map((c) => ({
      ...c,
      author: userMap.get(c.userId) ?? { id: c.userId, name: 'Unknown' },
    })),
  );

  const sentinelRef = useIntersectionObserver(
    () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    { enabled: hasNextPage && !isFetchingNextPage },
  );

  return {
    comments,
    sentinelRef,
    isLoading,
    isFetchingNextPage,
    error,
    hasMore: hasNextPage ?? false,
  };
};
