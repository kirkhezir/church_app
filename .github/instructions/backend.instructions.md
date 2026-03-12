---
applyTo: "backend/**"
---

# Backend Development Rules

## Architecture: Clean Architecture — Use Cases Only

- All business logic lives in `backend/src/application/useCases/`. Controllers are thin wrappers.
- One use case per file, single public `execute()` method.
- Use cases depend on **interfaces** from `backend/src/domain/interfaces/` — never import Prisma or Express types into `domain/` or `application/`.
- Concrete repositories live in `backend/src/infrastructure/database/repositories/`.
- Layer boundaries: `domain` → `application` → `infrastructure` → `presentation`. Never import inward across boundaries.

```typescript
// ✅ Correct pattern — use case with interface dependency
export class CreateEvent {
  constructor(private eventRepository: IEventRepository) {}
  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    if (input.startDateTime < new Date()) {
      throw new Error("Event start date cannot be in the past");
    }
    const event = new Event(/* ... */);
    return await this.eventRepository.create(event);
  }
}

// ❌ Wrong — business logic in controller
router.post("/events", async (req, res) => {
  const event = await prisma.events.create({ data: req.body }); // NO
});
```

## Controller Pattern

Controllers are thin wrappers — instantiate use case, call `execute()`, return JSON, pass errors to `next()`:

```typescript
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

## Repository Pattern

All database access via interfaces defined in `domain/interfaces/`:

```typescript
// domain/interfaces/IEventRepository.ts
export interface IEventRepository {
  create(event: Event): Promise<Event>;
  findById(id: string): Promise<Event | null>;
}
```

Concrete implementations in `infrastructure/database/repositories/` — use cases never import from `infrastructure/`.

## Coding Principles

- **DRY**: Extract shared logic into use cases or services.
- **KISS**: Keep controllers thin and linear — one use case call per endpoint.
- **YAGNI**: No new layers or abstractions unless a feature actually requires them.
- **SRP**: One use case per file; avoid mixing read/write concerns.
- **DI**: Inject interfaces, not concrete classes.
- **SoC**: Respect layer boundaries — no Prisma types in `domain/`, no Express types in `application/`.
- **Explicitness**: Prefer named flows (`AuthenticateUser`, `EnrollMFA`, `RSVPToEvent`) over clever one-liners.

## Prisma Rules

- **NEVER pass `false`** to `include`, `select`, or `where` fields — use `undefined` as the falsy branch.

```typescript
// ✅ Correct
include: condition ? { members: true } : undefined;

