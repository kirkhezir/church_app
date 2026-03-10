---
agent: "agent"
description: "Run all pre-push validation checks and report pass/fail for each."
---

# Pre-Push Checklist

Run all four required checks before pushing any code change. Report each result individually and stop on the first failure to fix.

## Checks to run

### 1. Backend TypeScript — must exit 0

```bash
cd backend && npx tsc --noEmit
```

Expected: no errors printed, exit code 0.

### 2. Frontend build — must exit 0

```bash
cd frontend && npm run build
```

Expected: `✓ built in` success line, exit code 0. Any `error TS` line is a failure.

### 3. Backend security audit — must show 0 vulnerabilities

```bash
cd backend && npm audit
```

Expected: `found 0 vulnerabilities`.

### 4. Root security audit — must show 0 vulnerabilities

```bash
npm audit
```

Expected: `found 0 vulnerabilities`.

## Instructions

1. Run each check **in sequence** using the terminal.
2. After each check, report: ✅ PASS or ❌ FAIL with the relevant output snippet.
3. If any check **fails**, stop and list exactly what needs to be fixed before the code can be pushed:
   - `TS6133` → remove the unused import/variable named in the error
   - `TS2322` / `TS2345` → fix the type mismatch; for Prisma includes use `undefined` not `false`
   - `npm audit` vulnerabilities → run `npm audit fix`, or add an `overrides` entry in `package.json` for transitive deps
4. Only report "Ready to push ✅" when **all four checks pass**.

## Quick reference: common fixes

| Failure                                                     | Fix                                                  |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| `error TS6133: 'X' is declared but its value is never read` | Delete the unused import/variable                    |
| `error TS2322` on Prisma include                            | Change `: false` → `: undefined`                     |
| `npm audit` shows vulnerabilities                           | `npm audit fix` or add `overrides` in `package.json` |
| Vite build fails on missing module                          | Check `@/` alias path is correct                     |
