# church_app Development Guidelines

**Church Management Application for Sing Buri Adventist Center**  
Last updated: 2026-02-04

## 🎯 Project Overview

Full-stack TypeScript web application using **Clean Architecture** with distinct domain/application/infrastructure layers. Features include member authentication with MFA, event management with RSVP, announcements, member directory, internal messaging, and real-time notifications.

## 🏗️ Architecture

### Backend: Clean Architecture Pattern

```
backend/src/
├── domain/           # Business entities & interfaces (Member, Event, Announcement)
│   ├── entities/     # Pure business objects with no dependencies
│   ├── interfaces/   # Repository contracts (IEventRepository, IMemberRepository)
│   └── valueObjects/ # Role, EventCategory, Priority enums
├── application/      # Use cases (createEvent, authenticateUser, rsvpToEvent)
│   └── useCases/     # Business logic implementation - single responsibility
├── infrastructure/   # External concerns (database, email, websocket, auth)
│   ├── database/     # Prisma repositories implementing domain interfaces
│   ├── auth/         # PasswordService, JWTService
│   ├── email/        # EmailService (nodemailer)
│   ├── websocket/    # WebSocketServer (Socket.io) for real-time features
│   └── storage/      # CloudinaryService for image uploads
└── presentation/     # Express controllers, routes, middleware
    ├── controllers/  # Thin controllers that call use cases
    ├── routes/       # RESTful API routes at /api/v1
    └── middleware/   # Auth, validation, rate limiting, error handling
```

**Key Pattern**: Controllers instantiate use cases with their dependencies, call `execute()`, and return responses. Use cases contain ALL business logic.

```typescript
// Example: authController.ts
const authenticateUser = new AuthenticateUser(
  memberRepository,
  passwordService,
  jwtService,
);
const result = await authenticateUser.execute({ email, password });
```

### Frontend: Component-Based Architecture

```
frontend/src/
├── components/
│   ├── ui/           # shadcn/ui components (button, dialog, card, form)
│   ├── features/     # Feature-specific components (EventCard, AnnouncementList)
│   └── layout/       # Layout components (Header, Footer, MobileNav)
├── pages/
│   ├── public/       # Landing pages (home, about, visit, events calendar, etc.)
│   ├── auth/         # Auth pages (login, register, MFA, password reset) - not nested
│   └── app/          # Church management app pages (authenticated routes)
│       ├── admin/    # Admin-only pages (member management, analytics, reports)
│       ├── announcements/  # Announcement pages
│       ├── dashboard/      # Dashboard pages (home, profile, settings)
│       ├── events/         # Event management pages
│       ├── members/        # Member directory and profiles
│       ├── messages/       # Messaging pages
│       └── settings/       # User settings pages
├── services/
│   ├── api/          # apiClient.ts with axios interceptors
│   └── endpoints/    # API service modules (authService, eventService)
├── contexts/         # React Context (AuthContext for global auth state)
└── hooks/            # Custom hooks (useAuth, useToast, useWebSocket)
```

**Key Separation Pattern:**

- **Public pages** (`pages/landing/*`) → Root paths: `/`, `/about`, `/events`, `/visit`, etc.
- **Auth pages** (`pages/auth/*`) → Public paths: `/login`, `/register`, `/mfa-verify`, etc.
- **App pages** (`pages/app/*`) → Protected paths: `/app/dashboard`, `/app/events`, `/app/admin/*`, etc. (behind `PrivateRoute`)

**API Endpoints vs UI Routes (CRITICAL):**

- Backend API endpoints use `/api/v1/{resource}` pattern (e.g., `/api/v1/members/dashboard`)
- Frontend uses `/app/*` Only for React Router paths, NOT for API calls
- When calling `apiClient.get()`, use `/members/dashboard`, NOT `/app/members/dashboard`
- The `apiClient` base URL is configured as `http://localhost:3000/api/v1`

## 🛠 Tech Stack

