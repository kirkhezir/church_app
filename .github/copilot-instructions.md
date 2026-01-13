# church_app Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-15

## Active Technologies

- TypeScript 5.x (Node.js 20.x LTS for backend, React 18.x for frontend) (001-full-stack-web)

## Project Structure

```
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x (Node.js 20.x LTS for backend, React 18.x for frontend): Follow standard conventions

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
