import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  message?: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  const { t } = useTranslation();
  return (
    <div role="status" className="flex items-center justify-center gap-3 p-8">
      <div className="size-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <span className="text-sm text-gray-500">{message ?? t('posts.list.loading')}</span>
    </div>
  );
}
