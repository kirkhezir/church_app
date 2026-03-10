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

---

## 📱 Mobile-First & Responsive Design

Every new feature, fix, or enhancement **must** be mobile-first. Design for the smallest screen first, then layer up.

### Tailwind Breakpoint Order (always)

```tsx
// ✅ Mobile-first: base = mobile, sm/md/lg = larger screens
<div className="flex flex-col gap-4 sm:flex-row sm:gap-6 lg:gap-8">
  <aside className="w-full sm:w-64 lg:w-72">
  <main className="flex-1 min-w-0">

// ❌ Wrong — desktop-first overrides
<div className="flex-row max-sm:flex-col">
```

### Layout Rules

- **Viewport meta** — must be present: `<meta name="viewport" content="width=device-width, initial-scale=1" />`
- **No horizontal scroll** — all content must fit within viewport width at every breakpoint
- **Touch targets** — minimum **44×44 px** for all interactive elements (buttons, links, icons)
- **Font size** — minimum **16px** body text on mobile to prevent browser zoom
- **Line length** — max 65–75 characters per line for readability
- **Spacing** — use consistent Tailwind spacing scale; never hardcode `px` values in JSX
- **Images** — use `loading="lazy"`, `srcset`/`sizes`, and WebP format; always set `width`/`height` to prevent layout shift

```tsx
// ✅ Responsive image
<img
  src="/hero.webp"
  srcSet="/hero-480.webp 480w, /hero-1024.webp 1024w"
  sizes="(max-width: 640px) 100vw, 50vw"
  width={1024}
  height={576}
  loading="lazy"
  alt="Church service"
/>
```

### Touch & Interaction

- Use `onClick`/`onPointerDown` for primary interactions — not `onMouseOver`
- Disable buttons during async operations to prevent double-submit
- Show clear error messages near the problem field, not in a toast alone
- Add `cursor-pointer` to all non-button clickable elements

---

## ♿ Accessibility (a11y) — CRITICAL

Accessibility is non-negotiable. Every component must meet WCAG 2.1 AA.

- **Color contrast** — minimum 4.5:1 for normal text, 3:1 for large text
- **Focus rings** — never remove `:focus-visible` outlines; use Tailwind `focus-visible:ring-2`
- **Alt text** — descriptive `alt` on all meaningful `<img>`; `alt=""` for decorative images
- **ARIA labels** — add `aria-label` to icon-only buttons and interactive elements without visible text
- **Keyboard navigation** — tab order must match visual order; all interactive elements reachable by keyboard
- **Form labels** — every input must have an associated `<label for="...">` or `aria-label`
- **Semantic HTML** — use the correct element for its purpose (see Semantic HTML section below)
- **`prefers-reduced-motion`** — wrap animations in a check:

```tsx
// ✅ Respects user motion preferences
const prefersReduced = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const variants = prefersReduced
  ? {}
  : { initial: { opacity: 0 }, animate: { opacity: 1 } };
```

---

## 🏷️ Semantic HTML

Always use the most semantically appropriate HTML element. Semantic markup improves accessibility, SEO, and maintainability.

| Use                          | Instead of                        |
| ---------------------------- | --------------------------------- |
| `<button>`                   | `<div onClick>`, `<span onClick>` |
| `<nav>`                      | `<div class="nav">`               |
| `<header>` / `<footer>`      | `<div class="header">`            |
| `<main>`                     | `<div id="main">`                 |
| `<section>` / `<article>`    | generic `<div>` for page sections |
| `<h1>`–`<h6>` (hierarchical) | `<div class="title">`             |
| `<ul>` / `<ol>` / `<li>`     | `<div>` for lists                 |
| `<time dateTime="...">`      | plain text for dates              |
| `<a href="...">`             | `<div onClick>` for navigation    |

```tsx
// ✅ Semantic page structure
<main>
  <section aria-labelledby="events-heading">
    <h2 id="events-heading">Upcoming Events</h2>
    <ul>
      {events.map(e => <li key={e.id}><article>...</article></li>)}
    </ul>
  </section>
</main>

// ❌ Div soup
<div class="main">
  <div class="section">
    <div class="title">Upcoming Events</div>
    <div class="list">
      {events.map(e => <div key={e.id}>...</div>)}
    </div>
  </div>
</div>
```

---

## ⚡ React Performance (Vercel Best Practices)

Apply these rules when writing or reviewing React components. Consult the `vercel-react-best-practices` skill for full rule files.

### CRITICAL — Eliminate Waterfalls

- Use `Promise.all()` for independent async operations — never sequential `await`:

