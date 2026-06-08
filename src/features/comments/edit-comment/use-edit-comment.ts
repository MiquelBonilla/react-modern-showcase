import { useQueryClient } from '@tanstack/react-query';
import { useUpdateComment, commentKeys } from '@entities/comment';
import type { Comment } from '@entities/comment';

export const useEditComment = (postId: number) => {
  const qc = useQueryClient();
  const mutation = useUpdateComment();

  const handleEdit = async (id: number, body: string) => {
    let backup: Comment | null = null;

    qc.setQueryData(commentKeys.commentsKey(postId), (old: unknown) => {
      if (!old) return old;
      const data = old as { pages: { comments: Comment[] }[] };
      return {
        ...data,
        pages: data.pages.map((page) => ({
          ...page,
          comments: page.comments.map((c) => {
            if (c.id === id) {
              backup = c;
              return { ...c, body };
            }
            return c;
          }),
        })),
      };
    });

    try {
      await mutation.mutateAsync({ id, body, postId });
    } catch {
      if (backup) {
        qc.setQueryData(commentKeys.commentsKey(postId), (old: unknown) => {
          if (!old) return old;
          const data = old as { pages: { comments: Comment[] }[] };
          return {
            ...data,
            pages: data.pages.map((page) => ({
              ...page,
              comments: page.comments.map((c) => (c.id === id ? backup! : c)),
            })),
          };
        });
      }
    }
  };

  return { handleEdit, isLoading: mutation.isPending };
};
