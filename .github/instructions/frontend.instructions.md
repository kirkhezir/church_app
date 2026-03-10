---
applyTo: "frontend/**"
---

# Frontend Development Rules

## URL Namespacing — CRITICAL

Backend API paths and frontend React Router paths are completely separate:

| Context                  | Pattern     | Example                         |
| ------------------------ | ----------- | ------------------------------- |
| React Router route       | `/app/*`    | `/app/dashboard`, `/app/events` |
| API call via `apiClient` | `/resource` | `/members/dashboard`, `/events` |

```typescript
// ✅ Correct — apiClient base is http://localhost:3000/api/v1
apiClient.get("/members/dashboard"); // → /api/v1/members/dashboard
apiClient.get("/events"); // → /api/v1/events

// ❌ Wrong — /app is a React Router prefix only
apiClient.get("/app/members/dashboard"); // 404
```

All API calls belong in `frontend/src/services/endpoints/` — never inline fetch/axios in page components.

## Import Path Alias

Always use the `@/` alias for `src/` imports:

```typescript
// ✅ Correct
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// ❌ Wrong
import { Button } from "../../../components/ui/button";
```

## Route Structure

```
pages/landing/   → public routes: /, /about, /visit, /events, /sermons, etc.
pages/auth/      → auth routes: /login, /register, /mfa-verify, /reset-password
pages/app/       → protected routes: /app/dashboard, /app/events, /app/admin/*
```

- Home page: `pages/landing/Home.tsx`, component export: `HomePage`
- All `/app/*` routes must be wrapped in `<PrivateRoute>` or `<AdminRoute>`

## Lazy Loading

All non-critical routes must be lazy-loaded:

```tsx
const EventsPage = lazy(() => import("./pages/app/events/EventsListPage"));
```

## Authentication

Use `AuthContext` — never roll your own auth state:

```typescript
import { useAuth } from "@/contexts/AuthContext";
const { member, login, logout, isAuthenticated } = useAuth();
```

## shadcn/ui Components

- All UI primitives live in `components/ui/` (shadcn generated)
- Feature components live in `components/features/`
- Add new shadcn components with: `npx shadcn-ui@latest add <component>`
- Style via Tailwind classes only — no direct CSS overrides

## Admin Page Breadcrumbs

Admin pages must follow the 3-level breadcrumb pattern mirroring the sidebar:

**Administration > Category (Content | Monitoring) > Page**

- `Administration` links to `/app/admin/members`
- `Content` group: Sermons, Gallery, Blog, Ministries
- `Monitoring` group: Analytics, Reports, Health, Audit, Export

## Route Protection

All `/app/*` routes require `PrivateRoute`; admin routes require `AdminRoute`:

```tsx
import { PrivateRoute } from '@/components/routing/PrivateRoute';
import { AdminRoute } from '@/components/routing/AdminRoute';

<Route path="/app/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
<Route path="/app/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
```

OWASP A01: `AdminRoute` must verify the member role — never rely on hiding UI elements alone.

## Real-Time (WebSocket)

```typescript
import { websocketService } from "@/services/websocket/websocketService";
websocketService.on("new-message", (data) => {
  /* handle */
});
websocketService.on("new-announcement", (data) => {
  /* handle */
});
```

## Coding Principles

- **DRY**: API calls belong in `services/endpoints/` — never inline `fetch`/`axios` in page components.
- **KISS**: Keep pages as presentational shells that call service functions and render data.
- **YAGNI**: No extra abstractions for one-off operations.

## TypeScript Strict Mode

`noUnusedLocals` and `noUnusedParameters` are enforced. Before every push:

```bash
cd frontend && npm run build   # Must exit 0, zero TS errors
```

- `TS6133` (unused import/variable) is the #1 cause of Vercel deploy failures — remove unused imports immediately
- Prefix intentionally-unused params with `_` (e.g. `_event`)
- No `any` casts — fix the types
- Use `@/` alias — never relative `../../` paths

## Security

- All secrets/API keys must come from environment variables — never hardcoded in frontend code.
- OWASP A01: Use `AdminRoute` guard for all `/app/admin/*` routes — server-side role checks must also exist in backend.
- Never store tokens in `localStorage` — auth tokens are handled by `AuthContext` via httpOnly cookies.
