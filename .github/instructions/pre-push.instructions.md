---
applyTo: "**"
---

# Pre-Push Checklist — Required Before Every `git push`

**ALL four checks must pass. Fix every failure before pushing. No exceptions.**

## 1. Backend TypeScript — zero errors

```bash
cd backend && npx tsc --noEmit
```

Exit code must be 0. Any `error TS` line = failure.

## 2. Frontend build — zero errors

```bash
cd frontend && npm run build
```

Must end with `✓ built in …`. Any `error TS` line = failure.  
Vercel will reject the deploy if this fails.

## 3. Backend security audit — 0 vulnerabilities

```bash
cd backend && npm audit
```

Must report `found 0 vulnerabilities`.

## 4. Root security audit — 0 vulnerabilities

```bash
npm audit
```

Must report `found 0 vulnerabilities`.

---

## Quick Fix Reference

| Failure                                  | Fix                                                              |
| ---------------------------------------- | ---------------------------------------------------------------- |
| `TS6133: 'X' declared but never read`    | Delete the unused import or variable named `X`                   |
| `TS2322` on Prisma `include`/`select`    | Change `: false` → `: undefined`                                 |
| `TS2345` argument mismatch               | Check function signature; fix the passed type                    |
| `npm audit` vulnerabilities (transitive) | Add package to `overrides` in `package.json`, then `npm install` |
| `npm audit` vulnerabilities (direct dep) | Update version in `dependencies`, then `npm install`             |
| Vite missing module                      | Check `@/` alias path is correct in `vite.config.ts`             |

## After Pushing

Run via GitHub MCP to confirm CI passed:

- Check recent GitHub Actions run for `ci-cd.yml` on the `main` branch
- Verify no new Dependabot alerts were triggered

> Run `#pre-push-checklist` in chat to execute all checks and get a ✅/❌ report for each.
