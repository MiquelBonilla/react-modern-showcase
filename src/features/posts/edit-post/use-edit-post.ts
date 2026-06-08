import { useNavigate } from 'react-router-dom';
import { usePostDetail, useUpdatePost } from '@entities/post';
import { useAuthStore } from '@features/auth';
import type { Post } from '@entities/post';

export const useEditPostFeature = (id: number) => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { data: post, isLoading, error } = usePostDetail(id);
  const mutation = useUpdatePost();

  const isOwner = currentUser?.id === post?.userId;
  const isForbidden = !isLoading && post !== undefined && !isOwner;

  const handleUpdate = async (data: Partial<Post>) => {
    await mutation.mutateAsync({ id, data });
    navigate(`/posts/${id}`);
  };

  return {
    post: post ?? null,
    isOwner,
    isForbidden,
    handleUpdate,
    isLoading,
    error,
    mutationError: mutation.error,
  };
};
