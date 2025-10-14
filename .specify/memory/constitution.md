<!--
═══════════════════════════════════════════════════════════════════════════
SYNC IMPACT REPORT
═══════════════════════════════════════════════════════════════════════════
Version Change: 1.0.0 → 1.1.0
Date: 2025-10-14

Modified Sections:
  ✓ Technology Stack - Added shadcn/ui and Tailwind CSS
  ✓ Project Structure - Added ui/ and lib/ directories to frontend
  ✓ Added new section: UI Development Standards

Added Content:
  ✓ shadcn/ui as primary UI component library
  ✓ Tailwind CSS for styling
  ✓ MCP server integration guidance for UI implementation
  ✓ Accessibility standards (WCAG 2.1 Level AA)
  ✓ Responsive design and dark mode requirements
  ✓ Component composition and ownership guidelines

Removed Sections:
  - None

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Verified compatible
  ✅ .specify/templates/spec-template.md - Verified compatible
  ✅ .specify/templates/tasks-template.md - Verified compatible

Follow-up TODOs:
  - Initialize shadcn/ui in frontend project when setup begins
  - Configure Tailwind CSS with church-appropriate design tokens
  - Ensure shadcn MCP server is available for UI development

Rationale:
  Amendment adds shadcn/ui as the standard UI component library,
  providing accessible, customizable components. Integration with
  shadcn MCP server accelerates development while maintaining code
  quality. This is a MINOR version bump as it adds new material
  guidance without removing or redefining existing principles.
═══════════════════════════════════════════════════════════════════════════
-->

# Church Management Application Constitution

## Core Principles

### I. Clean Architecture (NON-NEGOTIABLE)

The application MUST follow Clean Architecture principles with clear separation of concerns:

- **Dependency Rule**: Dependencies MUST only point inward. Outer layers can depend on inner layers, never the reverse.
- **Core Domain**: Business logic MUST reside in the domain layer, independent of frameworks, UI, or databases.
- **Interface Adapters**: Controllers, presenters, and gateways MUST act as adapters between use cases and external concerns.
- **Independent Testability**: Each layer MUST be testable in isolation without external dependencies.
- **Framework Independence**: Business rules MUST NOT depend on any external framework or library.

**Rationale**: Clean Architecture ensures long-term maintainability, testability, and adaptability to changing requirements or technology stacks. This is critical for a church management system that may evolve over years.

### II. Test-Driven Development (NON-NEGOTIABLE)

All code MUST be developed following strict Test-Driven Development practices:

- **Red-Green-Refactor**: Write failing test → Make it pass → Refactor. This cycle is mandatory.
- **Test-First**: Tests MUST be written and approved before implementation begins.
- **Coverage Standards**: Minimum 80% code coverage required; 90%+ for business logic.
- **Test Types**: Unit tests (fast, isolated), Integration tests (component interaction), E2E tests (critical user flows).
- **No Code Without Tests**: Pull requests without corresponding tests MUST be rejected.

**Rationale**: TDD prevents regressions, documents behavior, enables confident refactoring, and ensures code quality from day one. Church data is sensitive and critical—bugs are unacceptable.

### III. DRY Principle (Don't Repeat Yourself)

Code duplication MUST be eliminated through proper abstraction:

- **Single Source of Truth**: Every piece of knowledge MUST have a single, unambiguous representation.
- **Reusable Components**: Common functionality MUST be extracted into shared modules, utilities, or services.
- **Configuration Management**: Environment-specific values MUST be externalized and centralized.
- **Three-Strike Rule**: If code appears three times, it MUST be refactored into a reusable abstraction.
- **DRY vs. Premature Abstraction**: Balance DRY with simplicity—don't abstract until patterns emerge.

**Rationale**: DRY reduces maintenance burden, minimizes bugs from inconsistent updates, and improves code readability. However, premature abstraction violates YAGNI and KISS.

### IV. KISS Principle (Keep It Simple, Stupid)

Simplicity MUST be prioritized over cleverness:

- **Readable Over Clever**: Code MUST be obvious and straightforward, not showing off.
- **Minimal Complexity**: Choose the simplest solution that solves the problem adequately.
- **Self-Documenting**: Code SHOULD be self-explanatory; comments explain "why," not "what."
- **Avoid Over-Engineering**: Don't add features or abstractions "just in case."
- **Cognitive Load**: Any developer should understand a module within 15 minutes of reading.

**Rationale**: Simple code is easier to debug, test, maintain, and onboard new developers. Church management volunteers may have varying skill levels—simplicity enables broader contribution.

### V. YAGNI Principle (You Aren't Gonna Need It)

Features MUST NOT be implemented until they are actually needed:

