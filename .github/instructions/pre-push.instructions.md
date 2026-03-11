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

### ✅ Step 1 — Confirm CI/CD Passed

Use the GitHub MCP server immediately after every push to verify the pipeline:

```
mcp_github_list_pull_requests   → check open PRs for failures
mcp_github_get_commit           → verify latest commit status
```

Or check the Actions run directly:

- Look for the `ci-cd.yml` workflow run on the `main` branch
- Status must be ✅ success — any ❌ failure must be fixed before the next push

### ✅ Step 2 — Check Security Scan Results

The `security-scan.yml` workflow runs automatically on every push to `main`. After pushing, use GitHub MCP to verify:

```
# Check if security-scan workflow passed
mcp_github_list_issues + filter by label:"security" → no new issues opened by scans
```

Specifically verify:

1. **Dependency scan** (npm audit) — no new HIGH/CRITICAL advisories
2. **Secret scan** (TruffleHog + Gitleaks) — no secrets detected in the commit
3. **OWASP Dependency Check** — no new CVEs introduced
4. **Container scan** (Trivy) — no CRITICAL/HIGH vulnerabilities in Docker images

### ✅ Step 3 — Check Dependabot Alerts

```
# Via GitHub MCP — check for new Dependabot security alerts
mcp_github_list_issues  (owner: kirkhezir, repo: church_app, labels: "dependencies")
```

If new Dependabot alerts appear after your push:

1. Run `npm audit` locally — identify the vulnerable package
2. Add an `overrides` entry in the relevant `package.json`
3. Run `npm install` and re-verify with `npm audit`
4. Push the fix immediately — never leave open Dependabot alerts unresolved

### ✅ Step 4 — Check CodeQL Alerts

CodeQL runs on push to `main`. Use GitHub MCP to verify no new code scanning alerts:

```
mcp_github_search_issues  query: "repo:kirkhezir/church_app is:open label:security"
```

Common CodeQL findings to proactively avoid:

- SQL injection (use Prisma parameterized queries only)
- XSS (all user input passes through `sanitizeInputMiddleware`)
- Hardcoded credentials (never commit secrets — use `.env`)
- Prototype pollution (use `overrides` to force safe lodash/qs versions)

---

## 🛡️ Inline Security Check (Before/During Coding)

Before a code change is considered done — not just before pushing — verify:

- [ ] No credentials, API keys, or secrets in any changed file (`git diff --cached`)
- [ ] User input from requests/forms is validated before use-case execution
- [ ] New endpoints have rate limiting applied
- [ ] New database queries use Prisma parameterized API (never `$queryRawUnsafe`)
- [ ] New file upload handlers validate MIME type and enforce size limits
- [ ] No new URLs are fetched server-side from user-supplied values (SSRF)
- [ ] `npm audit` passes after adding any new dependency
