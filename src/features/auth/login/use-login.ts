import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@entities/user';
import { useAuthStore } from '../model/auth.store';
import type { Credentials } from '@entities/user';

export const useLogin = (returnUrl = '/posts') => {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (credentials: Credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await login(credentials);
      const token = `static-token-${user.id}`;
      setSession(user, token);
      await navigate(returnUrl);
    } catch {
      setError('Invalid name or password');
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};