- **No Speculative Features**: Don't build features based on "what if" scenarios.
- **Incremental Development**: Build the minimum viable feature, then iterate based on real feedback.
- **Ruthless Prioritization**: Every feature MUST justify its existence with a real user need.
- **Delete Before Adding**: Remove unused code, dependencies, or features before adding new ones.
- **Cost of Maintenance**: Every line of code has a maintenance cost—minimize the codebase.

**Rationale**: YAGNI reduces complexity, speeds up development, and ensures we build what users actually need. Church needs evolve—we adapt rather than predict.

### VI. Separation of Concerns

The application MUST maintain clear boundaries between different responsibilities:

- **Backend/Frontend Split**: API and UI MUST be completely decoupled with RESTful or GraphQL contracts.
- **Presentation/Business/Data**: UI components MUST NOT contain business logic; business logic MUST NOT perform data access.
- **Module Independence**: Each module MUST have a single, well-defined responsibility.
- **Cross-Cutting Concerns**: Logging, authentication, validation MUST be handled via middleware/interceptors.
- **Database Agnostic**: Domain models MUST NOT depend on ORM annotations or database-specific features.

**Rationale**: Separation of concerns enables parallel development, easier testing, and flexibility to swap implementations without touching business logic.

### VII. API-First Design

All features MUST be designed as API-first with contract-driven development:

- **Contract Definition**: API contracts (OpenAPI/GraphQL schema) MUST be defined before implementation.
- **Consumer-Driven**: APIs MUST be designed from the consumer's perspective, not the database schema.
- **Versioning Strategy**: Breaking changes MUST increment major version (v1, v2); backward compatibility maintained.
- **Documentation**: All endpoints MUST have complete documentation with request/response examples.
- **Testing**: Contract tests MUST verify API compliance before integration.

**Rationale**: API-first ensures frontend and backend teams can work independently, enables mobile app development, and allows third-party integrations for church ecosystem tools.

## Architecture Standards

### Technology Stack

The application MUST use the following technology stack to ensure consistency and best practices:

