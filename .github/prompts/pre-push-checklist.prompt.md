---
agent: "agent"
description: "Run all pre-push validation checks and post-push GitHub MCP security verification. Reports pass/fail for each step."
---

# Pre-Push Checklist

Run all four local checks before pushing. Then run the post-push GitHub MCP security checks after every push. Report each result individually.

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

### Before pushing

1. Run each local check **in sequence** using the terminal.
2. After each check, report: ✅ PASS or ❌ FAIL with the relevant output snippet.
3. If any check **fails**, stop and list exactly what needs to be fixed before the code can be pushed:
   - `TS6133` → remove the unused import/variable named in the error
   - `TS2322` / `TS2345` → fix the type mismatch; for Prisma includes use `undefined` not `false`
   - `npm audit` vulnerabilities → run `npm audit fix`, or add an `overrides` entry in `package.json` for transitive deps
4. Only proceed to push when **all four checks pass**.

### After pushing — GitHub MCP security verification (REQUIRED)

After every push, immediately run these GitHub MCP checks and report results:

**Step 5 — CI/CD status:**

```
mcp_github_get_commit  →  verify latest commit on main has status: success
```

Report: ✅ CI passed / ❌ CI failed (link to failing job)

**Step 6 — Security scan workflow (`security-scan.yml`):**

```
mcp_github_list_issues  →  filter label:"security"  →  check for new issues opened after this push
```

Verify all four jobs passed: dependency scan, secret scan, OWASP check, container scan (Trivy).
Report: ✅ No new security issues / ❌ New issues found (list them)

**Step 7 — Dependabot alerts:**

```
mcp_github_list_issues  (owner: kirkhezir, repo: church_app, labels: "dependencies")
```

Report: ✅ No new Dependabot alerts / ❌ New alerts (list packages and fix with `overrides`)

**Step 8 — CodeQL alerts:**

```
mcp_github_search_issues  query: "repo:kirkhezir/church_app is:open label:security"
```

Report: ✅ No new CodeQL findings / ❌ New findings (list and fix before next push)

Only report **"All checks passed ✅ — safe to continue"** when steps 1–8 all pass.

## Quick reference: common fixes

| Failure                                                     | Fix                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `error TS6133: 'X' is declared but its value is never read` | Delete the unused import/variable                                   |
| `error TS2322` on Prisma include                            | Change `: false` → `: undefined`                                    |
| `npm audit` shows vulnerabilities                           | `npm audit fix` or add `overrides` in `package.json`                |
| Vite build fails on missing module                          | Check `@/` alias path is correct                                    |
| New Dependabot alert after push                             | Add `overrides` entry, run `npm install`, re-audit, push fix        |
| CodeQL finding after push                                   | Fix the flagged pattern (injection, XSS, hardcoded secret), re-push |
| Secret scan detects a secret                                | Rotate the credential immediately, remove from history, re-push     |
