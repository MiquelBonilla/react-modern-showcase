import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@features/auth';

export function RequireNoAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/posts" replace />;
  }

  return <Outlet />;
}
