import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPostsPage, getPostById, createPost, updatePost, deletePost, getTags } from '../api';
import type { PostsPageParams, Post } from './types';

const postsKey = { all: ['posts'] as const };
const postKey = (id: number) => ['posts', id] as const;
const tagsKey = { all: ['tags'] as const };

export const postKeys = { postsKey, postKey, tagsKey };

export const usePostsPage = (params: PostsPageParams) =>
  useQuery({
    queryKey: ['posts', 'page', params],
    queryFn: () => getPostsPage(params),
  });

export const usePostDetail = (id: number) =>
  useQuery({
    queryKey: postKey(id),
    queryFn: () => getPostById(id),
    enabled: id > 0,
  });

export const useTags = () =>
  useQuery({
    queryKey: tagsKey.all,
    queryFn: getTags,
  });

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (post: Omit<Post, 'id'>) => createPost(post),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postsKey.all });
      qc.invalidateQueries({ queryKey: tagsKey.all });
    },
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Post> }) => updatePost(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: postsKey.all });
      qc.invalidateQueries({ queryKey: postKey(id) });
      qc.invalidateQueries({ queryKey: tagsKey.all });
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: postsKey.all });
      qc.invalidateQueries({ queryKey: tagsKey.all });
    },
  });
};
