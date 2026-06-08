import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAuth } from './require-auth';
import { RequireNoAuth } from './require-no-auth';
import { PostsShell } from '@widgets/posts-shell';
import { LoginPage } from '@pages/login';
import { PostsListPage } from '@pages/posts-list';
import { PostDetailPage } from '@pages/post-detail';
import { PostFormPage } from '@pages/post-form';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/posts" replace />,
  },
  {
    path: '/login',
    element: (
      <RequireNoAuth>
        <LoginPage />
      </RequireNoAuth>
    ),
  },
  {
    path: '/posts',
    element: (
      <RequireAuth>
        <PostsShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <PostsListPage />,
      },
      {
        path: 'new',
        element: <PostFormPage />,
      },
      {
        path: ':id',
        element: <PostDetailPage />,
      },
      {
        path: ':id/edit',
        element: <PostFormPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
