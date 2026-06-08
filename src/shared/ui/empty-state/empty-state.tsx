import { useTranslation } from 'react-i18next';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-gray-500">{message ?? t('posts.list.empty')}</p>
    </div>
  );
}
