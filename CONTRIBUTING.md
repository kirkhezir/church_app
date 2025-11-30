# Contributing to Church Management Application

Thank you for your interest in contributing to the Church Management Application for Sing Buri Adventist Center! This document provides guidelines and best practices for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Architecture Guidelines](#architecture-guidelines)

## 📜 Code of Conduct

By participating in this project, you agree to:

- Be respectful and inclusive
- Welcome constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

1. **Node.js** >= 20.0.0
2. **npm** >= 10.0.0
3. **PostgreSQL** >= 15
4. **Git**

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/church_app.git
   cd church_app
   ```

3. Add the upstream repository:

   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/church_app.git
   ```

4. Install dependencies:

   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

5. Copy environment files:

   ```bash
   cd backend && cp .env.example .env
   cd ../frontend && cp .env.example .env
   ```

6. Setup database:
   ```bash
   cd backend
   npx prisma migrate dev
   npm run prisma:seed
   ```

## 🔄 Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:

| Prefix      | Purpose           | Example                    |
| ----------- | ----------------- | -------------------------- |
| `feature/`  | New features      | `feature/event-calendar`   |
| `fix/`      | Bug fixes         | `fix/login-validation`     |
| `refactor/` | Code refactoring  | `refactor/auth-middleware` |
| `docs/`     | Documentation     | `docs/api-examples`        |
| `test/`     | Test improvements | `test/event-coverage`      |
| `chore/`    | Maintenance tasks | `chore/dependency-updates` |

### Working on a Feature

1. Sync with upstream:

   ```bash
   git checkout main
   git fetch upstream
   git merge upstream/main
   ```

2. Create a feature branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Write tests FIRST (TDD approach):

   ```bash
   # Write failing tests
   npm test -- --watch
   ```

4. Implement your feature to make tests pass

5. Run all tests:

   ```bash
   # Backend tests
   cd backend && npm test

   # Frontend tests
   cd frontend && npm test

   # E2E tests
   npx playwright test
   ```

6. Commit your changes (see [Commit Guidelines](#commit-message-guidelines))

7. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

8. Create a Pull Request

## 📝 Code Style Guidelines

### TypeScript

We follow strict TypeScript practices:

```typescript
// ✅ Good: Explicit types
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad: Implicit any
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### Naming Conventions

| Type       | Convention               | Example              |
| ---------- | ------------------------ | -------------------- |
| Files      | kebab-case               | `member-service.ts`  |
| Classes    | PascalCase               | `MemberService`      |
| Functions  | camelCase                | `getMemberById`      |
| Constants  | SCREAMING_SNAKE_CASE     | `MAX_LOGIN_ATTEMPTS` |
| Interfaces | PascalCase with I prefix | `IMemberRepository`  |
| Types      | PascalCase               | `MemberRole`         |

### File Organization

```typescript
// 1. Imports (grouped and sorted)
import { PrismaClient } from "@prisma/client";
import { logger } from "../infrastructure/logging/logger";
import { Member } from "../domain/entities/Member";
import type { IMemberRepository } from "../domain/interfaces/IMemberRepository";

// 2. Constants
const MAX_RESULTS = 100;

// 3. Types/Interfaces
interface ServiceOptions {
  includeInactive?: boolean;
}

// 4. Main class/function
export class MemberService {
  // ...
}

// 5. Helper functions (if needed)
function formatMemberName(member: Member): string {
  return `${member.firstName} ${member.lastName}`;
}
```

### React Components

```tsx
// ✅ Good: Typed props with interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export function Button({
  label,
  onClick,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
```

### CSS/Tailwind

- Use Tailwind utility classes
- Create custom components in `frontend/src/components/ui/`
- Follow the shadcn/ui patterns

```tsx
// ✅ Good: Tailwind with semantic classes
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">
  Submit
</button>

// ❌ Bad: Inline styles
<button style={{ backgroundColor: 'blue', color: 'white' }}>
  Submit
</button>
```

## 🧪 Testing Requirements

### Test-Driven Development (TDD)

We follow TDD methodology:

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve the code

### Coverage Requirements

| Layer               | Minimum Coverage |
| ------------------- | ---------------- |
| Domain              | 90%              |
| Application         | 90%              |
| Infrastructure      | 80%              |
| Presentation        | 80%              |
| Frontend Components | 80%              |

### Test Types

#### Unit Tests

```typescript
// backend/tests/unit/services/memberService.test.ts
describe("MemberService", () => {
  describe("getMemberById", () => {
    it("should return member when found", async () => {
      // Arrange
      const mockMember = createMockMember();
      mockRepository.findById.mockResolvedValue(mockMember);

      // Act
      const result = await service.getMemberById("123");

      // Assert
      expect(result).toEqual(mockMember);
    });

    it("should throw NotFoundError when member not found", async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getMemberById("123")).rejects.toThrow(NotFoundError);
    });
  });
});
```

#### Integration Tests

```typescript
// backend/tests/integration/auth.test.ts
describe("Authentication Flow", () => {
  it("should login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });
});
```

#### E2E Tests

```typescript
// tests/e2e/login.spec.ts
test("user can login and view dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[name="email"]', "member@example.com");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/dashboard");
  await expect(page.locator("h1")).toContainText("Dashboard");
});
```

### Running Tests

```bash
# Backend unit tests
cd backend && npm test

