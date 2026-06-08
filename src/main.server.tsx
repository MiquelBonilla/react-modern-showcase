import { StrictMode } from 'react';
import { renderToPipeableStream, type RenderToPipeableStreamOptions } from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';
import { QueryProvider, createQueryClient, dehydrate } from './app/providers/query-provider';
import { AuthProvider } from './app/providers/auth-provider';
import { App } from './App';
import { getPostsPage, getPostById, getTags } from './entities/post/api';
import { getUsers } from './entities/user/api';

interface RoutePrefetch {
  path: string;
  prefetch: (params: Record<string, string>, queryClient: ReturnType<typeof createQueryClient>) => Promise<void>;
}

const routes: RoutePrefetch[] = [
  {
    path: '/posts',
    prefetch: async (_params, qc) => {
      await Promise.all([
        qc.prefetchQuery({ queryKey: ['posts', 'page', { page: 1, limit: 9 }], queryFn: () => getPostsPage({ page: 1, limit: 9 }) }),
        qc.prefetchQuery({ queryKey: ['users'], queryFn: getUsers }),
        qc.prefetchQuery({ queryKey: ['tags'], queryFn: getTags }),
      ]);
    },
  },
  {
    path: '/posts/:id/edit',
    prefetch: async (params, qc) => {
      const id = Number(params.id);
      await Promise.all([
        qc.prefetchQuery({ queryKey: ['posts', id], queryFn: () => getPostById(id) }),
        qc.prefetchQuery({ queryKey: ['users'], queryFn: getUsers }),
      ]);
    },
  },
  {
    path: '/posts/:id',
    prefetch: async (params, qc) => {
      const id = Number(params.id);
      await Promise.all([
        qc.prefetchQuery({ queryKey: ['posts', id], queryFn: () => getPostById(id) }),
        qc.prefetchQuery({ queryKey: ['users'], queryFn: getUsers }),
      ]);
    },
  },
];

export async function render(
  url: string,
  options: RenderToPipeableStreamOptions,
) {
  const queryClient = createQueryClient();

  const pathname = new URL(url, 'http://localhost').pathname;

  for (const route of routes) {
    const match = matchPath(route.path, pathname);
    if (match) {
      await route.prefetch(match.params as Record<string, string>, queryClient);
      break;
    }
  }

  const dehydratedState = JSON.stringify(dehydrate(queryClient));

  return renderToPipeableStream(
    <StrictMode>
      <StaticRouter location={url}>
        <QueryProvider client={queryClient}>
          <AuthProvider>
            <App />
          </AuthProvider>
        </QueryProvider>
      </StaticRouter>
    </StrictMode>,
    {
      ...options,
      bootstrapScriptContent: `window.__REACT_QUERY_STATE__=${dehydratedState};`,
    },
  );
}
