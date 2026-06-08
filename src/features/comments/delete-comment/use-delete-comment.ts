import { useQueryClient } from '@tanstack/react-query';
import { useDeleteComment as useDeleteCommentMutation, commentKeys } from '@entities/comment';
import type { Comment } from '@entities/comment';

type InfiniteData = { pages: Comment[][]; pageParams: unknown[] };

export const useDeleteComment = (postId: number) => {
  const qc = useQueryClient();
  const mutation = useDeleteCommentMutation();

  const handleDelete = async (id: number) => {
    let backup: Comment | null = null;

    qc.setQueryData(commentKeys.commentsKey(postId), (old: unknown) => {
      if (!old) return old;
      const data = old as InfiniteData;
      return {
        ...data,
        pages: data.pages.map((page) =>
          page.filter((c) => {
            if (c.id === id) {
              backup = c;
              return false;
            }
            return true;
          }),
        ),
      };
    });

    try {
      await mutation.mutateAsync({ id, postId });
    } catch {
      if (backup) {
        qc.setQueryData(commentKeys.commentsKey(postId), (old: unknown) => {
          if (!old) return old;
          const data = old as InfiniteData;
          const pages = [...data.pages];
          const lastIdx = pages.length - 1;
          pages[lastIdx] = [...pages[lastIdx], backup!];
          return { ...data, pages };
        });
      }
    }
  };

  return { handleDelete, isLoading: mutation.isPending };
};
