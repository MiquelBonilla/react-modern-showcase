import { QueryClient, QueryClientProvider, dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  });
}

interface QueryProviderProps {
  children: ReactNode;
  client?: QueryClient;
  dehydratedState?: unknown;
}

export function QueryProvider({ children, client, dehydratedState }: QueryProviderProps) {
  const queryClient = client ?? createQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={dehydratedState as never}>{children}</HydrationBoundary>
    </QueryClientProvider>
  );
}

export { dehydrate };
