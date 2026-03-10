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
  "hono": ">=4.12.5",
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