// ❌ Wrong — causes TS2322
include: condition ? { members: true } : false;
```

- Use **snake_case** Prisma types matching model names exactly:
  `Prisma.membersCreateInput`, `Prisma.eventsCreateInput`, `Prisma.announcementsCreateInput`, `Prisma.event_rsvpsCreateInput`
- Never use `prisma.$queryRawUnsafe` with user-controlled input — always use Prisma parameterized APIs.
- Schema lacks `@default()` and `@updatedAt`, so test factories must supply explicit `id` and `updatedAt`.

## Test Factories

Test records must supply explicit `id` and `updatedAt`:

```typescript
import { randomUUID } from "crypto";
const member = { id: randomUUID(), updatedAt: new Date() /* other fields */ };
```

Test locations: `backend/tests/unit/useCases/`, `backend/tests/integration/`, `backend/tests/contract/`.

## Logging

Always use the Winston logger — never `console.log` in production code:

```typescript
import { logger } from "../infrastructure/logging/logger";
logger.info("Event created", { eventId, userId });
logger.error("Failed to send email", { error: error.message });
```

Log all: auth events, admin actions, errors, and email sends.

## Security

### Input & Auth

- Validate all request bodies with `zod` or `express-validator` before passing to use cases.
- Rate limiting is required on all new public-facing endpoints:
  - Auth: 5 requests/15 min
  - MFA: 3 requests/15 min
  - Contact form: 10 requests/hour
  - Password reset: 3 requests/hour
- File uploads must use validated MIME type + size limits (multer config).
- JWT secrets, database passwords, and API keys must come from `process.env` — never hardcoded.
- MFA (TOTP) is required for Admin/Staff roles — see `application/useCases/enrollMFA.ts`.
- JWT access tokens expire in 15 min; refresh tokens are httpOnly cookies (7 days).
- Input sanitization via `sanitizeInputMiddleware` is applied to all `/api/v1` routes.

### Credentials — NEVER Commit

- Store ALL secrets in `backend/.env` (gitignored). Use `.env.example` with placeholders only.
- Never hardcode credentials in code, docs, or scripts.

### OWASP Top 10 Prevention

| Risk                              | Prevention                                                                       |
| --------------------------------- | -------------------------------------------------------------------------------- |
| **A01 Broken Access Control**     | Always verify `req.member.role` in admin routes                                  |
| **A02 Cryptographic Failures**    | Never store plain-text passwords; use `bcrypt` via `PasswordService`             |
| **A03 Injection**                 | Always use Prisma parameterized queries; never `$queryRawUnsafe` with user input |
| **A04 Insecure Design**           | Business logic in use cases only — never in controllers or routes                |
| **A05 Security Misconfiguration** | Helmet.js + restricted CORS + rate limits on auth/MFA/contact endpoints          |
| **A06 Vulnerable Components**     | Run `npm audit` before every push; use `overrides` for transitive fixes          |
| **A07 Auth Failures**             | MFA for Admin/Staff; 15-min access tokens; httpOnly refresh cookies              |
| **A08 Data Integrity**            | Validate all request bodies before use-case execution                            |
| **A09 Logging Failures**          | Log all auth events, errors, admin actions via Winston                           |
| **A10 SSRF**                      | Never fetch user-supplied URLs server-side without allow-listing                 |

### Dependency Vulnerabilities

NEVER use `npm audit fix --force` — it may downgrade Prisma 7→6. Use `overrides` in `package.json` for transitive issues:

```json
"overrides": {
  "lodash": "^4.17.23",
  "hono": ">=4.12.7",
  "@hono/node-server": ">=1.19.10",
  "fast-xml-parser": ">=5.4.2",
  "qs": "^6.15.0",
  "brace-expansion": "^2.0.2"
}
```

Pin exact versions for security-critical packages (e.g. `"multer": "2.1.1"`, not `"^2.1.1"`).

## Real-Time (WebSocket)

```typescript
// Emit to a specific user
websocketServer.emitToUser(userId, "new-announcement", data);
// Events: 'new-message', 'new-announcement', 'event-update', 'rsvp-update'
```

WebSocket server: `infrastructure/websocket/websocketServer.ts` — JWT-authenticated on connect.

## Common TypeScript Errors to Prevent

| Error    | Root Cause                               | Prevention                                     |
| -------- | ---------------------------------------- | ---------------------------------------------- |
| `TS2322` | Prisma `include` ternary returns `false` | Use `undefined` as falsy branch, never `false` |
| `TS6133` | Unused import or variable                | Remove immediately; never leave stale imports  |
| `TS2345` | Wrong type passed to function            | Check function signatures before calling       |

## Pre-Push Checks (Backend)

```bash
cd backend && npx tsc --noEmit   # Must exit 0
cd backend && npm audit           # Must report 0 vulnerabilities
```

---

## 🗄️ Database Migrations — Production Safety Rules

This section governs every change to `backend/prisma/schema.prisma`. **Zero data loss and zero downtime are non-negotiable.** Render.com automatically runs `npx prisma migrate deploy` before `npm start` on every deploy, so migrations are applied atomically before new code goes live.

### How Migrations Work in This Stack

```
Dev machine          │  Git push to main   │  Render.com (Production)
─────────────────────│─────────────────────│──────────────────────────
npx prisma migrate   │                     │  npx prisma migrate deploy
  dev --name xyz     │  ──────────────►    │  (applies pending migrations)
  (creates SQL file) │                     │  npm start
  (updates dev DB)   │                     │  (new code runs on updated DB)
