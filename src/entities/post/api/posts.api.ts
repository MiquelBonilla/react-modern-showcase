import { api } from '@shared/api';
import { dtoToPost, type Post, type PostsPageParams } from '../model/types';

export const getPostsPage = async (params: PostsPageParams) => {
  const { page, limit, userId, tag, query } = params;
  const { data, headers } = await api.get<unknown[]>('/posts', {
    params: {
      _page: page,
      _limit: limit,
      ...(userId != null && { userId }),
      ...(tag && { tags_like: tag }),
      ...(query && { q: query }),
    },
  });
  const posts = data.map((dto) => dtoToPost(dto as Parameters<typeof dtoToPost>[0]));
  const total = Number(headers['x-total-count'] ?? 0);
  return { posts, total };
};

export const getPostById = async (id: number): Promise<Post> => {
  const { data } = await api.get<unknown>(`/posts/${id}`);
  return dtoToPost(data as Parameters<typeof dtoToPost>[0]);
};

export const createPost = async (post: Omit<Post, 'id'>): Promise<Post> => {
  const { data } = await api.post<unknown>('/posts', post);
  return dtoToPost(data as Parameters<typeof dtoToPost>[0]);
};

export const updatePost = async (id: number, post: Partial<Post>): Promise<Post> => {
  const { data } = await api.patch<unknown>(`/posts/${id}`, post);
  return dtoToPost(data as Parameters<typeof dtoToPost>[0]);
};

export const deletePost = async (id: number): Promise<void> => {
  await api.delete(`/posts/${id}`);
};

export const getTags = async (): Promise<string[]> => {
  const { data } = await api.get<unknown[]>('/posts');
  const allTags = data.flatMap((p) => (p as { tags?: string[] }).tags ?? []);
  return [...new Set(allTags)].sort();
};