```tsx
// ✅ Parallel
const [events, announcements] = await Promise.all([
  eventService.getEvents(),
  announcementService.getAnnouncements(),
]);

// ❌ Sequential waterfall
const events = await eventService.getEvents();
const announcements = await announcementService.getAnnouncements();
```

- Use `<Suspense>` boundaries to stream content and avoid blocking renders
- Start promises early, `await` late in API routes and data-fetching hooks

### CRITICAL — Bundle Size

- **Never import from barrel files** — import directly from the source file:

```tsx
// ✅ Direct import
import { Button } from "@/components/ui/button";

// ❌ Barrel import (pulls entire barrel into bundle)
import { Button, Dialog, Card } from "@/components/ui";
```

- Use `React.lazy()` for heavy components and non-critical routes (already required above)
- Defer third-party scripts (analytics, tracking) until after hydration
- Load heavy modules conditionally — only when a feature is activated

### Re-render Optimization

- Use `React.memo()` for components with expensive renders that receive stable props
- Hoist default non-primitive props (objects/arrays) to module level to maintain reference stability:

```tsx
// ✅ Stable reference
const DEFAULT_FILTERS = { status: 'active', page: 1 };
function EventList({ filters = DEFAULT_FILTERS }) { ... }

// ❌ New object on every render
function EventList({ filters = { status: 'active', page: 1 } }) { ... }
```

- Use primitive values (not objects) as `useEffect` dependencies
- Derive state during render — don't sync it via `useEffect`
- Use `useTransition` for non-urgent updates (search, filters, pagination)

### Rendering Performance

- Use `ternary`, not `&&`, for conditional rendering of elements that could be falsy `0`:

```tsx
// ✅ Safe
{
  count > 0 ? <Badge>{count}</Badge> : null;
}

// ❌ Renders '0' if count is 0
{
  count && <Badge>{count}</Badge>;
}
```

- Use `transform`/`opacity` for animations — never animate `width`/`height`/`top`/`left`
- Animation duration: 150–300ms for micro-interactions

---

## 📱 Progressive Web App (PWA)

This app targets church members who may use low-end Android devices or have intermittent connectivity.

- **Offline-capable pages** — critical pages (dashboard, events list, announcements) must display meaningful content when offline using service worker cache
- **App manifest** — ensure `public/manifest.json` has `name`, `short_name`, `icons` (192px + 512px), `theme_color`, `background_color`, and `display: standalone`
- **Install prompt** — do not suppress the browser's "Add to Home Screen" prompt
- **Performance budget** — target Lighthouse scores: Performance ≥90, Accessibility ≥95, Best Practices ≥95, SEO ≥90
- **Core Web Vitals** — LCP < 2.5s, FID/INP < 100ms, CLS < 0.1

```json
// public/manifest.json (minimum required fields)
{
  "name": "Sing Buri Adventist Center",
  "short_name": "SBAC",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1e40af",
  "background_color": "#ffffff",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## 🎨 UI/UX Checklist (Every Feature)

Before considering any frontend change complete, verify:

| Check                            | Rule                                     |
| -------------------------------- | ---------------------------------------- |
| ✅ Mobile layout tested at 375px | No horizontal overflow, legible text     |
| ✅ Touch targets ≥44×44px        | All buttons, links, interactive elements |
| ✅ Color contrast ≥4.5:1         | Use browser DevTools or axe extension    |
| ✅ Keyboard navigable            | Tab through all interactive elements     |
| ✅ Focus rings visible           | `focus-visible:ring-2` present           |
| ✅ Semantic HTML used            | Correct elements, not div soup           |
| ✅ Images have alt text          | Descriptive or empty for decorative      |
| ✅ Loading states shown          | Skeleton or spinner during async ops     |
| ✅ Error states handled          | Clear message near the problem field     |
| ✅ Reduced motion respected      | No forced animation                      |
| ✅ No barrel imports             | Direct component file imports            |
| ✅ No sequential awaits          | `Promise.all()` for independent calls    |

---

## 🛠️ Skills to Invoke for Frontend Work

When implementing or reviewing UI, invoke the appropriate skill:

| Task                                                  | Skill to use                   |
| ----------------------------------------------------- | ------------------------------ |
| Designing new pages, components, or design systems    | `#ui-ux-pro-max`               |
| Reviewing UI code for accessibility & UX compliance   | `#web-design-guidelines`       |
| Writing or reviewing React components for performance | `#vercel-react-best-practices` |
| E2E test for a user flow                              | `#playwright-generate-test`    |

> **Default**: For any new feature touching the frontend, run `#web-design-guidelines` on the changed files and `#vercel-react-best-practices` mental-model check before marking the task done.
