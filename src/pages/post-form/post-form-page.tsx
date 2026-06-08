import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePostDetail } from '@entities/post';
import { useAuthStore } from '@features/auth';
import { useCreatePostFeature, useEditPostFeature } from '@features/posts';
import { LoadingSpinner } from '@shared/ui/loading-spinner';
import { ErrorState } from '@shared/ui/error-state';
import { ForbiddenState } from '@shared/ui/forbidden-state';
import i18n from '@shared/lib/i18n';

const postSchema = z.object({
  title: z
    .string()
    .min(3, i18n.t('posts.form.errors.titleMin'))
    .max(100, i18n.t('posts.form.errors.titleMax')),
  body: z.string().min(10, i18n.t('posts.form.errors.contentMin')),
  tags: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

export function PostFormPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const isEditMode = !!id;
  const currentUser = useAuthStore((s) => s.currentUser);
  const { t } = useTranslation();

  const { data: post, isLoading, error } = usePostDetail(isEditMode ? postId : 0);
  const { handleCreate, isLoading: isCreating, error: createError } = useCreatePostFeature();
  const {
    handleUpdate,
    isLoading: isUpdating,
    error: updateError,
    isForbidden,
  } = useEditPostFeature(isEditMode ? postId : 0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });

  useEffect(() => {
    if (isEditMode && post) {
      reset({
        title: post.title,
        body: post.body,
        tags: (post.tags ?? []).join(', '),
      });
    }
  }, [isEditMode, post, reset]);

  const onSubmit = async (data: PostFormData) => {
    const tags = (data.tags ?? '')
      .split(',')
      .map((tag) => tag.trim().replace(/^#/, ''))
      .filter(Boolean);

    if (isEditMode) {
      await handleUpdate({ title: data.title, body: data.body, tags });
    } else {
      if (!currentUser) {
        alert(t('posts.form.errors.unauthenticated'));
        return;
      }
      await handleCreate({
        title: data.title,
        body: data.body,
        tags,
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
      });
    }
  };

  if (isEditMode && isLoading) {
    return <LoadingSpinner message={t('posts.form.loading')} />;
  }

  if (isEditMode && error) {
    return <ErrorState message={t('posts.form.error')} onRetry={() => window.location.reload()} />;
  }

  if (isEditMode && isForbidden) {
    return <ForbiddenState message={t('posts.form.forbidden')} />;
  }

  const submitError = isEditMode ? updateError : createError;
  const isSubmitting = isEditMode ? isUpdating : isCreating;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEditMode ? t('posts.form.editTitle') : t('posts.form.newTitle')}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {submitError && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
            {t('posts.form.errors.saveFailed')}
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium uppercase tracking-wide text-gray-500"
            htmlFor="post-title"
          >
            {t('posts.form.titleLabel')}
          </label>
          <input
            id="post-title"
            {...register('title')}
            type="text"
            placeholder={t('posts.form.titlePlaceholder')}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          {errors.title && (
            <span className="text-xs text-red-500">{errors.title.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium uppercase tracking-wide text-gray-500"
            htmlFor="post-body"
          >
            {t('posts.form.contentLabel')}
          </label>
          <textarea
            id="post-body"
            {...register('body')}
            placeholder={t('posts.form.contentPlaceholder')}
            rows={6}
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          {errors.body && (
            <span className="text-xs text-red-500">{errors.body.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            className="text-xs font-medium uppercase tracking-wide text-gray-500"
            htmlFor="post-tags"
          >
            {t('posts.form.tagsLabel')}
          </label>
          <div className="relative flex items-center">
            <span
              className="pointer-events-none absolute left-3 text-sm font-semibold text-gray-500"
              aria-hidden="true"
            >
              #
            </span>
            <input
              id="post-tags"
              {...register('tags')}
              type="text"
              placeholder={t('posts.form.tagsPlaceholder')}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          <p className="text-xs text-gray-400">{t('posts.form.tagsHint')}</p>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-400">{t('posts.form.requiredHint')}</p>
          <div className="flex items-center gap-3">
            <Link to="/posts" className="text-sm font-medium text-gray-500 hover:text-gray-700">
              {t('posts.form.cancel')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? '...'
                : isEditMode
                  ? t('posts.form.saveChanges')
                  : t('posts.form.publish')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
