# Phase 12: Detailed Task Breakdowns

## Overview

Phase 12 focuses on completing deferred features from Phases 1-11 and validating production deployment. Two critical workstreams:

1. **Workstream 1: Announcement System Polish** (20-27 hours)
2. **Workstream 4: Deployment Validation** (11-16 hours)

**Total Effort**: 31-43 hours | **Timeline**: 2-3 weeks at 8 hrs/day

---

## Workstream 1: Announcement System Polish (20-27 hours)

Complete announcement features to production-ready status. All backend support exists; frontend needs enhancement.

### Prerequisites

- Tiptap already installed in frontend/package.json ✅
- Draft system already in database schema ✅
- AnnouncementForm component exists ✅

---

## Task 12.1.1: Replace SimpleTextEditor with Tiptap Rich Text Editor (6-8 hours)

**Objective**: Replace plain textarea with Tiptap editor to enable formatting (bold, italic, lists, links, etc.)

**Why**: Users need formatting options for professional announcements; Tiptap is already installed and is industry-standard.

**Current State**:

- `frontend/src/components/editor/SimpleTextEditor.tsx` is a basic textarea
- AnnouncementForm imports SimpleTextEditor
- No formatting support currently

**Implementation Steps**:

### Step 1: Create new RichTextEditor component (2 hours)

**File**: `frontend/src/components/editor/RichTextEditor.tsx` (NEW)

Replace SimpleTextEditor with Tiptap-based editor with:

- Use `@tiptap/react` + `@tiptap/starter-kit`
- Configure extensions: paragraph, heading, bold, italic, bullet list, ordered list, code block, blockquote, link
- Add placeholder text
- Support character counter (5000 max)
- Output as HTML (not markdown)
- Accept `disabled` prop

**Code pattern**:

```tsx
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

export function RichTextEditor({ content, onChange, placeholder, disabled }) {
  const editor = useEditor({
    extensions: [StarterKit, Link, Placeholder.configure({ placeholder })],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editable: !disabled,
  });

  return <EditorContent editor={editor} className="..." />;
}
```

### Step 2: Update AnnouncementForm to use RichTextEditor (1 hour)

**File**: `frontend/src/components/features/announcements/AnnouncementForm.tsx`

- Change import from SimpleTextEditor to RichTextEditor
- Add toolbar buttons above editor (Optional: bold, italic, link buttons)
- Update character counter to count from HTML text content (use `DOMParser` to strip tags)
- Update placeholder text
- Add help text: "You can use **bold**, _italic_, links, and lists"

### Step 3: Add styling for rich text editor (1 hour)

**File**: `frontend/src/components/editor/RichTextEditor.tsx`

