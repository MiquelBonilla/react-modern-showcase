import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryProvider, createQueryClient } from './app/providers/query-provider';
import { AuthProvider } from './app/providers/auth-provider';
import { router } from './app/routes';
import '@shared/lib/i18n';
import './app/styles/globals.css';

const container = document.getElementById('root')!;

const dehydratedState = (window as unknown as { __REACT_QUERY_STATE__?: unknown })
  .__REACT_QUERY_STATE__;

const app = (
  <StrictMode>
    <QueryProvider client={createQueryClient()} dehydratedState={dehydratedState}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>
);

if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
