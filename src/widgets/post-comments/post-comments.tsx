import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@features/auth';
import {
  useInfiniteCommentsFeature,
  useAddComment,
  useEditComment,
  useDeleteComment,
} from '@features/comments';
import { LoadingSpinner } from '@shared/ui/loading-spinner';
import type { CommentWithAuthor } from '@entities/comment';

interface PostCommentsProps {
  postId: number;
}

interface CommentFormData {
  body: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { comments, sentinelRef, isLoading, isFetchingNextPage, hasMore } =
    useInfiniteCommentsFeature(postId);
  const { handleAdd, isLoading: isAdding } = useAddComment(postId);
  const { handleEdit } = useEditComment(postId);
  const { handleDelete } = useDeleteComment(postId);
  const { t } = useTranslation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(
      z.object({
        body: z.string().min(5, t('comments.errors.minLength')),
      }),
    ),
  });

  const onSubmitNew = async (data: CommentFormData) => {
    await handleAdd(data.body);
    reset();
  };

  const onStartEdit = (comment: CommentWithAuthor) => {
    setEditingId(comment.id);
    setEditBody(comment.body);
  };

  const onCancelEdit = () => {
    setEditingId(null);
    setEditBody('');
  };

  const onSaveEdit = async (commentId: number) => {
    if (editBody.trim().length < 5) return;
    await handleEdit(commentId, editBody);
    setEditingId(null);
    setEditBody('');
  };

  if (isLoading) {
    return <LoadingSpinner message={t('posts.detail.loadingComments')} />;
  }

  return (
    <div className="space-y-6">
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400">{t('comments.empty')}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {comment.author.avatar ? (
                    <img
                      src={comment.author.avatar}
                      alt={comment.author.name}
                      className="size-7 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                      {comment.author.name[0].toUpperCase()}
                    </span>
                  )}
                  <span className="text-sm font-medium text-gray-700">
                    {comment.author.name}
                  </span>
                </div>

                {currentUser?.id === comment.userId && (
                  <div className="flex items-center gap-1">
                    {editingId === comment.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onSaveEdit(comment.id)}
                          className="rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          {t('comments.saveChanges')}
                        </button>
                        <button
                          type="button"
                          onClick={onCancelEdit}
                          className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100"
                        >
                          {t('comments.cancelEdit')}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onStartEdit(comment)}
                          className="rounded px-2 py-1 text-xs font-medium text-indigo-500 hover:bg-indigo-50"
                          aria-label={t('comments.editAria')}
                        >
                          {t('comments.edit')}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className="rounded px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                          aria-label={t('comments.deleteAria')}
                        >
                          {t('comments.delete')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingId === comment.id ? (
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  placeholder={t('comments.editPlaceholder')}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{comment.body}</p>
              )}

              {comment.createdAt && (
                <time className="mt-1 block text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              )}
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="h-4 w-full" />
      )}

      {isFetchingNextPage && <LoadingSpinner message={t('comments.loadingMore')} />}

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          {t('comments.add')}
        </h3>

        <form onSubmit={handleSubmit(onSubmitNew)} className="mt-3 space-y-3">
          <div className="flex flex-col gap-1">
            <textarea
              {...register('body')}
              placeholder={t('comments.placeholder')}
              rows={3}
              className="w-full resize-none rounded-lg bg-slate-100 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
            />
            {errors.body && (
              <span className="text-xs text-red-500">{errors.body.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isAdding}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdding ? t('comments.publishing') : t('comments.publish')}
          </button>
        </form>
      </div>
    </div>
  );
}
