interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center p-8 text-center">
      <p className="mb-4 text-gray-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Retry
      </button>
    </div>
  );
}