**Backend**: Node.js 20.x LTS, TypeScript 5.x, Express 4.x, Prisma 7.x ORM, PostgreSQL 15+, Socket.io 4.x  
**Frontend**: React 18.x, TypeScript 5.x, Vite 5.x, shadcn/ui, Tailwind CSS 3.x, React Router 6.x  
**Testing**: Jest 29.x (backend), Playwright (E2E in `/tests/e2e`)  
**External Services**: Cloudinary (image storage), Sentry (error monitoring)

## 🚀 Development Workflow

### Initial Setup

```bash
# Backend setup
cd backend
npm install
npx prisma generate           # Generate Prisma Client
npx prisma migrate dev        # Run migrations
npm run prisma:seed          # Seed database with test data

# Frontend setup
cd frontend
npm install
```

### Running the Application

**Backend** (port 3000):

```bash
cd backend
npm run dev                   # tsx watch with hot reload
```

**Frontend** (port 5173):

```bash
cd frontend
npm run dev                   # Vite dev server
```

**Key URLs**:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- API Docs (Swagger): http://localhost:3000/api-docs
- Health Check: http://localhost:3000/health

### Testing Strategy

**Backend Tests** (138+ passing):

```bash
cd backend
npm test                      # All tests with coverage
npm run test:watch           # Watch mode
npm run test:integration     # Integration tests only
npm run test:contract        # Contract tests only
```

**Test Organization**:

- `backend/tests/unit/useCases/` - Use case tests (authenticateUser, createEvent, rsvpToEvent)
- `backend/tests/integration/` - API integration tests (database + routes)
- `backend/tests/contract/` - OpenAPI contract validation (auth, events, announcements)

**E2E Tests** (Playwright):

```bash
npm run test:e2e             # From project root
```

Files: `/tests/e2e/*.spec.ts` (authentication.spec.ts, events.spec.ts, member-directory.spec.ts)

**TDD Approach**: Tests are written BEFORE implementation (Red-Green-Refactor). See `specs/001-full-stack-web/tasks.md` for task organization by phase.

### Database Management

```bash
cd backend
npx prisma studio            # Visual database browser
npx prisma migrate dev       # Create new migration
npx prisma generate          # Regenerate Prisma Client after schema changes
```

**Schema**: `backend/prisma/schema.prisma` - PostgreSQL models for members, events, announcements, messages, audit_logs, etc.

## 📝 Code Conventions

## ✅ Coding Principles

- DRY: Extract shared logic into use cases or services (e.g., API calls belong in `frontend/src/services/endpoints`, not duplicated in pages).
- KISS: Keep controllers thin and linear (see `backend/src/presentation/controllers/*` calling a single use case and returning JSON).
- YAGNI: Do not introduce new layers or abstractions unless a feature actually requires them (prefer a new use case over a new service layer).
- SoC: Respect boundaries between `domain` → `application` → `infrastructure` → `presentation`; avoid importing Prisma or Express types into `domain`.
- SRP: One use case per file (e.g., `backend/src/application/useCases/createEvent.ts`); avoid mixing read/write concerns.
- Dependency inversion: Use interfaces from `backend/src/domain/interfaces` in use cases; concrete repositories live in `backend/src/infrastructure/database/repositories`.
- Favor explicitness: Prefer named flows like `AuthenticateUser`, `EnrollMFA`, `RSVPToEvent` over clever one-liners in auth/MFA paths.

### Backend Patterns

**Use Cases** - Single-responsibility business logic:

```typescript
// application/useCases/createEvent.ts
export class CreateEvent {
  constructor(private eventRepository: IEventRepository) {}

  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    // Validation
    if (input.startDateTime < new Date()) {
      throw new Error("Event start date cannot be in the past");
    }
    // Business logic
    const event = new Event(/* ... */);
    return await this.eventRepository.create(event);
  }
}
```

**Controllers** - Thin wrappers calling use cases:

```typescript
// presentation/controllers/eventController.ts
export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await createEventUseCase.execute(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    logger.error("Create event error", { error: error.message });
    next(error); // Pass to error handler middleware
  }
}
```

**Repository Pattern** - All database access via interfaces:

```typescript
// domain/interfaces/IEventRepository.ts
export interface IEventRepository {
  create(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
  // ...
}
```

**Logging** - Use Winston logger from `infrastructure/logging/logger`:

