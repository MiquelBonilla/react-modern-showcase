import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCommentsPaged, createComment, updateComment, deleteComment } from '../api';
import type { Comment } from './types';

const COMMENTS_LIMIT = 5;

const commentsKey = (postId: number) => ['comments', postId] as const;

export const commentKeys = { commentsKey };

export const useInfiniteComments = (postId: number) =>
  useInfiniteQuery({
    queryKey: commentsKey(postId),
    queryFn: ({ pageParam }) => getCommentsPaged(postId, pageParam as number, COMMENTS_LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < COMMENTS_LIMIT) return undefined;
      return allPages.length + 1;
    },
    enabled: postId > 0,
  });

export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment: Omit<Comment, 'id'>) => createComment(comment),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: commentsKey(variables.postId) });
    },
  });
};

export const useUpdateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: string; postId: number }) =>
      updateComment(id, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: commentsKey(variables.postId) });
    },
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, postId: _postId }: { id: number; postId: number }) => deleteComment(id),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: commentsKey(variables.postId) });
    },
  });
};
