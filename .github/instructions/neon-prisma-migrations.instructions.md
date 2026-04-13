---
applyTo: "backend/prisma/**"
---

# Prisma Schema & Migration Rules

This file is auto-injected whenever you edit any file under `backend/prisma/` (schema, migrations, seed).

## Before touching schema.prisma — 3-question safety check

1. **Is this additive?** (new table/column/index with a default or nullable) → safe, go direct
2. **Does this rename, remove, or add NOT NULL to an existing column?** → use expand-and-contract (see `backend.instructions.md` § Database Migrations)
3. **Does existing data need to be preserved or transformed?** → write a backfill script first

## Migration workflow (every schema change)

```bash
# 1. Edit schema.prisma
# 2. Create migration (dev only — NEVER on production)
npx prisma migrate dev --name <descriptive_snake_case_name>

# 3. Review the generated SQL before committing
# Open: backend/prisma/migrations/<timestamp>_<name>/migration.sql
# Confirm: no unexpected DROP statements for additive changes

# 4. Regenerate client (already part of migrate dev, but explicit is fine)
npx prisma generate

# 5. Type-check — Prisma include/select changes often surface TS2322
cd backend && npx tsc --noEmit

# 6. Commit schema + migration + code changes together
git add backend/prisma/ && git add backend/src/
```

## Production deploy (automatic — no manual steps)

Render.com runs migrations during the **build step** on every push to `main`:

```
npm install && npm run build && npx prisma generate && npx prisma migrate deploy
```

Then starts the app with `npm start`.

`migrate deploy` applies only **pending** migrations in order. It is idempotent and safe. If it fails, Render aborts the deploy — the old version keeps serving.

### Dev vs Production database split

| Environment       | `DATABASE_URL`                                        | `DIRECT_DATABASE_URL`                         |
| ----------------- | ----------------------------------------------------- | --------------------------------------------- |
| **Local dev**     | `postgresql://postgres:...@localhost:5432/church_app` | not needed (local = no pooler)                |
| **Render (prod)** | Neon **pooler** URL (`...pooler.ap-southeast-1...`)   | Neon **direct** URL (same host, no `-pooler`) |

`prisma.config.ts` resolves the migration URL as `DIRECT_DATABASE_URL ?? DATABASE_URL`. On Render both env vars must be set in the dashboard:

- `DATABASE_URL` → Neon pooler URL (used by the running app for all queries)
- `DIRECT_DATABASE_URL` → Neon direct URL (used by `prisma migrate deploy` during build to bypass pooler advisory lock requirement)

To get the direct URL from Neon: open your Neon project → Connection Details → toggle off "Connection pooling" → copy the connection string.

> ⚠️ If `DIRECT_DATABASE_URL` is missing from Render, migrations may hang or fail with a "could not obtain lock" error because Prisma migrations require an advisory lock that Neon's pooler does not support.

## Testing migrations before pushing (Neon branching)

```bash
# Create a branch of the production DB in Neon console
# Then test the migration against it:
DATABASE_URL="<neon-branch-connection-string>" npx prisma migrate deploy

# Inspect results in Neon Studio before pushing to git
```

## Forbidden commands (production)

| Command                             | Why                                       |
| ----------------------------------- | ----------------------------------------- |
| `prisma migrate reset`              | **DROPS ALL DATA**                        |
| `prisma db push`                    | Bypasses migration history → schema drift |
| `prisma db push --force-reset`      | Wipes the database                        |
| Manual `DROP TABLE` / `DROP COLUMN` | Bypasses Prisma history                   |

## Prisma type rules (prevent TS2322)

```typescript
// ✅ Always use undefined as falsy branch for include/select/where
const result = await prisma.events.findMany({
  include: showAttendees ? { members: true } : undefined,
});

// ❌ Never use false — causes TS2322
include: showAttendees ? { members: true } : false;
```

## Test factory rules (prevent missing field errors)

Schema lacks `@default()` and `@updatedAt` directives — supply explicitly in factories:

```typescript
import { randomUUID } from "crypto";
const record = {
  id: randomUUID(),
  updatedAt: new Date(),
  // ... other required fields
};
```

## Rollback strategy

Prisma has no auto-rollback. For critical changes:

```bash
# Write a manual down.sql, then:
npx prisma db execute --file ./down.sql
# Mark the migration as rolled back:
npx prisma migrate resolve --rolled-back <migration_name>
```

Prefer a **forward fix** — write a new migration that undoes the bad change.

## Run `#new-migration` prompt for guided migration creation

Type `#new-migration` in chat to get step-by-step migration guidance including expand-and-contract phases, backfill script generation, and commit message templates.
