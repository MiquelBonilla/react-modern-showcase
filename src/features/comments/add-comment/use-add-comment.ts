import { useQueryClient } from '@tanstack/react-query';
import { useCreateComment, commentKeys } from '@entities/comment';
import { useAuthStore } from '@features/auth';
import type { Comment } from '@entities/comment';

export const useAddComment = (postId: number) => {
  const qc = useQueryClient();
  const currentUser = useAuthStore((s) => s.currentUser);
  const mutation = useCreateComment();

  const handleAdd = async (body: string) => {
    if (!currentUser) throw new Error('Not authenticated');

    const tempId = -Date.now();
    const tempComment: Comment = {
      id: tempId,
      body,
      postId,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };

    qc.setQueryData(commentKeys.commentsKey(postId), (old: unknown) => {
      if (!old) return old;
      const data = old as { pages: { comments: Comment[] }[] };
      return {
        ...data,
        pages: data.pages.map((page, i) =>
          i === 0 ? { ...page, comments: [...page.comments, tempComment] } : page,
        ),
      };
    });

    try {
      await mutation.mutateAsync({
        body,
        postId,
        userId: currentUser.id,
        createdAt: tempComment.createdAt,
      });
    } catch {
      qc.setQueryData(commentKeys.commentsKey(postId), (old: unknown) => {
        if (!old) return old;
        const data = old as { pages: { comments: Comment[] }[] };
        return {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            comments: page.comments.filter((c) => c.id !== tempId),
          })),
        };
      });
    }
  };

  return { handleAdd, isLoading: mutation.isPending };
};
