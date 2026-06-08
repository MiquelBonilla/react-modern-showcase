import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { PostsShell } from '@widgets/posts-shell';
import { LoginPage } from '@pages/login';
import { PostsListPage } from '@pages/posts-list';
import { PostDetailPage } from '@pages/post-detail';
import { PostFormPage } from '@pages/post-form';
import { RequireAuth } from './require-auth';
import { RequireNoAuth } from './require-no-auth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/posts" replace />,
  },
  {
    element: <RequireNoAuth />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/posts',
        element: <PostsShell />,
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
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);
