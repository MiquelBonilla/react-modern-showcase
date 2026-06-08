import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@features/auth';

export function RequireNoAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const returnUrl = searchParams.get('returnUrl') ?? '/posts';
    return <Navigate to={decodeURIComponent(returnUrl)} replace />;
  }

  return <Outlet />;
}