```

`prisma migrate deploy`:

- Applies only **pending** migrations in chronological order
- Is **idempotent** — safe to run multiple times
- Does **not** reset, drop, or touch already-applied migrations
- Does **not** rely on a shadow database
- If it fails, Render aborts the deploy — the old version keeps serving traffic

### ❌ NEVER Use These Commands in Production

| Command                              | Why it's dangerous                                                 |
| ------------------------------------ | ------------------------------------------------------------------ |
| `prisma migrate reset`               | **DROPS ALL DATA** — development only                              |
| `prisma migrate reset --force`       | Same, bypasses confirmation prompt                                 |
| `prisma db push`                     | Bypasses the migration history — causes drift between environments |
| `prisma db push --force-reset`       | Wipes the database                                                 |
| Raw `DROP TABLE` / `DROP COLUMN` SQL | Instant irreversible data loss                                     |

### ✅ Rules for Every Schema Change

**Before touching `schema.prisma`, ask:**

1. Is this **additive** (new model, new optional column, new index)? → Safe to deploy directly.
2. Does this **rename, remove, or make NOT NULL** an existing column? → Use expand-and-contract.
3. Is there data that must be **backfilled**? → Write a data migration script first.

**Always:**

- Run `npx prisma migrate dev --name <descriptive_name>` locally to generate the migration SQL
- Review the generated SQL in `backend/prisma/migrations/*/migration.sql` before committing
- Test locally that `npx prisma migrate deploy` succeeds on a clean DB
- Commit the migration file **together with** the schema and application code change

**Never:**

- Modify an existing `migration.sql` file that has already been applied to any environment
- Delete migration folders that are already applied
- Commit a schema change without the migration file (Prisma will error on deploy)

### ✅ Additive Changes — Safe by Default

These can be deployed directly without any special process:

```prisma
// ✅ Add a new optional column
model members {
  bio String?   // nullable = safe, no data loss
}

// ✅ Add a new model (new table)
model prayer_requests {
  id String @id
  // ...
}

// ✅ Add an index
model events {
  @@index([startDateTime])
}

// ✅ Add a column with a default value
model members {
  isVerified Boolean @default(false)
}
```

```bash
npx prisma migrate dev --name add_member_bio
# Review backend/prisma/migrations/*/migration.sql
git add backend/prisma/ && git commit -m "feat: add member bio column"
# Push → Render auto-runs migrate deploy before starting
```

### ✅ Expand-and-Contract — Breaking Changes (Rename/Remove/NOT NULL)

Use this 4-step pattern when renaming a column, removing a column, or making a nullable column NOT NULL. Each step is a **separate deploy**.

**Example: rename `bio` → `biography`**

**Step 1 — EXPAND: add new column alongside old**

```prisma
model members {
  bio       String?   // keep old column
  biography String?   // add new column
}
```

```bash
npx prisma migrate dev --name expand_add_biography_column
git add backend/prisma/ && git commit && git push
# Deploy → both columns exist, old code still works
```

**Step 2 — BACKFILL: copy data to new column**

```typescript
// Write a one-off script (scripts/backfill-biography.ts)
const members = await prisma.members.findMany({ where: { biography: null } });
for (const m of members) {
  await prisma.members.update({
    where: { id: m.id },
    data: { biography: m.bio },
  });
}
```

```bash
cd backend && npx ts-node scripts/backfill-biography.ts  # run against production DB
```

**Step 3 — SWITCH: update application code to use new column only**

```typescript
// Stop reading/writing 'bio', use 'biography' everywhere
```

```bash
git add . && git commit -m "feat: switch app to use biography column" && git push
# Deploy → new code uses new column, old column is no longer written
```

**Step 4 — CONTRACT: remove old column**

```prisma
model members {
  // bio removed
  biography String?   // now the only column
}
```

```bash
npx prisma migrate dev --name contract_remove_bio_column
git add backend/prisma/ && git commit -m "chore: remove deprecated bio column" && git push
# Deploy → old column dropped cleanly, no data in-use is lost
```

### ✅ NOT NULL Column on Existing Table

Adding a `NOT NULL` column to a table with existing rows **will fail** unless you provide a `DEFAULT` or backfill first:

```prisma
// ❌ Will fail if table has rows — no default = Postgres error
model members {
  role Role  // NOT NULL without @default
}

// ✅ Phase 1: add with a default so existing rows get a value
model members {
  role Role @default(MEMBER)
}

// ✅ Phase 2 (optional): once backfilled, enforce stricter defaults
```

### ✅ Testing Migrations Safely with Neon Branches

Neon allows creating an isolated branch of the production database. Use this to test migrations against real data before pushing:

```bash
# 1. Create a branch from the production database via Neon console or MCP
# 2. Set DATABASE_URL to the branch connection string
# 3. Dry-run migration against the branch
DATABASE_URL="<neon-branch-url>" npx prisma migrate deploy

# 4. Verify data integrity in Neon Studio
# 5. If successful, push migration to git → Render applies to production
```

### ✅ Rollback Strategy

Prisma does not auto-generate rollback SQL. For critical changes, write a `down.sql` manually:

```bash
# If a migration caused problems:
npx prisma db execute --file ./down.sql
# Then manually mark the migration as rolled back in _prisma_migrations table if needed
npx prisma migrate resolve --rolled-back <migration_name>
```

For this codebase, the safest rollback is always a **forward fix** — write a new migration that undoes the bad change.

### ✅ Pre-Push Checklist — Schema Changes

Before committing any change to `schema.prisma`:

- [ ] `npx prisma migrate dev --name <name>` generated a new migration file
- [ ] Reviewed the generated `migration.sql` — no unintended `DROP` statements
- [ ] Migration file is committed alongside schema and code changes
- [ ] `npx prisma generate` succeeds locally
- [ ] `npx tsc --noEmit` passes (no TS2322 from Prisma `include`/`select` changes)
- [ ] No existing migration SQL files were modified
- [ ] Additive changes only **OR** expand-and-contract pattern was followed for breaking changes
- [ ] If NOT NULL was added, a `@default` was provided or rows were backfilled first

### Development vs Production Commands Reference

| Task                  | Local Dev                         | Production (Render auto-runs) |
| --------------------- | --------------------------------- | ----------------------------- |
| Apply new migration   | `npx prisma migrate dev --name x` | `npx prisma migrate deploy`   |
| Regenerate client     | `npx prisma generate`             | Part of `buildCommand`        |
| Explore data          | `npx prisma studio`               | Neon console / Studio         |
| Reset DB (local only) | `npx prisma migrate reset`        | ❌ NEVER                      |
| Inspect schema drift  | `npx prisma migrate diff`         | ❌ Use deploy only            |
