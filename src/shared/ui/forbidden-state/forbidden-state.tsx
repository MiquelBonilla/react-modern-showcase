interface ForbiddenStateProps {
  message?: string;
}

export function ForbiddenState({
  message = 'You are not authorized to view this content.',
}: ForbiddenStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center p-8 text-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