# Backend with coverage
cd backend && npm test -- --coverage

# Frontend tests
cd frontend && npm test

# E2E tests
npx playwright test

# E2E with UI
npx playwright test --ui
```

## 🔀 Pull Request Process

### Before Submitting

- [ ] All tests pass locally
- [ ] Coverage meets minimum requirements
- [ ] Code follows style guidelines
- [ ] ESLint/Prettier have been run
- [ ] No console.log statements in production code
- [ ] Documentation updated if needed

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated

## Screenshots (if applicable)

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] Documentation updated
```

### Review Process

1. Create PR with descriptive title
2. Fill out the PR template
3. Request review from maintainers
4. Address review comments
5. Ensure CI passes
6. Squash and merge once approved

## 📝 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

| Type       | Description                |
| ---------- | -------------------------- |
| `feat`     | New feature                |
| `fix`      | Bug fix                    |
| `docs`     | Documentation only         |
| `style`    | Formatting, no code change |
| `refactor` | Code refactoring           |
| `test`     | Adding tests               |
| `chore`    | Maintenance tasks          |
| `perf`     | Performance improvement    |

### Examples

```bash
# Feature
feat(events): add RSVP capacity tracking

# Bug fix
fix(auth): resolve token refresh race condition

# Documentation
docs(api): update authentication examples

# Refactoring
refactor(member): extract validation to separate module
```

## 🏗 Architecture Guidelines

### Clean Architecture

Follow the dependency rule - dependencies point inward:

```
Presentation → Application → Domain ← Infrastructure
```

### Domain Layer (`backend/src/domain/`)

- Pure TypeScript, no external dependencies
- Business entities and value objects
- Repository interfaces
- Business rules and validation

```typescript
// ✅ Good: Domain entity with business logic
export class Member {
  constructor(private props: MemberProps) {}

  public recordLoginAttempt(success: boolean): void {
    if (success) {
      this.props.failedLoginAttempts = 0;
      this.props.lockedUntil = null;
    } else {
      this.props.failedLoginAttempts++;
      if (this.props.failedLoginAttempts >= 5) {
        this.lockAccount();
      }
    }
  }
}
```

### Application Layer (`backend/src/application/`)

- Use cases and services
- Orchestrates domain logic
- No framework dependencies

```typescript
// ✅ Good: Use case with single responsibility
export class AuthenticateUser {
  constructor(
    private memberRepository: IMemberRepository,
    private passwordService: IPasswordService,
    private tokenService: ITokenService
  ) {}

  async execute(email: string, password: string): Promise<AuthResult> {
    const member = await this.memberRepository.findByEmail(email);
    if (!member) throw new AuthenticationError("Invalid credentials");

    // ... authentication logic
  }
}
```

### Infrastructure Layer (`backend/src/infrastructure/`)

- Database repositories (Prisma)
- External services (email, etc.)
- Framework implementations

### Presentation Layer (`backend/src/presentation/`)

- Express controllers and routes
- Request/response DTOs
- Middleware

## ❓ Questions?

- Open a [GitHub Discussion](https://github.com/YOUR_ORG/church_app/discussions)
- Email: dev@singburiadventist.org

Thank you for contributing! 🙏
