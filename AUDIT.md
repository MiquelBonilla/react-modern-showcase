# React Modern Showcase — Audit vs REACT-MIGRATION-PLAN.md

> Generated: 2026-06-08
> Project: `react-modern-showcase/`
> Reference: `REACT-MIGRATION-PLAN.md`

---

## Summary

The project implements most of the planned structure and features, but has **4 critical bugs**, **5 high-priority gaps**, and several medium/low issues. The FSD folder structure is correct, all layers exist, and the core data flow (entities → features → widgets → pages) works. However, optimistic comment updates are silently broken, the auth redirect flow doesn't match the spec, SSR is incomplete, and i18n is entirely missing.

---

## P0 — CRITICAL (broken functionality)

### P0-1. Optimistic comment updates use wrong cache structure

**Files:** `src/features/comments/add-comment/use-add-comment.ts`, `edit-comment/use-edit-comment.ts`, `delete-comment/use-delete-comment.ts`

**Problem:** These hooks cast the `useInfiniteQuery` cache as `{ pages: { comments: Comment[] }[] }`, but `useInfiniteQuery` stores data as `{ pages: Comment[][], pageParams: unknown[] }` because `getCommentsPaged()` returns `Comment[]` directly. Accessing `page.comments` returns `undefined`, so the optimistic updates silently do nothing.

**Evidence:**
```ts
// use-add-comment.ts line ~23 — WRONG
const data = old as { pages: { comments: Comment[] }[] };
// ...
i === 0 ? { ...page, comments: [...page.comments, tempComment] } : page,
```

Each `page` is already a `Comment[]`, not `{ comments: Comment[] }`.

**Fix:** Rewrite optimistic updates to treat each page as a flat `Comment[]`:

```ts
// Add comment — append to last page
qc.setQueryData(key, (old: unknown) => {
  if (!old) return old;
  const data = old as { pages: Comment[][]; pageParams: unknown[] };
  const pages = [...data.pages];
  pages[pages.length - 1] = [...pages[pages.length - 1], tempComment];
  return { ...data, pages };
});

// Edit comment — map over all pages
qc.setQueryData(key, (old: unknown) => {
  if (!old) return old;
  const data = old as { pages: Comment[][]; pageParams: unknown[] };
  return {
    ...data,
    pages: data.pages.map(page =>
      page.map(c => c.id === id ? { ...c, body } : c)
    ),
  };
});

// Delete comment — filter from all pages
qc.setQueryData(key, (old: unknown) => {
  if (!old) return old;
  const data = old as { pages: Comment[][]; pageParams: unknown[] };
  let backup: Comment | null = null;
  const pages = data.pages.map(page =>
    page.filter(c => {
      if (c.id === id) { backup = c; return false; }
      return true;
    })
  );
  // store backup for rollback
  return { ...data, pages };
});
```

Alternatively (preferred), move optimistic logic into the mutation options in `entities/comment/model/comment.queries.ts` using TanStack Query's `onMutate`/`onError`/`onSettled` pattern as the plan specifies.

---

### P0-2. RequireAuth doesn't preserve returnUrl in query params

**Files:** `src/app/routes/require-auth.tsx`, `src/pages/login/login-page.tsx`

**Problem:** Plan specifies "Preservar `returnUrl` en query params durante redirect a login". Currently `require-auth.tsx` redirects with `state: { from: location }` but `login-page.tsx` reads `searchParams.get('returnUrl')`. The returnUrl is never set in query params, so after login the user always navigates to `/posts` regardless of where they were.

**Fix in `require-auth.tsx`:**
```tsx
if (!isAuthenticated) {
  const returnUrl = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
}
```

**Fix in `require-no-auth.tsx`:** Also check for `returnUrl` in search params when redirecting already-authenticated users:
```tsx
if (isAuthenticated) {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') ?? '/posts';
  return <Navigate to={returnUrl} replace />;
}
```

---

### P0-3. SSR HTML document incomplete

**Files:** `src/server/index.ts`, `src/main.server.tsx`

**Problem:** The Express server pipes `renderToPipeableStream` output directly to the response, but this output is only the React-rendered HTML fragments — not a complete HTML document. Missing: `<!DOCTYPE html>`, `<html>`, `<head>`, `<meta>`, `<link>` to CSS, `<script>` for client bundle, and the `__REACT_QUERY_STATE__` injection isn't inside proper HTML.

**Fix:** The server should build a complete HTML document. Read the client `index.html` as a template, inject the React stream into `<div id="root">`, and add the bootstrap script:

