import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { usePostDetail } from '@entities/post';
import { getUsers } from '@entities/user';
import { useAuthStore } from '@features/auth';
import { useDeletePostFeature } from '@features/posts';
import { LoadingSpinner } from '@shared/ui/loading-spinner';
import { ErrorState } from '@shared/ui/error-state';
import { formatMonthYear } from '@shared/lib/month-year';
import type { PostWithAuthor } from '@entities/post';

const PostComments = lazy(() =>
  import('@widgets/post-comments').then((m) => ({ default: m.PostComments })),
);

export function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const postId = Number(id);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { handleDelete } = useDeletePostFeature();

  const { data: post, isLoading, error } = usePostDetail(postId);

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const postWithAuthor: PostWithAuthor | null = post
    ? {
        ...post,
        author: {
          id: post.userId,
          name: userMap.get(post.userId)?.name ?? 'Unknown',
          avatar: userMap.get(post.userId)?.avatar,
        },
      }
    : null;

  const isOwner = currentUser?.id === postWithAuthor?.userId;

  const [showComments, setShowComments] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!commentsRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowComments(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(commentsRef.current);
    return () => observer.disconnect();
  }, []);

  const onDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    await handleDelete(postId);
    navigate('/posts');
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading post..." />;
  }

  if (error || !postWithAuthor) {
    return <ErrorState message="Failed to load post" onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="grid grid-cols-2 items-center gap-x-6 gap-y-3 sm:grid-cols-[1fr_auto_auto]">
        <h1 className="col-span-2 text-2xl font-bold leading-snug text-gray-900 sm:col-span-1 sm:text-3xl">
          {postWithAuthor.title}
        </h1>

        <div className="flex items-center gap-3">
          {postWithAuthor.author.avatar ? (
            <img
              src={postWithAuthor.author.avatar}
              alt={postWithAuthor.author.name}
              className="size-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              {postWithAuthor.author.name[0].toUpperCase()}
            </span>
          )}
          <div className="flex flex-col sm:items-end">
            <span className="text-sm font-medium text-gray-800">
              {postWithAuthor.author.name}
            </span>
            <span className="text-xs text-gray-400">
              {formatMonthYear(postWithAuthor.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          {isOwner && (
            <>
              <Link
                to={`/posts/${postId}/edit`}
                className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                Edit
              </Link>
              <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-200"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-base leading-relaxed text-gray-700">{postWithAuthor.body}</p>

      {postWithAuthor.tags && postWithAuthor.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {postWithAuthor.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Comments</h2>

        <div ref={commentsRef}>
          {showComments ? (
            <Suspense fallback={<LoadingSpinner message="Loading comments..." />}>
              <PostComments postId={postId} />
            </Suspense>
          ) : (
            <div className="h-40 animate-pulse rounded-xl bg-gray-100 mt-4" />
          )}
        </div>
      </section>
    </div>
  );
}
