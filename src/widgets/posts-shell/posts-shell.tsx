import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLogout } from '@features/auth';
import { useAuthStore } from '@features/auth';
import { useState } from 'react';

export function PostsShell() {
  const location = useLocation();
  const handleLogout = useLogout();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');

  const showSearch = location.pathname === '/posts';

  const toggleLang = () => {
    const next = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(next);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/posts" className="shrink-0 text-xl font-bold text-indigo-600 no-underline">
            {t('shell.title')}
          </Link>

          <div className={`flex-1 ${showSearch ? '' : 'invisible'}`}>
            <input
              type="search"
              placeholder={t('shell.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            type="button"
            onClick={toggleLang}
            className="rounded-lg border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            {i18n.language === 'en' ? 'ES' : 'EN'}
          </button>

          {currentUser && (
            <span className="hidden text-sm text-gray-500 sm:inline">
              {currentUser.name}
            </span>
          )}

          <button onClick={handleLogout} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
            {t('shell.logout')}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
