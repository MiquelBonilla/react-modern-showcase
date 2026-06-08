import { StrictMode } from 'react';
import { renderToPipeableStream, type RenderToPipeableStreamOptions } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { QueryProvider, createQueryClient, dehydrate } from './app/providers/query-provider';
import { AuthProvider } from './app/providers/auth-provider';
import { App } from './App';

export function render(url: string, options: RenderToPipeableStreamOptions) {
  const queryClient = createQueryClient();

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
      bootstrapScriptContent: `
        window.__REACT_QUERY_STATE__ = ${JSON.stringify(dehydrate(queryClient))};
      `,
    },
  );
}
