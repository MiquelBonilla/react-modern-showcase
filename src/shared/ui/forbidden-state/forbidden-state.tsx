import { useTranslation } from 'react-i18next';

interface ForbiddenStateProps {
  message?: string;
}

export function ForbiddenState({
  message,
}: ForbiddenStateProps) {
  const { t } = useTranslation();
  return (
    <div role="alert" className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-gray-500">{message ?? t('posts.form.forbidden')}</p>
    </div>
  );
}