```typescript
import { logger } from "../infrastructure/logging/logger";
logger.info("Event created", { eventId, userId });
logger.error("Failed to send email", { error: error.message });
```

### Frontend Patterns

**Routing & URL Namespacing** - Strict separation between landing pages and app pages:

```tsx
// Frontend Routes (React Router)
/                    → Landing page (public)
/about, /visit       → Landing pages (public)
/events              → Public events calendar (public)
/login               → Login page (public)
/app/dashboard       → Member dashboard (authenticated)
/app/events          → Member events calendar (authenticated)
/app/admin/*         → Admin pages (admin role required)

// Backend API Endpoints (always /api/v1/*)
/api/v1/members/dashboard      ← Called by /app/dashboard page
/api/v1/members/me             ← Called by /app/profile page
/api/v1/events                 ← Called by both /events and /app/events pages
/api/v1/announcements          ← Called by /app/announcements page
/api/v1/admin/*                ← Called by /app/admin/* pages
```

**CRITICAL**: Never confuse frontend routes (`/app/*`) with backend API paths (`/api/v1/*`)

- When calling `apiClient.get('/members/dashboard')`, the full URL becomes `http://localhost:3000/api/v1/members/dashboard`
- The `/app` prefix is ONLY for frontend React Router paths
- API calls should reference `/members/`, `/events/`, `/announcements/`, NOT `/app/members/`

**API Services** - Centralized in `services/endpoints/`:

```typescript
// services/endpoints/eventService.ts
import apiClient from "../api/apiClient";
export const eventService = {
  async getEvents(): Promise<Event[]> {
    return await apiClient.get("/events"); // Correct: /api/v1/events
  },
  // ...
};
```

**Authentication** - Use AuthContext:

```typescript
import { useAuth } from "../contexts/AuthContext";
const { member, login, logout, isAuthenticated } = useAuth();
```

**shadcn/ui Components** - All UI components in `components/ui/`:

- Use `npx shadcn-ui@latest add <component>` to add new components
- Customize via Tailwind classes, NOT direct CSS
- See **shadcn-ui-guide.md** for detailed component usage

**Route Protection**:

```tsx
import { PrivateRoute } from './components/routing/PrivateRoute';
import { AdminRoute } from './components/routing/AdminRoute';

<Route path="/app/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
<Route path="/app/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
```

**Lazy Loading** - All non-critical routes lazy-loaded:

```tsx
const EventsPage = lazy(() => import("./pages/app/events/EventsListPage"));
```

## 🔌 Real-Time Features

**WebSocket Server** (`backend/src/infrastructure/websocket/websocketServer.ts`):

- JWT authentication on connect
- Events: `new-message`, `new-announcement`, `event-update`, `rsvp-update`
- Emit to specific users: `websocketServer.emitToUser(userId, event, data)`

**Frontend WebSocket** (`services/websocket/websocketService.ts`):

```typescript
import { websocketService } from "../services/websocket/websocketService";
websocketService.on("new-message", (data) => {
  /* handle */
});
```

## 🔐 Security Practices

**Critical**: NEVER commit credentials. Always use `.env` files (gitignored).

**Rate Limiting** - Applied to sensitive endpoints:

- Auth endpoints: 5 requests/15 min
- MFA: 3 requests/15 min
- Contact form: 10 requests/hour
- Password reset: 3 requests/hour

**Input Sanitization** - XSS protection via middleware:

```typescript
import { sanitizeInputMiddleware } from "./middleware/sanitizeInput";
app.use("/api/v1", sanitizeInputMiddleware);
```

**JWT Auth** - Access tokens (15min) + refresh tokens (7 days):

- Access token in Authorization header: `Bearer <token>`
- Refresh token in cookie (httpOnly, secure)

**MFA** - TOTP-based for Admin/Staff roles (`backend/src/application/useCases/enrollMFA.ts`)

## 📦 Build & Deployment

**Backend**:

```bash
cd backend
npm run build                # esbuild → dist/index.js
npm start                    # Production server
```

**Frontend**:

```bash
cd frontend
npm run build                # Vite → dist/ (optimized with code splitting)
```