```ts
import fs from 'fs';

const template = fs.readFileSync(
  path.join(clientDistPath, 'index.html'),
  'utf-8'
);

app.use('*', (req, res) => {
  const [head, tail] = template.split('<!--ssr-outlet-->')
    .length === 2
    ? template.split('<!--ssr-outlet-->')
    : [template.replace('</div></body>', ''), '</div></body>'];

  res.setHeader('Content-Type', 'text/html');
  res.write(head);

  const { pipe } = render(req.url, {
    onShellReady() {
      pipe(res);
    },
    onAllReady() {
      res.write(tail);
      res.end();
    },
    onShellError() {
      res.status(500).send('Server error');
    },
    onError(error) {
      console.error(error);
    },
  });
});
```

Also update `index.html` to include `<!--ssr-outlet-->` inside `<div id="root">`.

---

### P0-4. Legacy CSS files break the app layout

**Files:** `src/index.css`, `src/App.css`

**Problem:** `src/index.css` sets `#root { width: 1126px; text-align: center; }` and global font sizing that conflicts with the Tailwind-based mobile-first layout. Even though `main.tsx` imports `globals.css` instead of `index.css`, the `index.css` and `App.css` files are leftover Vite scaffold that could be accidentally imported.

**Fix:** Delete `src/index.css` and `src/App.css`. Also delete unused scaffold assets: `src/assets/vite.svg`, `src/assets/react.svg`, `src/assets/hero.png`.

---

## P1 — HIGH (significant missing features / spec violations)

### P1-1. i18n completely missing

**Problem:** Plan specifies "react-i18next — same i18n keys, same JSON files". Neither `react-i18next` nor `i18next` is installed. No translation files exist (`public/i18n/en.json`, `public/i18n/es.json`). All UI text is hardcoded in English.

**Fix:**
1. Install: `npm i react-i18next i18next i18next-browser-languagedetector i18next-http-backend`
2. Copy `en.json` and `es.json` from `angular-modern-showcase/public/i18n/` to `react-modern-showcase/public/i18n/`
3. Create `src/shared/lib/i18n/` with i18next config
4. Replace all hardcoded strings with `t('key')` calls
5. Add language switcher in `PostsShell` header

---

### P1-2. PostsShell search bar disconnected from filters

**File:** `src/widgets/posts-shell/posts-shell.tsx`

**Problem:** The shell has a local `search` state (`useState('')`) that is completely disconnected from `usePostFilters`. Typing in the search bar does nothing — it doesn't filter posts.

**Fix:** Remove local search state. Either:
- (a) Move the search input to `PostsFilters` widget and connect it to `usePostFilters`, OR
- (b) Accept `searchQuery`/`onSearchChange` as props in PostsShell, passing them from the page.

Option (a) is cleaner per FSD — the filters widget already manages filter state.

---

### P1-3. "Showing X-Y of Z" calculation wrong

**File:** `src/pages/posts-list/posts-list-page.tsx` line 46

**Problem:** `shownCount` is `Math.min(filters.page * PAGE_SIZE, total)` which gives the end index, not a range. Should show "Showing 1-9 of 30" not "Showing 9 of 30".

**Fix:**
```tsx
const start = (filters.page - 1) * PAGE_SIZE + 1;
const end = Math.min(filters.page * PAGE_SIZE, postsData.total);
// ...
<p>Showing <span>{start}</span>-<span>{end}</span> of <span>{postsData.total}</span> results</p>
```

---

### P1-4. SSR doesn't prefetch data

**File:** `src/main.server.tsx`

**Problem:** The server creates a `QueryClient` and immediately renders without prefetching any data. The `dehydrate(queryClient)` call in `bootstrapScriptContent` always produces an empty state because no queries have been executed. This defeats the purpose of SSR.

**Fix:** Before rendering, prefetch data based on the URL:
```ts
import { matchPath } from 'react-router-dom';

export async function render(url: string, options: RenderToPipeableStreamOptions) {
  const queryClient = createQueryClient();

  // Prefetch based on route
  const paths = [
    { path: '/posts', prefetch: () => queryClient.prefetchQuery(...) },
    { path: '/posts/:id', prefetch: () => queryClient.prefetchQuery(...) },
  ];

  for (const { path, prefetch } of paths) {
    const match = matchPath(path, new URL(url, 'http://localhost').pathname);
    if (match) await prefetch(match);
  }

  // ... render with populated queryClient
}
```

---

### P1-5. Dual route definitions (client vs server inconsistency)

