import { useQueryClient } from '@tanstack/react-query';
import { useDeleteComment as useDeleteCommentMutation, commentKeys } from '@entities/comment';
import type { Comment } from '@entities/comment';

export const useDeleteComment = (postId: number) => {
  const qc = useQueryClient();
  const mutation = useDeleteCommentMutation();

  const handleDelete = async (id: number) => {
    let backup: { page: number; comment: Comment } | null = null;

    qc.setQueryData(commentKeys.commentsKey(postId), (old: unknown) => {
      if (!old) return old;
      const data = old as { pages: { comments: Comment[] }[] };
      return {
        ...data,
        pages: data.pages.map((page, pageIndex) => ({
          ...page,
          comments: page.comments.filter((c) => {
            if (c.id === id) {
              backup = { page: pageIndex, comment: c };
              return false;
            }
            return true;
          }),
        })),
      };
    });

    try {
      await mutation.mutateAsync({ id, postId });
    } catch {
      if (backup) {
        const { page, comment } = backup;
        qc.setQueryData(commentKeys.commentsKey(postId), (old: unknown) => {
          if (!old) return old;
          const data = old as { pages: { comments: Comment[] }[] };
          return {
            ...data,
            pages: data.pages.map((p, i) =>
              i === page ? { ...p, comments: [...p.comments, comment] } : p,
            ),
          };
        });
      }
    }
  };

  return { handleDelete, isLoading: mutation.isPending };
};
