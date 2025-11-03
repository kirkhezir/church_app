# Implementation Plan: Church Management Application for Sing Buri Adventist Center

**Branch**: `001-full-stack-web` | **Date**: October 15, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-full-stack-web/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a full-stack web application for Sing Buri Adventist Center enabling church management through a public landing page, member authentication system, event management, announcements, and member directory. The application follows Clean Architecture principles with API-first design, using React with shadcn/ui for frontend, Node.js/TypeScript for backend, and PostgreSQL for data persistence.

## Technical Context

**Language/Version**: TypeScript 5.x (Node.js 20.x LTS for backend, React 18.x for frontend)  
**Primary Dependencies**:

- Backend: Express.js or Fastify, Prisma ORM, JWT authentication, bcrypt
- Frontend: React 18, shadcn/ui (Radix UI + Tailwind CSS), React Router, Axios/Fetch API
- Testing: Jest, Supertest, React Testing Library, Cypress or Playwright

**Storage**: PostgreSQL 15+ (relational integrity for church data, member relationships, event tracking)  
**Testing**: Jest (unit tests), Supertest (API integration tests), React Testing Library (component tests), Cypress/Playwright (E2E)  
**Target Platform**: Web application (responsive design for desktop, tablet, mobile browsers)  
**Project Type**: Web (full-stack with separate frontend/backend following Clean Architecture)  
**Performance Goals**:

- API P95 latency < 200ms for standard queries
- Frontend initial load < 2 seconds on 3G networks
- Support 200 concurrent users during peak usage
- Frontend bundle < 200KB gzipped

**Constraints**:

- 99.5% uptime during church operating hours
- Responsive design (mobile-first)
- WCAG 2.1 Level AA accessibility compliance
- Single timezone operation
- 24-hour session timeout

**Scale/Scope**:

- Initial: 100-500 church members
- Growth potential: scalable to thousands
- ~5 user roles (Admin, Staff, Member, Guest)
- ~15-20 major features/pages
- RESTful API with ~30-40 endpoints

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Initial Check (Pre-Phase 0)**: ✅ **PASSED**

- [x] **Clean Architecture**: Backend follows domain → application → infrastructure → presentation layers. Frontend separates UI components from business logic and API services.
- [x] **Test-Driven Development**: Three-tier test strategy: Jest unit tests (80%+ coverage), Supertest integration tests for APIs, Cypress/Playwright E2E tests for critical user flows (login, RSVP, announcements).
- [x] **DRY Principle**: Shared utilities for validation, authentication middleware, reusable React components (shadcn/ui), centralized API client, common TypeScript types/interfaces.
- [x] **KISS Principle**: Standard CRUD operations, conventional REST API patterns, well-established React hooks patterns, no premature optimization or complex state management until proven necessary.
- [x] **YAGNI Principle**: Spec explicitly excludes donations, mobile apps, video streaming, multi-language, multi-campus. Building only P1-P5 features defined in spec.
- [x] **Separation of Concerns**: Backend business logic independent of Express/Fastify framework. Frontend UI components pure presentation, API calls isolated in service layer. Database access only through Prisma ORM in infrastructure layer.
- [x] **API-First Design**: OpenAPI/Swagger schema to be defined in Phase 1 before implementation. RESTful conventions with versioned endpoints (/api/v1/...).
- [x] **Security Requirements**: JWT authentication with refresh tokens, RBAC (Admin/Staff/Member roles), bcrypt password hashing, account lockout after 5 failed attempts, 1-hour password reset expiration, audit logging for admin actions, input validation/sanitization, HTTPS enforced.
- [x] **Performance Standards**: Database query indexing (user email, event dates), Redis caching for member directory and announcements (if needed), CDN for static assets, lazy loading for frontend routes, image optimization.

**Post-Phase 1 Re-evaluation**: ✅ **PASSED**

After completing research.md, data-model.md, contracts/openapi.yaml, and quickstart.md:

- [x] **Clean Architecture Verified**: Data model entities are framework-agnostic (domain layer). Prisma schema in infrastructure. OpenAPI contract defines presentation layer DTOs independently.
- [x] **API-First Design Verified**: OpenAPI 3.0 specification complete with all endpoints, request/response schemas, authentication, and error handling. Contract defined before any implementation.
- [x] **DRY Verified**: Prisma schema is single source of truth for database and TypeScript types. OpenAPI schemas define shared DTOs. shadcn/ui provides reusable UI components.
- [x] **KISS Verified**: RESTful conventions throughout. Standard JWT auth. Conventional HTTP status codes. No over-engineering detected.
- [x] **Security Verified**: Multi-layer security strategy documented in research.md. All constitutional security requirements addressed in OpenAPI spec and data model including MFA for admin/staff roles using speakeasy TOTP.
- [x] **Real-time Communication**: Socket.io WebSockets selected for FR-032a real-time notifications (research.md Section 6).
- [x] **Location Display**: Google Maps Embed API selected for church location display (research.md Section 9).

**Post-Specification Analysis Re-evaluation** (November 3, 2025): ✅ **PASSED**