- **Backend**: Node.js with TypeScript (type safety), Express.js or Fastify (lightweight, fast)
- **Frontend**: React with TypeScript, modern hooks-based architecture
- **UI Components**: shadcn/ui (accessible, customizable components built on Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS (utility-first CSS framework)
- **Database**: PostgreSQL (relational integrity for church data), with Prisma ORM (type-safe queries)
- **Authentication**: JWT-based with OAuth2/OpenID Connect support
- **Testing**: Jest (unit), Supertest (integration), Cypress or Playwright (E2E)
- **API Documentation**: OpenAPI/Swagger for REST or GraphQL with schema documentation
- **Code Quality**: ESLint (linting), Prettier (formatting), Husky (pre-commit hooks)

**Justification**: This stack balances modern best practices, strong typing, rich ecosystem, and proven scalability for full-stack web applications. shadcn/ui provides accessible, production-ready components that can be customized and owned by the project.

### Project Structure

The repository MUST follow this structure for consistency:

```
backend/
├── src/
│   ├── domain/           # Business entities and logic (innermost layer)
│   ├── application/      # Use cases and application services
│   ├── infrastructure/   # Database, external APIs, frameworks
│   └── presentation/     # Controllers, routes, DTOs
└── tests/
    ├── unit/             # Fast, isolated tests
    ├── integration/      # Component interaction tests
    └── contract/         # API contract tests

frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # shadcn/ui components (owned by project)
│   │   └── features/    # Feature-specific composed components
│   ├── pages/            # Route-level page components
│   ├── services/         # API client layer
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions and configurations
│   └── styles/           # Global styles and Tailwind config
└── tests/
    ├── unit/             # Component and utility tests
    └── e2e/              # End-to-end user flows
```

### Security Requirements

Security MUST be built-in from the start:

- **Authentication**: Multi-factor authentication (MFA) required for admin roles.
- **Authorization**: Role-Based Access Control (RBAC) enforced at API and database levels.
- **Data Protection**: Sensitive data (donations, personal info) MUST be encrypted at rest and in transit.
- **Input Validation**: All user input MUST be validated and sanitized to prevent injection attacks.
- **Audit Logging**: All data modifications MUST be logged with user, timestamp, and action.
- **Security Reviews**: All authentication and authorization code MUST undergo peer security review.

**Rationale**: Church data includes sensitive personal information, financial records, and pastoral care notes. Security breaches would damage trust and potentially violate privacy regulations.

### Performance Standards

The application MUST meet these performance benchmarks:

- **API Response Time**: P95 latency < 200ms for standard queries, < 500ms for complex reports.
- **Frontend Load Time**: Initial page load < 2 seconds on 3G networks.
- **Database Queries**: All queries MUST be indexed; N+1 query patterns prohibited.
- **Caching Strategy**: Frequently accessed, slowly changing data MUST be cached (Redis recommended).
- **Bundle Size**: Frontend JavaScript bundle < 200KB gzipped for initial load.

**Justification**: Many churches operate in areas with limited internet connectivity. Fast performance ensures accessibility for all congregants.

### UI Development Standards

Frontend user interface development MUST follow these practices:

- **Component Library**: Use shadcn/ui as the primary component library for consistent, accessible UI elements.
- **Component Ownership**: shadcn/ui components are copied into the project (not installed as dependencies), allowing full customization and ownership.
- **MCP Server Integration**: When implementing UI features, leverage the shadcn MCP server for component scaffolding, examples, and best practices.
- **Accessibility**: All UI components MUST meet WCAG 2.1 Level AA standards (shadcn/ui components are accessible by default via Radix UI).
- **Responsive Design**: All interfaces MUST be fully responsive (mobile-first approach with Tailwind breakpoints).
- **Theme Consistency**: Use Tailwind CSS design tokens for colors, spacing, and typography to maintain visual consistency.
- **Component Composition**: Build complex features by composing shadcn/ui primitives rather than creating from scratch.
- **Dark Mode Support**: All UI MUST support light and dark themes using Tailwind's dark mode utilities.

**Rationale**: shadcn/ui provides production-ready, accessible components that can be customized without dependency lock-in. The MCP server accelerates development with intelligent component suggestions and implementation guidance. This approach balances rapid development with full control over the UI codebase.

## Development Workflow

### Code Review Process

All code changes MUST go through mandatory peer review:

- **Pull Request Template**: Every PR MUST include description, testing steps, and constitution checklist.
- **Review Requirements**: At least one approval from a senior developer required; two for architectural changes.
- **Constitution Compliance**: Reviewers MUST verify adherence to all core principles.
- **Test Verification**: All tests MUST pass in CI/CD before review approval.
- **Documentation Updates**: Any API changes MUST include corresponding documentation updates.

### Branch Strategy

The repository MUST follow this branching model:

- **main**: Production-ready code only; protected branch with required reviews.
- **develop**: Integration branch for features; deployed to staging environment.
- **feature/[###-name]**: Feature branches from develop; merged back via PR.
- **hotfix/[###-name]**: Emergency fixes from main; merged to both main and develop.
- **Branch Naming**: Use ticket number prefix (e.g., feature/123-member-directory).

### Quality Gates

Code MUST pass all quality gates before merging:

1. **Linting**: No ESLint errors; warnings must be justified.
2. **Type Checking**: TypeScript compilation with strict mode enabled.
3. **Unit Tests**: 100% of unit tests passing; coverage >= 80%.
4. **Integration Tests**: All integration tests passing.
5. **Contract Tests**: API contracts validated against implementation.
6. **Security Scan**: No high or critical vulnerabilities in dependencies.
7. **Performance**: No regression in key performance metrics.

### Continuous Integration

CI/CD pipeline MUST automate quality verification:

- **Automated Testing**: Run full test suite on every push.
- **Build Verification**: Ensure clean builds for all environments.
- **Deployment**: Automatic deployment to staging on develop branch merge.
- **Rollback Plan**: Every production deployment MUST have a documented rollback procedure.

## Governance

### Constitution Authority

This constitution supersedes all other development practices and guidelines:

- **Binding**: All team members MUST comply with constitutional principles.
- **Conflict Resolution**: When practices conflict, constitution principles take precedence.
- **Exception Handling**: Exceptions require written justification and approval from tech lead.
- **Enforcement**: Pull requests violating principles MUST be rejected with explanation.

### Amendment Process

Constitutional amendments follow this procedure:

1. **Proposal**: Any team member can propose an amendment with written rationale.
2. **Discussion**: Minimum 7-day discussion period for team feedback.
3. **Approval**: Requires consensus from tech lead and majority of senior developers.
4. **Version Increment**: Amendments trigger version update per semantic versioning.
5. **Migration Plan**: Breaking changes require documented migration path for existing code.
6. **Communication**: All amendments MUST be announced to the full team.

### Versioning Policy

Constitution versions follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Backward-incompatible changes (removing/redefining principles).
- **MINOR**: New principles or material expansions to existing principles.
- **PATCH**: Clarifications, typo fixes, non-semantic refinements.

### Compliance Review

Regular compliance audits ensure adherence:

- **Monthly Code Audits**: Random sampling of merged PRs for principle compliance.
- **Quarterly Architecture Review**: Assess overall system adherence to clean architecture.
- **Annual Constitution Review**: Evaluate if principles still serve project goals.
- **Technical Debt**: Track and prioritize remediation of constitutional violations.

### Living Document

This constitution is a living document that evolves with the project:

- **Feedback Loop**: Team members SHOULD suggest improvements based on real experience.
- **Pragmatism**: Principles serve the project—if a principle hinders progress, propose amendment.
- **Documentation**: Use `.specify/templates/` for operational guidance complementing these principles.

**Version**: 1.1.0 | **Ratified**: 2025-10-14 | **Last Amended**: 2025-10-14