**Files:** `src/App.tsx`, `src/app/routes/index.tsx`

**Problem:** Routes are defined in two places:
- `routes/index.tsx` uses `createBrowserRouter` — used by `main.tsx` (client)
- `App.tsx` uses `<Routes>/<Route>` — used by `main.server.tsx` (server via `StaticRouter`)

These can get out of sync. `createBrowserRouter` supports data APIs while `<Routes>` doesn't.

**Fix:** Use a single route definition. For SSR compatibility:
- Define routes as a data structure (array of route objects)
- Client: pass to `createBrowserRouter`
- Server: render with `<StaticRouter>` + `<Routes>` generated from same data, or use `createStaticRouter` from `react-router-dom`

---

## P2 — MEDIUM (code quality / pattern violations)

### P2-1. Comment optimistic updates not using TanStack Query's built-in pattern

**Files:** `entities/comment/model/comment.queries.ts`, `features/comments/add-comment/use-add-comment.ts`, etc.

**Problem:** Plan specifies using `onMutate`/`onError`/`onSettled` in mutation options. Current implementation manually calls `qc.setQueryData` in feature hooks, duplicating logic and making it harder to maintain.

**Fix:** Move optimistic update logic into mutation options in `comment.queries.ts`:
```ts
export const useCreateComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment: Omit<Comment, 'id'>) => createComment(comment),
    onMutate: async (newComment) => {
      await qc.cancelQueries({ queryKey: commentsKey(newComment.postId) });
      const previous = qc.getQueryData(commentsKey(newComment.postId));
      // optimistically add
      qc.setQueryData(commentsKey(newComment.postId), (old: unknown) => { ... });
      return { previous };
    },
    onError: (_err, newComment, context) => {
      qc.setQueryData(commentsKey(newComment.postId), context?.previous);
    },
    onSettled: (_data, _err, newComment) => {
      qc.invalidateQueries({ queryKey: commentsKey(newComment.postId) });
    },
  });
};
```

---

### P2-2. No route-level code splitting

**Files:** `src/App.tsx`, `src/app/routes/index.tsx`

**Problem:** Plan mentions "React Router `lazy()` para route-level splitting". All pages are eagerly imported.

**Fix:** Use `lazy` in route definitions:
```tsx
const PostsListPage = lazy(() => import('@pages/posts-list'));
const PostDetailPage = lazy(() => import('@pages/post-detail'));
const PostFormPage = lazy(() => import('@pages/post-form'));
const LoginPage = lazy(() => import('@pages/login'));
```

Or with `createBrowserRouter`:
```ts
{ path: 'new', lazy: () => import('@pages/post-form') }
```

---

### P2-3. Double confirm dialog on post delete

**Files:** `src/features/posts/delete-post/use-delete-post.ts`, `src/pages/post-detail/post-detail-page.tsx`

**Problem:** Both `handleDelete()` in the feature hook AND `onDelete()` in the page call `window.confirm()`. User sees two confirmation dialogs.

**Fix:** Remove `window.confirm` from the page (`post-detail-page.tsx`). Keep it in the feature hook only.

---

### P2-4. `await navigate()` is pointless

**File:** `src/features/auth/login/use-login.ts` line ~18

**Problem:** `navigate()` from React Router returns `void`, not a Promise. `await navigate(returnUrl)` does nothing.

**Fix:** Change to `navigate(returnUrl)` (remove `await`).

---

### P2-5. Duplicated users query across components

**Files:** `posts-list-page.tsx`, `posts-filters.tsx`, `post-detail-page.tsx`, `features/comments/infinite-scroll/use-infinite-comments.ts`

**Problem:** Each file independently calls `useQuery({ queryKey: ['users'], queryFn: getUsers })`. While TanStack Query deduplicates, this should be a centralized hook.

**Fix:** Create `entities/user/model/user.queries.ts` with `useUsers()` hook, export from `entities/user`.

---

### P2-6. Insufficient test coverage

**Problem:** Only 1 test file exists (`loading-spinner.test.tsx`). No tests for: entities (API calls, queries), features (auth flow, optimistic updates, filters), widgets, or pages.

**Fix:** Add tests for:
- `entities/user/api/users.api.ts` — login success/failure
- `entities/post/api/posts.api.ts` — CRUD operations
- `entities/comment/model/comment.queries.ts` — infinite query + mutations
- `features/auth/model/auth.store.ts` — setSession, logout, persistence
- `features/posts/filter-posts/use-post-filters.ts` — URL sync, page reset
- `features/comments/add-comment/use-add-comment.ts` — optimistic flow
- Widget rendering tests (at least auth-form, post-card, posts-filters)
- Page integration tests (posts-list, post-detail, post-form)