**Deployment Platforms**:

- **Frontend**: Vercel (see `vercel.json`)
- **Backend**: Render.com (see `render.yaml`)
- **Database**: Neon PostgreSQL (managed via Vercel)
- **Files**: Cloudinary (env: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)

See `DEPLOYMENT_GUIDE.md` for complete deployment instructions.

**Docker**:

```bash
docker-compose up            # Dev environment
docker-compose -f docker-compose.prod.yml up  # Production
```

## 📚 Documentation References

- **API Contracts**: `specs/001-full-stack-web/contracts/openapi.yaml`
- **Task Tracking**: `specs/001-full-stack-web/tasks.md` (phase-by-phase implementation)
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **Database Setup**: `POSTGRESQL_SETUP.md`, `TEST_DATABASE_SETUP.md`
- **Manual Testing**: `MANUAL_TEST_GUIDE.md`
- **Security**: `SECURITY_GUIDE.md`, `SECURITY_INCIDENT_REPORT.md`

## MCP Server Usage Guidelines

When implementing features, leverage available MCP servers for enhanced development:

### Context7 MCP Server (Library Documentation)

- **Use for**: Getting up-to-date, version-specific documentation and code examples from any library or framework
- **When to use**:
  - Learning new library APIs or patterns
  - Checking current best practices for dependencies (React, Prisma, Express, etc.)
  - Verifying correct usage of framework features
  - Finding code examples for specific use cases
- **Example use cases**:
  - "Get Prisma documentation for relation queries"
  - "Show React 18 hooks best practices"
  - "Find Express middleware examples for authentication"

### shadcn MCP Server (UI Components)

- **Use for**: UI component implementation with shadcn/ui library
- **When to use**:
  - Implementing new UI features or pages
  - Adding shadcn/ui components to the project
  - Finding component usage examples and patterns
  - Checking component API and customization options
- **Example use cases**:
  - "Add shadcn button component"
  - "Show shadcn form component examples"
  - "Get shadcn dialog implementation pattern"
  - "Find card component variants"

- **Reference shadcn-ui-guide.md** for detailed instructions on using shadcn components effectively.

### Playwright MCP Server (E2E Testing)

- **Use for**: End-to-end testing and manual testing guidance with Playwright
- **When to use**:
  - Writing E2E tests for user flows
  - Setting up test fixtures and page objects
  - Implementing test automation patterns
  - Debugging test failures and selectors
  - Checking Playwright API and best practices
  - Planning manual test scenarios and cases
  - Converting manual test cases to automated tests
- **Example use cases**:
  - "Show Playwright authentication flow test example"
  - "Get Playwright page object pattern"
  - "Find best practices for waiting strategies"
  - "Create test for form submission flow"
  - "Generate manual test checklist for user registration"
  - "Convert manual test scenario to Playwright test"

**Best Practice**: Always consult MCP servers before implementing features to ensure you're using current best practices and correct API patterns.

## Recent Changes

- 001-full-stack-web: Added TypeScript 5.x (Node.js 20.x LTS for backend, React 18.x for frontend)

<!-- MANUAL ADDITIONS START -->

## 🔐 Security & Credential Management Guidelines

**⚠️ CRITICAL: This file MUST always be included in context when working on this project.**

**CRITICAL: Never expose credentials in any committed files.**

### Golden Rules

1. **NEVER commit credentials to Git**
   - ❌ No passwords, API keys, secrets, or tokens in code
   - ❌ No credentials in markdown documentation
   - ❌ No credentials in config files (except `.env.example` with placeholders)
   - ❌ No credentials in `.vscode/mcp.json` - use environment variable references
   - ❌ No credentials in terminal output that gets logged
   - ✅ Always use environment variables via `.env` files

2. **Always use `.env` files (gitignored)**
   - ✅ Store ALL secrets in `backend/.env` (already in `.gitignore`)
   - ✅ Use `.env.example` files with placeholder values only
   - ✅ Never commit actual `.env` files
   - ✅ Document required variables without exposing values

