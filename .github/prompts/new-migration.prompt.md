---
agent: "agent"
description: "Guide through creating a safe Prisma database migration for this codebase. Automatically determines whether the change is additive or breaking and applies the correct pattern (direct migration or expand-and-contract), then generates all required commands, schema diffs, and checklist items."
---

# New Database Migration

Guide me through creating a safe Prisma migration for this codebase (Prisma 7.x, Neon PostgreSQL, Render.com auto-deploy).

## Step 1 — Understand the change

Ask the user:

1. **What is the schema change?** (e.g. "add `bio` column to members", "rename `title` to `name` on events", "add a new `sermons` table", "remove the `legacy_flag` column")
2. **Is this for a new feature, bug fix, or cleanup?**
3. **Are there existing rows in the affected table(s) in production?** (If unknown, assume yes.)

## Step 2 — Classify the change

Based on the answer, classify as one of:

| Type                    | Examples                                                                          | Strategy                                 |
| ----------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| **Additive — safe**     | New table, new nullable column, new index, new enum value, column with `@default` | Direct migration                         |
| **Breaking — rename**   | Rename column or model                                                            | Expand-and-contract (4 steps)            |
| **Breaking — remove**   | Drop column, drop table                                                           | Expand-and-contract (2–3 steps)          |
| **Breaking — NOT NULL** | Make nullable column required without a default                                   | Add `@default` first OR backfill first   |
| **Data migration**      | Move data between columns/tables                                                  | Write backfill script before contracting |

## Step 3 — Generate the migration plan

### For ADDITIVE changes:

1. Show the `schema.prisma` diff (only the changed model block)
2. Provide the exact command to create the migration:
   ```bash
   cd backend && npx prisma migrate dev --name <descriptive_snake_case_name>
   ```
3. Remind to review `backend/prisma/migrations/*/migration.sql` for unexpected `DROP` statements
4. Commit message template:

   ```
   feat(db): add <description>

   Migration: <migration_name>
   - Added: <what was added>
   - Safe: additive only, no data loss
   ```

### For BREAKING changes (expand-and-contract):

Generate all four phases as separate, independently deployable commits:

**Phase 1 — EXPAND**

- Schema diff showing old + new column/model coexisting
- Command: `npx prisma migrate dev --name expand_add_<new_name>`
- Commit: `feat(db): [expand] add <new_name> alongside <old_name>`
- ✅ Deploy — old code still works

**Phase 2 — BACKFILL** (if data must be preserved)

- TypeScript backfill script at `backend/scripts/backfill-<name>.ts`:

  ```typescript
  import { prisma } from '../src/infrastructure/database/prismaClient';

  async function backfill() {
    const rows = await prisma.<model>.findMany({ where: { <new_col>: null } });
    for (const row of rows) {
      await prisma.<model>.update({
        where: { id: row.id },
        data: { <new_col>: row.<old_col> },
      });
    }
    console.log(`Backfilled ${rows.length} rows`);
    await prisma.$disconnect();
  }

  backfill().catch(console.error);
  ```

- Run against production Neon DB: `DATABASE_URL="<prod-url>" npx ts-node scripts/backfill-<name>.ts`
- Commit: `chore(db): backfill <new_name> from <old_name>`

**Phase 3 — SWITCH**

- Update all application code to read/write new column only
- Remove all references to old column from use cases, repos, controllers, tests
- Commit: `feat: switch to <new_name> (stop using <old_name>)`
- ✅ Deploy

**Phase 4 — CONTRACT**

- Schema diff removing old column
- Command: `npx prisma migrate dev --name contract_remove_<old_name>`
- Review migration SQL confirms `ALTER TABLE ... DROP COLUMN <old_name>`
- Commit: `chore(db): [contract] remove deprecated <old_name> column`
- ✅ Deploy — migration complete

### For NOT NULL without default:

1. Phase 1: Add column with `@default(value)` → migrate → deploy
2. Phase 2 (optional): Once all rows have a value, remove `@default` if desired → migrate → deploy

## Step 4 — Pre-commit checklist

Before committing any phase:

- [ ] `npx prisma generate` succeeds locally
- [ ] `npx tsc --noEmit` exits 0 — no new TS2322 errors from Prisma include/select changes
- [ ] Migration SQL reviewed — no unintended `DROP` statements in additive phases
- [ ] Migration file is committed alongside schema AND code changes in the same commit
- [ ] No existing `migration.sql` files were modified
- [ ] `cd backend && npm audit` → 0 vulnerabilities

## Step 5 — Production deploy confirmation

After pushing to `main`:

- Render.com automatically runs `npx prisma migrate deploy && npm start`
- Migration is applied BEFORE new code starts — if it fails, old version keeps serving
- Use GitHub MCP to verify CI passed: `mcp_github_get_commit` on latest main commit

## Important rules (always remind the user)

- ❌ NEVER use `prisma migrate reset` in production — drops all data
- ❌ NEVER use `prisma db push` in production — bypasses migration history
- ❌ NEVER edit an existing `migration.sql` that has already been applied
- ❌ NEVER delete applied migration folders
- ✅ Test against a Neon branch before pushing: `DATABASE_URL="<neon-branch-url>" npx prisma migrate deploy`
- ✅ For rollback: write a `down.sql` and run `npx prisma db execute --file ./down.sql`
