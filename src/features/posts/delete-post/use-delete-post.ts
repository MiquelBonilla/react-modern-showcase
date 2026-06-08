import { useNavigate } from 'react-router-dom';
import { useDeletePost } from '@entities/post';

export const useDeletePostFeature = () => {
  const navigate = useNavigate();
  const mutation = useDeletePost();

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    await mutation.mutateAsync(id);
    navigate('/posts');
  };

  return { handleDelete, isLoading: mutation.isPending };
};
