import { useSearchParams } from 'react-router-dom';
import { useLogin } from '@features/auth';
import { AuthForm } from '@widgets/auth-form';
import type { LoginFormData } from '@features/auth';

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/posts';
  const { handleLogin, isLoading, error } = useLogin(returnUrl);

  const onSubmit = (credentials: LoginFormData) => {
    handleLogin(credentials);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
          <p className="mt-2 text-gray-500">Sign in to continue</p>
        </div>

        <div className="rounded-2xl bg-white px-8 py-10 shadow-xl">
          <AuthForm onSubmit={onSubmit} isLoading={isLoading} error={error} />
        </div>
      </div>
    </main>
  );
}
