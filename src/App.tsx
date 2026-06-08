import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './app/routes/require-auth';
import { RequireNoAuth } from './app/routes/require-no-auth';
import { PostsShell } from '@widgets/posts-shell';
import { LoginPage } from '@pages/login';
import { PostsListPage } from '@pages/posts-list';
import { PostDetailPage } from '@pages/post-detail';
import { PostFormPage } from '@pages/post-form';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/posts" replace />} />
      <Route
        path="/login"
        element={
          <RequireNoAuth>
            <LoginPage />
          </RequireNoAuth>
        }
      />
      <Route
        path="/posts"
        element={
          <RequireAuth>
            <PostsShell />
          </RequireAuth>
        }
      >
        <Route index element={<PostsListPage />} />
        <Route path="new" element={<PostFormPage />} />
        <Route path=":id" element={<PostDetailPage />} />
        <Route path=":id/edit" element={<PostFormPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}