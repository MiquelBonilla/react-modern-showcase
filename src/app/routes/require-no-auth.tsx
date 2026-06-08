import { Navigate, type ReactNode } from 'react';
import { useAuthStore } from '@features/auth';

interface RequireNoAuthProps {
  children: ReactNode;
}

export function RequireNoAuth({ children }: RequireNoAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/posts" replace />;
  }

  return <>{children}</>;
}
