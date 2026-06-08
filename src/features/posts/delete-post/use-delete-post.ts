import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDeletePost } from '@entities/post';

export const useDeletePostFeature = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mutation = useDeletePost();

  const handleDelete = async (id: number) => {
    if (!window.confirm(t('posts.detail.confirmDelete'))) return;
    await mutation.mutateAsync(id);
    navigate('/posts');
  };

  return { handleDelete, isLoading: mutation.isPending };
};
