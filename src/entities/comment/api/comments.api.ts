import { api } from '@shared/api';
import { dtoToComment, type Comment } from '../model/types';

export const getCommentsPaged = async (
  postId: number,
  page: number,
  limit: number,
): Promise<Comment[]> => {
  const { data } = await api.get<unknown[]>('/comments', {
    params: { postId, _page: page, _limit: limit },
  });
  return data.map((dto) => dtoToComment(dto as Parameters<typeof dtoToComment>[0]));
};

export const createComment = async (
  comment: Omit<Comment, 'id'>,
): Promise<Comment> => {
  const { data } = await api.post<unknown>('/comments', comment);
  return dtoToComment(data as Parameters<typeof dtoToComment>[0]);
};

export const updateComment = async (id: number, body: string): Promise<Comment> => {
  const { data } = await api.patch<unknown>(`/comments/${id}`, { body });
  return dtoToComment(data as Parameters<typeof dtoToComment>[0]);
};

export const deleteComment = async (id: number): Promise<void> => {
  await api.delete(`/comments/${id}`);
};