---

## P3 — LOW (cleanup / minor improvements)

### P3-1. Scaffold files not cleaned up

**Files to delete:**
- `src/index.css` — conflicts with `globals.css`
- `src/App.css` — Vite scaffold styles, unused
- `src/assets/vite.svg` — Vite logo, unused
- `src/assets/react.svg` — React logo, unused
- `src/assets/hero.png` — Vite scaffold, unused

---

### P3-2. Vite config duplication

**Files:** `vite.config.ts`, `vite.config.client.ts`, `vite.config.server.ts`

**Problem:** Alias configuration is duplicated across all 3 configs.

**Fix:** Extract shared config into a base and merge:
```ts
// vite.config.base.ts
export const sharedConfig = { resolve: { aliases: { ... } }, plugins: [react()] };
```

---

### P3-3. `tsconfig.node.json` missing vite config includes

**File:** `tsconfig.node.json`

**Problem:** Only includes `vite.config.ts`. Should also include `vite.config.client.ts` and `vite.config.server.ts`.

**Fix:** Update `include` to `["vite.config.*.ts", "vite.config.ts"]`.

---

### P3-4. E2E tests minimal

**File:** `e2e/login.spec.ts`

**Problem:** Only 2 tests for login. Missing coverage for: posts list, pagination, filters, post detail, comments, post CRUD, auth guards.

**Fix:** Add e2e specs for each major feature flow.

---

### P3-5. Non-exported Dto types

**Files:** `entities/user/model/types.ts`, `entities/post/model/types.ts`, `entities/comment/model/types.ts`

**Problem:** `UserDto`, `PostDto`, `CommentDto` are declared as non-exported interfaces. While only used internally by mappers, exporting them would be consistent and useful for testing.

---

### P3-6. `formatMonthYear` hardcoded to 'en-US'

**File:** `src/shared/lib/month-year/month-year.ts`

**Problem:** Uses `'en-US'` locale. Once i18n is added, should use the current language locale.

**Fix:** Accept locale parameter or read from i18n:
```ts
export function formatMonthYear(isoDate: string | undefined | null, locale = 'en'): string {
  if (!isoDate) return '';
  return new Date(isoDate)
    .toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', { month: 'short', year: 'numeric' })
    .toUpperCase()
    .replace(',', '');
}
```

---

## Task Execution Checklist

When asked to execute a task, reference by ID:

| ID | Priority | Summary | Estimated effort |
|----|----------|---------|-----------------|
| P0-1 | CRITICAL | Fix optimistic comment cache structure | 1h |
| P0-2 | CRITICAL | Fix RequireAuth returnUrl in query params | 15min |
| P0-3 | CRITICAL | Complete SSR HTML document | 2h |
| P0-4 | CRITICAL | Remove legacy CSS/files | 10min |
| P1-1 | HIGH | Add i18n (react-i18next) | 4h |
| P1-2 | HIGH | Connect shell search to filters | 30min |
| P1-3 | HIGH | Fix "Showing X-Y of Z" range | 10min |
| P1-4 | HIGH | Add SSR data prefetch | 2h |
| P1-5 | HIGH | Unify route definitions | 1h |
| P2-1 | MEDIUM | Move optimistic logic to mutation options | 1h |
| P2-2 | MEDIUM | Add route-level code splitting | 30min |
| P2-3 | MEDIUM | Remove double confirm dialog | 5min |
| P2-4 | MEDIUM | Remove await from navigate() | 2min |
| P2-5 | MEDIUM | Create centralized useUsers hook | 20min |
| P2-6 | MEDIUM | Add unit/integration tests | 4h |
| P3-1 | LOW | Delete scaffold files | 5min |
| P3-2 | LOW | Extract shared vite config | 20min |
| P3-3 | LOW | Fix tsconfig.node.json includes | 5min |
| P3-4 | LOW | Add E2E tests | 4h |
| P3-5 | LOW | Export Dto types | 5min |
| P3-6 | LOW | Localize formatMonthYear | 10min |

**Recommended execution order:** P0-1 → P0-2 → P0-4 → P1-3 → P2-3 → P2-4 → P1-2 → P2-5 → P0-3 → P1-4 → P1-5 → P2-1 → P2-2 → P1-1 → P2-6 → P3-1 → P3-2 → P3-3 → P3-4 → P3-5 → P3-6
