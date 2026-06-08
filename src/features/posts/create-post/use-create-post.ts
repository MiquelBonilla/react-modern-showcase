import { useNavigate } from 'react-router-dom';
import { useCreatePost } from '@entities/post';
import type { Post } from '@entities/post';

export const useCreatePostFeature = () => {
  const navigate = useNavigate();
  const mutation = useCreatePost();

  const handleCreate = async (data: Omit<Post, 'id'>) => {
    await mutation.mutateAsync(data);
    navigate('/posts');
  };

  return { handleCreate, isLoading: mutation.isPending, error: mutation.error };
};
