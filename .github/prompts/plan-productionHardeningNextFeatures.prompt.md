# Plan: Production Hardening & Next Features

Your app is impressively complete — all 11 phases done, 363/382 tasks, and already deployed. After a thorough analysis of every layer (backend, frontend, tests, infra, specs), here's what I found and recommend tackling in two waves.

---

**TL;DR**: The codebase has 9 TODO stubs returning dummy data, a dead `/register` placeholder visible to users, an orphaned `user_sessions` table, several Clean Architecture violations (analytics/push/contact bypass use cases), an outdated OpenAPI spec, and 32/39 use cases lacking unit tests. Fix these to harden the production app, then layer on a calendar view, proper email templates, and real session tracking as new capabilities.

---

## Wave 1 — Production Hardening (fix what's live)

### Step 1: Remove the `/register` placeholder

The route at `/register` in [App.tsx](frontend/src/App.tsx) still renders a "Phase 4 coming soon" stub visible to real users. Since registration is admin-only, remove the route entirely or redirect to `/login` with a "Contact your administrator" message. Also remove the inline `RegisterPage` component.

### Step 2: Fix dashboard dummy data (3 TODOs)

[getMemberDashboard.ts](backend/src/application/useCases/getMemberDashboard.ts) returns hardcoded values at lines 94, 107, and 128:

- `rsvpStatus: undefined` — wire up actual RSVP lookup via `IEventRSVPRepository`
- `isRead: false` — wire up announcement view tracking via the `member_announcement_views` table
- `myRsvpCount: 0` — query actual RSVP count for the member

These are user-facing data gaps on the dashboard.

### Step 3: Implement MemberDirectory bulk operations (4 TODOs)

[MemberDirectoryPage.tsx](frontend/src/pages/app/members/MemberDirectoryPage.tsx) has 4 stub handlers at lines 82-100:

- Bulk email (needs backend endpoint or email service integration)
- Bulk status change (needs admin endpoint)
- Export members (backend `/admin/export/members` already exists — just wire it up)
- Export with filters (same backend endpoint with query params)

The export ones are quick wins since the backend already supports them.

### Step 4: Fix hardcoded analytics metric

The engagement analytics endpoint returns `averageSessionDuration: 12` as a hardcoded constant despite a `user_sessions` table existing in the Prisma schema. Either:

- Implement actual session tracking (create sessions on login, end on logout/timeout, query for the metric), or
- Remove the misleading metric until it's real

### Step 5: Clean up architecture violations

Several routes bypass the controller→use-case pattern, talking directly to Prisma or infrastructure services:

- **Analytics routes** ([analyticsRoutes.ts](backend/src/presentation/routes/analyticsRoutes.ts)) — extract into use cases like `GetDashboardAnalytics`, `GetMemberGrowth`, etc.
- **Push notification routes** ([pushRoutes.ts](backend/src/presentation/routes/pushRoutes.ts)) — add domain entity `PushSubscription`, interface `IPushSubscriptionRepository`, and proper use cases
- **Contact routes** ([contactRoutes.ts](backend/src/presentation/routes/contactRoutes.ts)) — already uses `contactService` but should follow controller pattern
- **Report/Upload routes** — same pattern: extract to controllers + use cases

This isn't urgent for functionality but matters for maintainability and consistency.

### Step 6: Activate `user_sessions` table

The `user_sessions` model is defined in [schema.prisma](backend/prisma/schema.prisma) with `sessionStart`, `sessionEnd`, `duration`, `userAgent`, `ipAddress` but **no code anywhere creates or reads sessions**. Implement:

- Create session record on successful login (in `authenticateUser` use case)
- End session on logout (in `logoutUser` use case)
- Query sessions for the analytics `averageSessionDuration` metric
- This also fixes the [logoutUser.ts](backend/src/application/useCases/logoutUser.ts) TODO at line 43 about refresh token storage

### Step 7: Update OpenAPI spec

[openapi.yaml](specs/001-full-stack-web/contracts/openapi.yaml) only covers the original 5 resource endpoints. It's missing 40+ endpoints added in Phases 8-11: MFA, admin, analytics, push notifications, reports, uploads, health checks, contact forms, bulk announcement operations. Update the spec to match reality — this is critical for contract tests and API documentation.

### Step 8: Fill unit test gaps (prioritized)

32 of 39 use cases have no dedicated unit tests. Prioritize by risk:

- **High priority**: `resetPassword` (noted as <25% coverage), `requestPasswordReset`, `enrollMFA`, `verifyMFACode` — security-critical paths
- **Medium priority**: `createAnnouncement`, `sendMessage`, `createMemberAccount` — write-path use cases
- **Low priority**: Read-path use cases already covered by contract/integration tests

### Step 9: Fix mock data in AdminAnalyticsPage

[AdminAnalyticsPage.tsx](frontend/src/pages/app/admin/AdminAnalyticsPage.tsx) uses `mockHeatMapData` (line 47) for the engagement heatmap. Either implement a real backend endpoint for activity heatmap data or remove the mock visualization so admins don't see fake data.

---

## Wave 2 — New Features

### Step 10: Event calendar view (deferred T151)

Currently events are only shown in list view. Add a calendar component (using the already-installed shadcn `calendar` component or a library like `react-big-calendar`) for both the public `/events` page and the authenticated `/app/events` page.

### Step 11: Proper email templates

The [templates/](backend/src/infrastructure/email/templates/) directory is empty — all 3 email types (password reset, urgent announcement, welcome) use inline HTML in [emailService.ts](backend/src/infrastructure/email/emailService.ts). Add:

- Extract to `.html` or `.hbs` template files with a template engine (Handlebars/EJS)
- Add missing templates: RSVP confirmation, event update notification, regular announcement notification, MFA setup confirmation
- Support for Thai/English email content

### Step 12: Expand real-time WebSocket usage

The [websocketClient.ts](frontend/src/services/websocket/websocketClient.ts) handles `message:new`, `announcement:new/urgent`, `event:update` but most frontend pages don't actively listen for these events. Wire up live updates in:

- Messages page (new message toast + auto-refresh)
- Announcements page (new announcement banner)
- Event detail page (RSVP count live update)

### Step 13: PWA enhancements

The service worker ([sw.js](frontend/public/sw.js)) is well-implemented with caching and push notifications. Enhance with:

- Background sync for offline form submissions (messages, RSVPs)
- Periodic background sync for data freshening
- App shortcuts in the manifest

---

## Verification

- **Wave 1**: Run `cd backend && npm test` — all 138+ tests should pass. Run `cd frontend && npm run build` — no build errors. Test the dashboard, member directory export, and analytics page manually to confirm real data replaces dummies.
- **Wave 2**: Add E2E tests for calendar view (`tests/e2e/event-calendar.spec.ts` already exists as a skeleton) and new email templates.

## Decisions

- **Registration**: Remove `/register` placeholder — admin-only creation is the intended flow
- **i18n**: Defer app-page localization — public pages already support Thai/English
- **Architecture cleanup**: Do incrementally alongside feature work rather than as a big-bang refactor
- **Test gaps**: Prioritize security-critical use cases over read-path ones already covered by contract tests
