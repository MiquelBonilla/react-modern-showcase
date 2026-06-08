import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { formatMonthYear } from '@shared/lib/month-year';
import type { PostWithAuthor } from '@entities/post';

interface PostCardProps {
  post: PostWithAuthor;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      import('@pages/post-detail');
      queryClient.prefetchQuery({
        queryKey: ['posts', post.id],
        queryFn: () =>
          import('@entities/post').then((m) => m.getPostById(post.id)),
      });
    }, 150);
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <article
      className="flex cursor-pointer flex-col gap-3 rounded-xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
      style={{ animation: `fadeInUp 0.35s ease-out ${index * 60}ms both` }}
    >
      <Link
        to={`/posts/${post.id}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex flex-col gap-3 no-underline"
      >
        <div className="flex items-start justify-between gap-2">
          <h2 className="flex-1 text-base font-semibold leading-snug text-gray-900">
            {post.title}
          </h2>
          <span className="mt-0.5 shrink-0 text-xs font-medium text-gray-400">
            {formatMonthYear(post.createdAt)}
          </span>
        </div>

        <p className="line-clamp-2 text-sm text-gray-600">{post.body}</p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="size-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {post.author.name[0].toUpperCase()}
              </span>
            )}
            <span className="text-xs text-gray-500">{post.author.name}</span>
          </div>

          <div className="flex flex-wrap justify-end gap-1">
            {post.tags?.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