After comprehensive specification analysis and remediation:

- [x] **TDD Compliance**: All 9 phases now include test tasks BEFORE implementation following red-green-refactor cycle. Test coverage configuration (80% minimum, 90% for business logic) in place.
- [x] **MFA Implementation**: Complete multi-factor authentication flow added for admin/staff roles (17 tasks: T285-T301) using speakeasy library with TOTP, QR codes, and backup codes.
- [x] **Missing Functional Requirements**: FR-034 (audit log viewing), FR-035 (automated backups), and FR-036 (data export) all addressed with dedicated tasks.
- [x] **Technology Specifications**: Socket.io for real-time WebSockets, Google Maps Embed API for location display, speakeasy for MFA TOTP all documented in research.md.
- [x] **Session Management**: 24-hour auto-logout implemented in AuthContext (T043).
- [x] **Incremental Testing**: Load tests scheduled after each user story completion plus final comprehensive testing.

**Violations**: None detected. All constitutional principles and critical requirements satisfied. Total implementation: 383 TDD-compliant tasks across 9 phases.

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── domain/              # Business entities and logic (innermost layer)
│   │   ├── entities/        # Member, Event, Announcement, Message
│   │   ├── valueObjects/    # Email, Role, EventCategory, etc.
│   │   └── interfaces/      # Repository interfaces (dependency inversion)
│   ├── application/         # Use cases and application services
│   │   ├── useCases/        # AuthenticateUser, CreateEvent, SendAnnouncement, etc.
│   │   ├── services/        # EmailService, NotificationService
│   │   └── dtos/            # Data transfer objects for use cases
│   ├── infrastructure/      # Database, external APIs, frameworks
│   │   ├── database/        # Prisma client, repositories implementation
│   │   ├── email/           # Email provider integration (SMTP, SendGrid, etc.)
│   │   ├── auth/            # JWT token generation/validation
│   │   └── cache/           # Redis client (if implemented)
│   └── presentation/        # Controllers, routes, DTOs
│       ├── controllers/     # Express/Fastify route handlers
│       ├── routes/          # API route definitions
│       ├── middleware/      # Auth, validation, error handling
│       └── dtos/            # Request/response data transfer objects
├── prisma/
│   └── schema.prisma        # Database schema definition
└── tests/
    ├── unit/                # Domain logic, use cases
    ├── integration/         # API endpoints with test database
    └── contract/            # OpenAPI contract validation

frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components (Button, Input, Card, etc.)
│   │   ├── layout/         # Header, Footer, Sidebar, Navigation
│   │   └── features/       # EventCard, AnnouncementList, MemberProfile, etc.
│   ├── pages/               # Route-level page components
│   │   ├── public/         # LandingPage, ContactPage
│   │   ├── auth/           # LoginPage, PasswordResetPage
│   │   ├── dashboard/      # MemberDashboard, AdminDashboard
│   │   ├── events/         # EventsListPage, EventDetailPage, EventCreatePage
│   │   ├── announcements/  # AnnouncementsPage, AnnouncementArchivePage
│   │   └── members/        # MemberDirectoryPage, MemberProfilePage
│   ├── services/            # API client layer
│   │   ├── api/            # Axios client configuration
│   │   └── endpoints/      # authService, eventService, memberService, etc.
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts      # Authentication state management
│   │   ├── useEvents.ts    # Event data fetching
│   │   └── useNotifications.ts  # Notification handling
│   ├── lib/                 # Utility functions and configurations
│   │   ├── utils.ts        # Common utilities (cn, formatDate, etc.)
│   │   └── validators.ts   # Form validation helpers
│   ├── styles/              # Global styles and Tailwind config
│   │   └── globals.css     # Tailwind imports and custom styles
│   └── types/               # TypeScript type definitions
│       └── api.ts          # Shared types matching backend DTOs
└── tests/
    ├── unit/                # Component tests, utility tests
    │   └── components/     # React Testing Library tests
    └── e2e/                 # End-to-end user flows
        └── specs/          # Cypress/Playwright test specs

.specify/                    # Project specification and memory
├── memory/
│   └── constitution.md     # Project principles (already exists)
├── scripts/
│   └── powershell/         # Setup and utility scripts
└── templates/              # Document templates

specs/001-full-stack-web/   # This feature's documentation
├── spec.md                 # Feature specification (exists)
├── plan.md                 # This file (in progress)
├── research.md             # Phase 0 output (to be created)
├── data-model.md           # Phase 1 output (to be created)
├── quickstart.md           # Phase 1 output (to be created)
└── contracts/              # Phase 1 output (to be created)
    └── openapi.yaml        # OpenAPI specification
```

**Structure Decision**: Web application with Clean Architecture selected. This is a full-stack web application with clear frontend/backend separation. The backend follows strict layering (domain → application → infrastructure → presentation) per constitutional requirements. Frontend uses component-based architecture with shadcn/ui components in `src/components/ui/` directory (owned by project, not npm dependency).

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

**No violations detected.** All constitutional principles are satisfied by the proposed architecture and technical approach.