Style `.ProseMirror` container (Tiptap's editor div class):

- Border, padding, rounded corners matching shadcn/ui
- Style nested elements (lists, blockquotes, code blocks)
- Add focus states
- Ensure dark mode compatible

### Step 4: Update API types for announcement content (0.5 hours)

**File**: `frontend/src/types/api.ts`

Ensure Announcement type allows HTML content (already should). Document that content can now be HTML.

### Step 5: Migrate existing plain text announcements (0.5 hours)

**File**: `backend/src/application/useCases/createAnnouncement.ts`

No change needed — backend accepts any string content. Plain text announcements automatically work with RTE.

**Files Modified**:

- ✏️ `frontend/src/components/editor/SimpleTextEditor.tsx` — Deprecate (keep for safety)
- ✏️ `frontend/src/components/features/announcements/AnnouncementForm.tsx`
- 📝 `frontend/src/components/editor/RichTextEditor.tsx` — NEW

**Testing Checklist**:

- [ ] RichTextEditor renders without errors
- [ ] Content persists when typing
- [ ] Formatting buttons work (bold, italic, links, lists)
- [ ] Character counter works accurately
- [ ] HTML output is valid and sanitized on backend
- [ ] Editor works in create and edit modes
- [ ] Disabled state works
- [ ] Paste plain text into editor works

**Effort**: 6-8 hours

---

## Task 12.1.2: Implement Draft System (Save-Before-Publish Toggle) (4-5 hours)

**Objective**: Ensure draft announcements can be saved, edited, and later published without changing any other code.

**Current State**:

- Database schema has `isDraft` field ✅
- Backend use cases support `isDraft` parameter ✅
- AnnouncementForm has draft toggle ✅
- Frontend service has draft parameter ✅
- **Gap**: UI doesn't distinguish drafts from published; no "publish draft" action

**Implementation Steps**:

### Step 1: Update AnnouncementsPage to show drafts section (1.5 hours)

**File**: `frontend/src/pages/app/announcements/AnnouncementsPage.tsx`

- Add filter tabs: "Active" | "Archived" | "Drafts" (admin only)
- Query API with `isDraft=true` filter for draft section
- Display drafts with visual badge ("Draft" label in top-right of AnnouncementCard)
- Only show "Drafts" tab if user is ADMIN/STAFF

**API call pattern**:

```ts
const { announcements } = useAnnouncements(
  archived: boolean,
  isDraft: boolean,  // NEW parameter
  page, limit
);
```

### Step 2: Update useAnnouncements hook to support draft filtering (0.5 hours)

**File**: `frontend/src/hooks/useAnnouncements.ts`

- Add `isDraft` parameter to query
- Pass to API endpoint: `/announcements?isDraft=true&archived=false`

### Step 3: Update AnnouncementCard to show draft badge (0.5 hours)

**File**: `frontend/src/components/features/announcements/AnnouncementCard.tsx`

- Accept optional `isDraft?: boolean` prop
- Add badge if `isDraft === true`: "Draft" label with gray background
- Display in top-right corner below/next to priority badge

### Step 4: Add "Publish Draft" action in edit mode (1 hour)

**File**: `frontend/src/pages/app/announcements/AnnouncementEditPage.tsx`

If viewing a draft:

- Show button: "Publish This Draft" (in addition to "Save Draft")
- Clicking "Publish" sets `isDraft: false` and submits
- Redirect to published announcement detail page
- Show success toast: "Announcement published!"

### Step 5: Backend: Ensure GET /announcements filters correctly (0.5 hours)

**File**: `backend/src/presentation/controllers/announcementController.ts`

Verify query parameter `isDraft` is supported in getAnnouncements(). Should already exist from Phase 6.

### Step 6: Update AnnouncementForm submit logic (1 hour)

**File**: `frontend/src/components/features/announcements/AnnouncementForm.tsx`

When isDraft toggle is ON:

- Button label: "Save Draft" (not "Create Announcement")
- Show message: "This will save as draft — not published yet"

When isDraft toggle is OFF:

- Button label: "Publish Announcement"
- If priority is URGENT, show: "Email notifications will be sent to all members"

**Files Modified**:

- ✏️ `frontend/src/pages/app/announcements/AnnouncementsPage.tsx`
- ✏️ `frontend/src/hooks/useAnnouncements.ts`
- ✏️ `frontend/src/components/features/announcements/AnnouncementCard.tsx`
- ✏️ `frontend/src/pages/app/announcements/AnnouncementEditPage.tsx`
- ✏️ `frontend/src/components/features/announcements/AnnouncementForm.tsx`

**Testing Checklist**:

- [ ] Save announcement as draft → redirect to drafts
- [ ] View draft in "Drafts" tab → shows "Draft" badge
- [ ] Edit draft → can toggle to publish
- [ ] Publish draft → removed from drafts, appears in active announcements
- [ ] Published announcements never show draft badge
- [ ] Draft toggle button shows correct hint text
- [ ] Drafts don't send emails even if URGENT

**Effort**: 4-5 hours

---

## Task 12.1.3: Add Date Picker UI for Announcement Form (3-4 hours)

**Objective**: Frontend UI to support date range filtering (backend already supports this).

**Current State**:

- Backend supports date range queries
- Frontend doesn't expose date range picker in UI

**Decision**: This is **OPTIONAL** because:

- Date range filtering is a convenience feature, not core functionality
- Most churches don't need it
- Effort: 3-4 hours vs. other high-value items

**Recommendation**: **DEFER TO PHASE 13** unless you specifically need to filter announcements by date range.

If implementing Now:

### Step 1: Add date-range inputs to AnnouncementsPage filter section (1.5 hours)

Use shadcn/ui `<Input type="date">` or install a date picker library.
Add "From" date and "To" date inputs. Pass to useAnnouncements hook.

### Step 2: Update useAnnouncements to accept date filters (1 hour)

Query: `/announcements?from=2025-02-01&to=2025-02-28`
Parse and validate dates before sending.

### Step 3: Backend verification (0.5 hours)

Confirm GET /announcements accepts `from` and `to` query params.
If not, add them to controller.

**Recommendation**: **DEFER FOR NOW** (not critical for MVP)

---

## Task 12.1.4: Add Unarchive Button to AdminAnnouncementsPage (2-3 hours)

**Objective**: Allow admins to restore archived announcements (reverse the archive action).

**Current State**:

- AdminAnnouncementsPage exists with archive toggle
- Archive logic exists
- **Gap**: Unarchive button not visible in UI

**Implementation Steps**:

### Step 1: Update AdminAnnouncementsPage archived view (1 hour)

**File**: `frontend/src/pages/admin/AdminAnnouncementsPage.tsx`

- Show "Archived Announcements" tab/section
- Add "Unarchive" button alongside delete button
- Button click calls `announcementService.unarchiveAnnouncement(id)`
- Only show "Drafts" tab if user is ADMIN/STAFF

### Step 2: Implement unarchiveAnnouncement API method (0.5 hours)

**File**: `frontend/src/services/endpoints/announcementService.ts`

Add method:

```ts
async unarchiveAnnouncement(id: string): Promise<Announcement> {
  return apiClient.patch(`/announcements/${id}/unarchive`, {});
}
```

### Step 3: Implement backend PATCH /announcements/:id/unarchive endpoint (0.5 hours)

**File**: `backend/src/presentation/controllers/announcementController.ts`

- Add method: `unarchiveAnnouncement()`
- Set `archivedAt` to null
- Require ADMIN/STAFF role

### Step 4: Update announcementRoutes (0.5 hours)

**File**: `backend/src/presentation/routes/announcementRoutes.ts`

Add route: `PATCH /api/v1/announcements/:id/unarchive` → unarchiveAnnouncement controller

### Step 5: Update backend use case (Optional)

**File**: `backend/src/application/useCases/unarchiveAnnouncement.ts` — If doesn't exist, create it

**Files Modified**:

- ✏️ `frontend/src/pages/admin/AdminAnnouncementsPage.tsx`
- ✏️ `frontend/src/services/endpoints/announcementService.ts`
- ✏️ `backend/src/presentation/controllers/announcementController.ts`
- ✏️ `backend/src/presentation/routes/announcementRoutes.ts`
- 📝 `backend/src/application/useCases/unarchiveAnnouncement.ts` — If needed

**Testing Checklist**:

- [ ] Admin can see archived announcements in separate view
- [ ] Unarchive button appears for archived items
- [ ] Clicking unarchive restores to active announcements
- [ ] Restored announcement appears in "Active" tab
- [ ] Non-admin users cannot unarchive (403 error)

**Effort**: 2-3 hours

---

## Task 12.1.5: Write Missing AnnouncementForm Component Tests (3-4 hours)

**Objective**: Complete test suite for AnnouncementForm component (Phase 6 tests had ResizeObserver issues).

**Current State**:

- AnnouncementForm tests exist but have ResizeObserver mock issues
- Rich text editor tests needed

**Implementation Steps**:

### Step 1: Fix ResizeObserver mock in test setup (0.5 hours)

**File**: `frontend/tests/setup.ts` or `frontend/tests/unit/components/announcements/AnnouncementForm.test.tsx`

Add to setup or test file:

```ts
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
```

### Step 2: Write AnnouncementForm component tests (2.5 hours)

**File**: `frontend/tests/unit/components/announcements/AnnouncementForm.test.tsx`

Test cases:

- Renders with initial data
- Renders empty with no initial data
- Title validation: min/max length feedback
- Content validation: required field
- Priority options: NORMAL and URGENT radio buttons
- Draft toggle: changes button label
- Submit with valid data
- Submit with invalid data shows error
- Error alert displays server errors
- Cancel button calls onCancel prop
- Disabled state shows spinner
- Character counter updates

### Step 3: Write RichTextEditor unit tests (1 hour)

**File**: `frontend/tests/unit/components/editor/RichTextEditor.test.tsx` — NEW

Test cases:

- Renders editor
- Content change triggers onChange
- Bold/italic/link formatting works
- Disabled state works
- Character counter

**Files Created/Modified**:

- 📝 `frontend/tests/unit/components/editor/RichTextEditor.test.tsx` — NEW
- ✏️ `frontend/tests/unit/components/announcements/AnnouncementForm.test.tsx`
- ✏️ `frontend/tests/setup.ts` — Add ResizeObserver mock if not present

**Testing Command**:

```bash
cd frontend
npm test -- AnnouncementForm.test.tsx --no-coverage
```

**Verify**: All tests pass (target: 15+ tests, 100% pass rate)

**Effort**: 3-4 hours

---

## Task 12.1.6: Load Test Announcement Endpoints (T216) (2-3 hours)

**Objective**: Verify announcement system can handle concurrent create, read, update operations under load.

**Current State**:

- Phase 5 load tests exist for events
- Announcement load tests deferred in tasks.md
- System should handle 100+ concurrent users

**Implementation Steps**:

### Step 1: Create load test file (1.5 hours)

**File**: `backend/tests/performance/announcementLoad.test.ts` — NEW

Use autocannon library. Test scenarios:

**Scenario 1**: 50 concurrent users browsing announcements (GET /api/v1/announcements)

- Success rate: 100%, P95 < 100ms

**Scenario 2**: 20 concurrent users creating announcements (POST /api/v1/announcements)

- Success rate: 100%, response < 200ms

**Scenario 3**: 30s sustained load with mixed operations

- GET (60%), POST draft (20%), PATCH (20%)

**Scenario 4**: Urgent announcements (triggers email)

- 5 concurrent URGENT creates
- Email notifications don't block response

**Code pattern**:

```ts
import autocannon from "autocannon";

test("Announcement browsing load test", async () => {
  const result = await autocannon({
    url: "http://localhost:3000/api/v1/announcements",
    connections: 50,
    duration: 10,
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(result.errors).toBe(0);
  expect(result.throughput.average).toBeGreaterThan(100);
});
```

### Step 2: Run load tests (0.5 hours)

Execute: `npm run test:performance -- announcementLoad.test.ts`
Document baseline metrics in `backend/docs/PERFORMANCE.md`
Record: throughput, latency, error rate

### Step 3: Analyze and document results (1 hour)

Update PERFORMANCE.md with announcement metrics.
Compare to Phase 5 event benchmarks.
Identify any bottlenecks.
Document scale limits.

**Files Created/Modified**:

- 📝 `backend/tests/performance/announcementLoad.test.ts` — NEW
- ✏️ `backend/docs/PERFORMANCE.md` — Add announcement metrics

**Success Criteria**:

- [ ] All load tests pass
- [ ] P95 latency < 150ms
- [ ] Error rate 0%
- [ ] Metrics documented

**Effort**: 2-3 hours

---

## Summary: Workstream 1

| Task                     | Hours     | Priority | Difficulty |
| ------------------------ | --------- | -------- | ---------- |
| 12.1.1: Rich text editor | 6-8       | HIGH     | Medium     |
| 12.1.2: Draft system     | 4-5       | HIGH     | Medium     |
| 12.1.3: Date picker UI   | 3-4       | LOW      | Easy       |
| 12.1.4: Unarchive button | 2-3       | MEDIUM   | Easy       |
| 12.1.5: Component tests  | 3-4       | MEDIUM   | Medium     |
| 12.1.6: Load tests       | 2-3       | MEDIUM   | Easy       |
| **TOTAL**                | **20-27** |          |            |

**Recommended Execution Order**:

1. Task 12.1.1 (Rich text editor) — enables Task 12.1.2
2. Task 12.1.2 (Draft system) — high value, unblock publishing features
3. Task 12.1.4 (Unarchive button) — quick win
4. Task 12.1.5 (Tests) — ensure quality
5. Task 12.1.6 (Load test) — validation
6. Task 12.1.3 (Date picker) — LOW priority, defer if time-constrained

---

## Workstream 4: Deployment Validation (11-16 hours)

Moving to production deployment validation.

---

## Task 12.4.1: Test Local Docker Build & Deployment (3-4 hours)

**Objective**: Verify Docker images build successfully and containers run end-to-end.

**Current State**:

- Docker Compose files exist (`docker-compose.yml`, `docker-compose.prod.yml`)
- Backend and frontend Dockerfiles exist
- Never been tested in production scenario

**Prerequisites**:

- Docker Desktop installed and running
- PostgreSQL installed locally (for .env setup)
- .env files configured with real values

**Implementation Steps**:

### Step 1: Create production .env file (0.5 hours)

**File**: `backend/.env.production`

Copy from `backend/.env.example`.
Set real values for:

- `DATABASE_URL=postgresql://user:pass@localhost:5432/church_app_prod`
- `JWT_SECRET=<generate from scripts/generate-secrets.sh>`
- `REFRESH_TOKEN_SECRET=<generate>`
- `SMTP_*=<your email service>`
- All other required vars

**Do NOT commit** `.env.production` file (already in .gitignore).

### Step 2: Build backend Docker image (1 hour)

**File**: `backend/Dockerfile`

Run: `docker build -t church-app-backend:latest -f backend/Dockerfile .`
Verify: `docker images | grep church-app-backend`
Test image runs: `docker run --rm church-app-backend:latest npm --version`

### Step 3: Build frontend Docker image (1 hour)

**File**: `frontend/Dockerfile`

Run: `docker build -t church-app-frontend:latest -f frontend/Dockerfile .`
Verify: `docker images | grep church-app-frontend`
Test image: `docker run --rm -p 8080:80 church-app-frontend:latest`

### Step 4: Test docker-compose.yml locally (1-1.5 hours)

**File**: `docker-compose.yml`

Set `ENVIRONMENT=production` in compose file (temporary for testing).
Run: `docker-compose -f docker-compose.yml up -d`
Wait 30 seconds for services to start.

Verify services:

```bash
docker-compose ps  # Should show: backend, frontend, postgres, redis all running
```

Test connectivity:

- Backend health: `curl http://localhost:3000/health`
- Frontend: `curl http://localhost:80` → should return HTML
- API endpoint: `curl http://localhost:3000/api/v1/announcements` → may be 401 if auth required

Check logs: `docker-compose logs backend` (look for errors)
Cleanup: `docker-compose down -v`

**Files Modified**:

- ✏️ `docker-compose.yml` — Verify all services configured
- ✏️ `backend/.env.production` — NEW (gitignored)
- 📄 `backend/Dockerfile` — Verify exists and correct
- 📄 `frontend/Dockerfile` — Verify exists and correct

**Success Criteria**:

- [ ] Backend Docker image builds without errors
- [ ] Frontend Docker image builds without errors
- [ ] docker-compose up runs all services
- [ ] Health check returns 200 OK
- [ ] Frontend responds on port 80
- [ ] No critical errors in logs

**Effort**: 3-4 hours

---

## Task 12.4.2: Validate Kubernetes Manifests (2-3 hours)

**Objective**: Verify K8s configs are syntactically correct and deployable.

**Current State**:

- K8s manifests exist in `k8s/deployment.yaml`
- Never been tested with kubectl

**Prerequisites**:

- minikube or local Kubernetes cluster running (or just validate syntax)
- kubectl CLI installed

**Implementation Steps**:

### Step 1: Validate K8s YAML syntax (0.5 hours)

Run: `kubectl apply -f k8s/ --dry-run=client -o yaml`
Fix any YAML validation errors.
Verify all manifests parse correctly.

### Step 2: Review deployment manifests (1 hour)

**File**: `k8s/deployment.yaml`

Checklist:

- [ ] Backend deployment uses correct image: `church-app-backend:latest`
- [ ] Frontend deployment uses correct image: `church-app-frontend:nginx`
- [ ] Resources requests/limits are reasonable (CPU: 100m-500m, Memory: 128Mi-512Mi)
- [ ] Health checks configured (liveness & readiness probes)
- [ ] Environment variables match .env
- [ ] Service ports exposed (backend: 3000, frontend: 80)
- [ ] Ingress configured if needed (optional)
- [ ] ConfigMap/Secrets referenced correctly

### Step 3: Test dry-run deployment (0.5 hours)

If minikube available: `kubectl apply -f k8s/ --dry-run=client`
If not available: Just validate YAML structure.

### Step 4: Document deployment commands (0.5 hours)

**File**: `docs/KUBERNETES.md` — NEW or update `docs/DEPLOYMENT.md`

Add: Step-by-step kubectl commands to deploy.
Add: How to check logs, scale, rollback.
Add: Monitoring URLs.

**Files Modified/Created**:

- ✏️ `k8s/deployment.yaml` — Fix any issues found
- 📝 `docs/KUBERNETES.md` — NEW deployment guide

**Success Criteria**:

- [ ] YAML validates without errors
- [ ] All images referenced correctly
- [ ] Resources configured
- [ ] Health checks in place
- [ ] Deployment docs complete

**Effort**: 2-3 hours

---

## Task 12.4.3: Test GitHub Actions CI/CD Pipeline (2-3 hours)

**Objective**: Verify workflow runs successfully, builds images, and would deploy.

**Current State**:

- CI/CD pipeline defined in `.github/workflows/ci-cd.yml`
- Never been executed in real GitHub environment (or untested recently)

**Implementation Steps**:

### Step 1: Review GitHub Actions workflow (0.5 hours)

**File**: `.github/workflows/ci-cd.yml`

Check steps:

- [ ] Checkout code
- [ ] Setup Node.js
- [ ] Install dependencies (backend + frontend)
- [ ] Run linting
- [ ] Run tests
- [ ] Build Docker images
- [ ] Push to registry (DockerHub or GitHub Container Registry)
- [ ] Deploy to staging/production (if configured)

### Step 2: Set up GitHub secrets (if needed) (0.5 hours)

Go to repository Settings → Secrets and variables → Actions.
Add secrets (if not already present):

- `DOCKER_USERNAME` — DockerHub username
- `DOCKER_PASSWORD` — DockerHub token
- `RENDER_API_KEY` — For Render.com deployment
- `DATABASE_URL` — Production database URL
- Others as needed per workflow

### Step 3: Trigger workflow manually (1 hour)

Push code to a branch (or use GitHub UI to trigger).
Watch workflow run in Actions tab.
Check for errors/warnings.
Record execution time (target: < 15 minutes).
Download logs if failures occur.

### Step 4: Fix workflow issues (0.5 hours)

Common issues:

- Missing secrets → add to GitHub Secrets
- Node version mismatch → update `node-version` in workflow
- Test failures → fix failing tests before CI
- Image build errors → check Dockerfile syntax

Re-trigger workflow after fixes.

### Step 5: Document CI/CD process (0.5 hours)

**File**: `docs/CI-CD.md` — NEW or update `README.md`

Add: How to trigger deployments.
Add: How to rollback.
Add: Secrets required.
Add: Monitoring deployment status.

**Files Modified/Created**:

- ✏️ `.github/workflows/ci-cd.yml` — Fix if needed
- 📝 `docs/CI-CD.md` — NEW documentation
- 🔐 GitHub Secrets configured

**Success Criteria**:

- [ ] Workflow executes without errors
- [ ] All tests pass in CI
- [ ] Docker images build successfully
- [ ] Pipeline execution < 15 minutes
- [ ] Ready for deployment step

**Effort**: 2-3 hours

---

## Task 12.4.4: Set Up Staging Deployment on Render.com (3-4 hours)

**Objective**: Deploy to staging environment on Render to validate production config before going live.

**Current State**:

- Render.com has been configured (`render.yaml` exists)
- Staging environment not yet deployed
- Production not yet deployed

**Prerequisites**:

- Render.com account created
- GitHub repo connected to Render
- render.yaml configured

**Implementation Steps**:

### Step 1: Create Render services (1.5 hours)

Go to Render Dashboard.

Create **Web Service** for backend:

- Name: `church-app-backend-staging`
- Source: GitHub repo
- Branch: `main` (for staging)
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Environment: PostgreSQL (Neon), Redis, etc.

Create **Web Service** for frontend:

- Name: `church-app-frontend-staging`
- Build command: `npm install && npm run build`
- Start command: Serve `dist/` folder with nginx

Create **PostgreSQL** database:

- Name: `church-app-staging-db`
- Keep default settings

Create **Redis** instance (if used):

- Name: `church-app-staging-redis`

### Step 2: Configure environment variables in Render (1 hour)

For **backend service**:

- Go to Service → Environment
- Add all secrets from `backend/.env.example`
- CRITICAL: Use Render PostgreSQL URL, not local
- Set `NODE_ENV=staging`
- Set `CORS_ORIGINS=https://<frontend-staging-url>`

For **frontend service**:

- Add: `VITE_API_URL=https://<backend-staging-url>/api/v1`
- Set `NODE_ENV=staging`

### Step 3: Run database migrations on staging (0.5 hours)

Once backend service is up, run migrations:

```bash
# Via Render dashboard "Jobs" tab:
npx prisma migrate deploy
npx prisma db seed
```

Verify database has tables: Check Render PostgreSQL connection.

### Step 4: Validate staging deployment (1 hour)

**Frontend URL**: `https://<app-name>.onrender.com`

- [ ] Page loads without errors
- [ ] Navigation works
- [ ] Styling loads correctly

**Backend URL**: `https://<app-name>.onrender.com/api/v1`

- [ ] Health check: `GET /health` → 200 OK
- [ ] API accessible: `GET /announcements` → returns data

**Database connectivity**:

- [ ] Backend database logs show successful connections
- [ ] Migrations applied successfully

**Logs**:

- [ ] Check Render dashboard logs for errors
- [ ] Check Sentry for exceptions (if configured)

### Step 5: Document staging access (0.5 hours)

**File**: `docs/STAGING.md` — NEW

Add: Staging URLs
Add: How to deploy to staging (git push or GitHub Actions trigger)
Add: How to monitor staging
Add: How to rollback

**Files Modified/Created**:

- ✏️ `render.yaml` — Update if needed for staging blueprint
- 📝 `docs/STAGING.md` — NEW
- 🔐 Render environment variables configured

**Success Criteria**:

- [ ] Backend service running on Render
- [ ] Frontend service running on Render
- [ ] Health check passes
- [ ] Database migrations applied
- [ ] Frontend loads CSS/JS correctly
- [ ] No critical errors in logs

**Effort**: 3-4 hours

---

## Task 12.4.5: Execute Validation Checklist (1-2 hours)

**Objective**: Perform manual end-to-end testing on staging to validate full user flows work.

**Current State**:

- All features implemented in Phase 1-11
- Never tested in production-like environment

**Manual Testing Flows** (Execute on staging):

| #   | Flow                           | Steps                                                            | Expected Result                                       |
| --- | ------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | **Landing Page**               | Visit `/` → view page → scroll → see all sections                | Page loads, images load, responsive                   |
| 2   | **Register Member**            | Go to `/` → click register → fill form → submit                  | Account created, redirect to login                    |
| 3   | **Login**                      | Login with test credentials                                      | Token received, redirected to `/app/dashboard`        |
| 4   | **Dashboard**                  | View `/app/dashboard` → see widgets                              | Stats, upcoming events, announcements display         |
| 5   | **View Events**                | Go to `/app/events` → list loads → click event → detail shows    | Event data displays, RSVP button works                |
| 6   | **RSVP to Event**              | Click RSVP button → confirm → verify list updates                | Attendance count increases, confirm notification      |
| 7   | **View Announcements**         | Go to `/app/announcements` → see list → click one → detail loads | Announcement displays, priority badge shows           |
| 8   | **Send Message**               | Go to `/app/messages` → compose → send to another member         | Message appears in recipient inbox, notification sent |
| 9   | **Admin: Create Event**        | As admin, go `/app/admin/events` → create → publish              | Event appears in public calendar                      |
| 10  | **Admin: Create Announcement** | As admin, create urgent announcement → verify email sent         | Members receive email, appears on dashboard           |
| 11  | **Admin: Manage Members**      | Go `/app/admin/members` → view list → create new → delete test   | CRUD operations work, invitations sent                |
| 12  | **MFA Enrollment**             | As admin, enable MFA → scan QR → verify code → login with MFA    | Successful login with TOTP                            |
| 13  | **Mobile Responsive**          | View all pages on mobile (360px, 768px, 1024px width)            | Layout adapts, no horizontal scroll                   |
| 14  | **Error Handling**             | Try error scenarios: invalid login, expired token, 404 page      | Graceful error messages, redirects work               |
| 15  | **Performance**                | Use DevTools → measure page load, LCP, FCP                       | Load < 3s, LCP < 2.5s on 3G                           |

**Implementation Steps**:

### Step 1: Create test script (0.5 hours)

**File**: `tests/STAGING_VALIDATION.md` — NEW

List all flows above with pass/fail checkboxes.
Add screenshots/notes column.

### Step 2: Execute testing (0.5-1 hour)

Go through each flow.
Record pass/fail.
Screenshot any failures.
Note: Will find real issues that automation misses.

### Step 3: Document results (0.5 hours)

**File**: `STAGING_TEST_RESULTS.md` — NEW

Record date, tester, findings.
Identify blockers (must fix before production).
Identify nice-to-haves (can fix later).

**Success Criteria**:

- [ ] All 15 flows pass
- [ ] No critical blockers
- [ ] Performance acceptable
- [ ] Mobile experience good

**Effort**: 1-2 hours

---

## Summary: Workstream 4

| Task                       | Hours     | Prereq             | Blocker if fails |
| -------------------------- | --------- | ------------------ | ---------------- |
| 12.4.1: Docker build       | 3-4       | Docker Desktop     | YES              |
| 12.4.2: K8s validation     | 2-3       | kubectl (optional) | NO               |
| 12.4.3: CI/CD pipeline     | 2-3       | GitHub Actions     | YES              |
| 12.4.4: Staging deploy     | 3-4       | Render account     | YES              |
| 12.4.5: Validation testing | 1-2       | Staging live       | YES              |
| **TOTAL**                  | **11-16** |                    |                  |

**Execution Order** (Sequential — each depends on previous):

1. Task 12.4.1 (Docker) ← Must pass first
2. Task 12.4.3 (CI/CD) ← Automates Docker builds
3. Task 12.4.2 (K8s) ← Optional, can run parallel
4. Task 12.4.4 (Staging) ← Deploys Docker images
5. Task 12.4.5 (Validation) ← Tests staging

---

## Overall Phase 12 Timeline

**Total Effort**: 31-43 hours of work

**Recommended Schedule** (Assuming 8 hours/day):

- **Week 1** (Mon-Wed): Workstream 1 → Rich text + Draft system (12-15 hours)
- **Week 1** (Thu-Fri) + **Week 2** (Mon-Tue): Workstream 4 → Docker + Staging (11-16 hours)
- **Week 2** (Wed-Fri): Workstream 1 → Polish + Tests (8-12 hours) + **Workstream 4** Validation (2 hours)

**Parallel Work Possible**:

- Workstream 1 tasks are independent (can do in any order)
- Workstream 4 tasks are dependent (must be sequential)
- Can work on WS1 while WS4 stages deploy (e.g., deploy runs, write tests while waiting)

---

## Key Decisions Before Starting

1. **Rich Text Editor**: Implement now or defer?
   - **Recommend**: NOW (6-8 hours, massive UX improvement)

2. **Date Picker UI**: Include or defer?
   - **Recommend**: DEFER (backend ready, UI can wait)

3. **Staging on Render vs. Self-hosted?**
   - **Current decision**: Render (easiest, already configured)
   - **Alternative**: Docker Compose on own server (requires more ops)

4. **Test coverage target**: 90% or 85%?
   - **Recommend**: 85% (good enough, tests in Workstream 1 should get there)

5. **Timeline**: When must production be live?
   - **If < 4 weeks**: Do Workstream 4 FIRST (deployment), then Workstream 1 (features)
   - **If > 4 weeks**: Do Workstream 1 FIRST (quality), then Workstream 4

---

## Appendix: Quick Reference

### Files to Watch

- `frontend/src/components/editor/RichTextEditor.tsx` — NEW
- `frontend/src/components/features/announcements/AnnouncementForm.tsx` — Major changes
- `backend/Dockerfile`, `frontend/Dockerfile` — Docker builds
- `docker-compose.yml` — Container orchestration
- `.github/workflows/ci-cd.yml` — CI/CD automation
- `k8s/deployment.yaml` — Kubernetes manifests
- `render.yaml` — Render.com blueprint

### Commands to Execute

```bash
# Frontend
npm test -- AnnouncementForm.test.tsx --no-coverage
npm run build

# Backend
npm run test:performance -- announcementLoad.test.ts
npm run build

# Docker
docker build -t church-app-backend:latest -f backend/Dockerfile .
docker build -t church-app-frontend:latest -f frontend/Dockerfile .
docker-compose up -d

# Kubernetes
kubectl apply -f k8s/ --dry-run=client -o yaml

# GitHub Actions
git push origin <branch>  # Trigger workflow
```

### Testing Commands

```bash
# Feature tests
npm test -- --testPathPattern="Announcement" --no-coverage

# Performance
npm run test:performance -- announcementLoad.test.ts

# E2E
npx playwright test tests/e2e/announcements.spec.ts
```

---

## Next Steps After Phase 12

Once Phase 12 is complete:

1. Transition to **Phase 13 - New Major Features** (Sermon Management, Newsletter, or LMS)
2. OR continue with **Production Hardening** (monitoring, scaling, disaster recovery)
3. OR shift to **Marketing & Deployment** (go-live planning, user training, support)

Recommend Phase 13 focus on **Sermon Management** (high ROI, natural fit with landing page).