3. **Use placeholders in documentation**

   ```bash
   # ❌ WRONG - Real credential
   CLOUDINARY_API_SECRET=x2_9z0J8h6pP5tCoqUDMsI7L03Y

   # ✅ CORRECT - Placeholder
   CLOUDINARY_API_SECRET=<your-api-secret-here>
   ```

4. **Separate development from production**
   - ✅ Different credentials for dev/staging/production
   - ✅ Never reuse production secrets in development
   - ✅ Rotate credentials when environment changes

### VS Code MCP Configuration Security

**IMPORTANT:** The `.vscode/mcp.json` file should NEVER contain hardcoded API keys.

```jsonc
// ❌ WRONG - Hardcoded credential
{
  "headers": {
    "Authorization": "rnd_actualApiKeyHere123"
  }
}

// ✅ CORRECT - Environment variable reference
{
  "headers": {
    "Authorization": "${env:RENDER_API_KEY}"
  }
}
```

**Required Environment Variables for MCP:**

- `CONTEXT7_API_KEY` - Context7 MCP server API key
- `RENDER_API_KEY` - Render.com API key (format: `rnd_xxx`)
- Vercel uses browser-based OAuth (no API key needed)

### Credential Types & Sensitivity

| Type               | Sensitivity | Examples              | Storage           |
| ------------------ | ----------- | --------------------- | ----------------- |
| Database passwords | 🔴 CRITICAL | PostgreSQL, Neon      | `.env` only       |
| API secrets        | 🔴 CRITICAL | Cloudinary, Stripe    | `.env` only       |
| JWT secrets        | 🔴 CRITICAL | Token signing keys    | `.env` only       |
| Private keys       | 🔴 CRITICAL | VAPID, SSH            | `.env` only       |
| MCP API keys       | 🔴 CRITICAL | Render, Context7      | System env vars   |
| API keys           | 🟡 HIGH     | Service identifiers   | `.env` only       |
| SMTP passwords     | 🟡 HIGH     | Email credentials     | `.env` only       |
| Test credentials   | 🟢 LOW      | Seeded user passwords | Code (acceptable) |

### Protected Files (Never Commit)

These files are in `.gitignore`:

```gitignore
# Credentials & Secrets
.env
.env.local
.env.*.local
*.secrets
*.credentials
production-env-vars.txt
render-env-vars.txt
token.txt
*-secrets.json

# VS Code config with API keys
.vscode/mcp.json

# Scripts with hardcoded credentials
*-deployment.ps1
setup-*-database.ps1
setup-heliohost-database.ps1

# Documentation that may contain credentials
HELIOHOST_SETUP_GUIDE.md
```

### Safe Documentation Practices

✅ **DO:**

- Use `<placeholder>` or `<your-value-here>` syntax
- Reference where to obtain credentials (dashboard links)
- Provide instructions without actual values
- Use `.env.example` files with fake/placeholder data

❌ **DON'T:**

- Include real connection strings in markdown
- Show actual API keys in setup guides
- Copy-paste credentials from `.env` to docs
- Leave credentials in commit messages
- Create helper files with credentials (e.g., `render-env-vars.txt`)

### When Creating New Files

**ALWAYS check if the file might contain credentials:**

1. Setup scripts → Add to `.gitignore`
2. Environment configs → Use `.example` suffix with placeholders
3. MCP configs → Use `${env:VAR_NAME}` syntax
4. Deployment docs → Use `<placeholder>` syntax only

### Security Checklist

Before committing:

- [ ] No credentials in staged files (`git diff --cached`)
- [ ] Check for API keys, passwords, tokens
- [ ] Verify `.env` is gitignored
- [ ] Documentation uses placeholders only
- [ ] No connection strings with real passwords
- [ ] `.vscode/mcp.json` uses env var references only
- [ ] No new credential-containing files created

### Tools & Resources

- **Secret Scanning:** Use GitHub secret scanning (auto-enabled)
- **Pre-commit Hooks:** Install git-secrets or similar
- **Security Guide:** `SECURITY_GUIDE.md`
- **Incident Response:** `SECURITY_INCIDENT_REPORT.md`

<!-- MANUAL ADDITIONS END -->
