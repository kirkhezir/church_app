# Research Document: Church Management Application

**Feature**: 001-full-stack-web  
**Date**: October 15, 2025  
**Status**: Complete

## Overview

This document consolidates research findings for technology choices, best practices, and architectural patterns for the Church Management Application. All decisions align with constitutional principles and address specific requirements from the feature specification.

---

## 1. Authentication & Session Management

### Decision: JWT with Refresh Tokens

**Chosen Approach**: JSON Web Tokens (JWT) for stateless authentication with refresh token rotation.

**Rationale**:

- **Stateless**: No server-side session storage required, scales horizontally
- **Standards-compliant**: JWT is industry standard (RFC 7519)
- **Cross-domain ready**: Enables future mobile app or third-party integrations
- **Performance**: No database lookup on every request after initial authentication
- **Security**: Short-lived access tokens (15 min) with long-lived refresh tokens (7 days) in httpOnly cookies

**Implementation Details**:

- Access token stored in memory (React state/context)
- Refresh token in httpOnly, secure, sameSite=strict cookie
- Token rotation: New refresh token issued on each refresh request
- Blacklist for revoked tokens (Redis or DB table) to handle logout

**Alternatives Considered**:

1. **Session-based authentication**: Simpler but requires sticky sessions or centralized session store (Redis), violates stateless REST principles
2. **OAuth2 only**: Over-engineered for initial release; adds complexity without clear benefit for single-tenant church app
3. **Passport.js library**: Considered but adds abstraction layer; direct JWT implementation is simpler and more explicit per KISS principle

**Constitutional Alignment**:

- ✅ KISS: JWT is straightforward, well-documented
- ✅ YAGNI: No OAuth2 until third-party integration is actually needed
- ✅ Security: Meets all security requirements (encryption, expiration, audit logging)

---

## 2. Database Schema Design for Church Domain

### Decision: PostgreSQL with Prisma ORM

**Chosen Approach**: Relational database with normalized schema, Prisma for type-safe queries.

**Rationale**:

- **Relational integrity**: Church data has clear relationships (members → events, members → messages)
- **ACID compliance**: Critical for financial data (future donations feature) and member records
- **Type safety**: Prisma generates TypeScript types from schema, catches errors at compile time
- **Migration management**: Prisma Migrate tracks schema changes with version control
- **Query optimization**: Prisma query engine is performant; raw SQL escape hatch available if needed

**Schema Design Patterns**:

1. **Soft deletes**: Use `deletedAt` timestamp instead of hard deletes for audit trail
2. **Audit fields**: Every table includes `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
3. **Enum types**: Use PostgreSQL enums for roles, event categories (type-safe at DB level)
4. **Indexing strategy**:
   - Unique indexes on email, username
   - Composite indexes on (eventDate, category) for event filtering
   - Full-text search index on announcement content

**Alternatives Considered**:

1. **MongoDB (NoSQL)**: Flexible schema but loses relational integrity; church data is highly structured
2. **TypeORM**: More feature-rich but heavier abstraction; Prisma is simpler and more TypeScript-native
3. **Raw SQL with query builder (Knex)**: More control but loses type safety and migration tooling

**Constitutional Alignment**:

- ✅ Clean Architecture: Prisma repositories implement domain interfaces (dependency inversion)
- ✅ DRY: Prisma schema is single source of truth for DB structure and TypeScript types
- ✅ KISS: Prisma syntax is intuitive, reduces boilerplate

---

## 3. Frontend State Management Strategy

### Decision: React Context + Hooks (No Redux)

**Chosen Approach**: React Context API for global state (auth, user profile) with custom hooks for data fetching.

**Rationale**:

- **YAGNI**: Application state is simple (authenticated user, current page data); Redux adds unnecessary complexity
- **Built-in**: Context API is native to React, no additional dependencies
- **Hooks pattern**: Custom hooks (`useAuth`, `useEvents`, `useAnnouncements`) encapsulate data fetching logic
- **Performance**: Context updates are localized; only components that consume specific context re-render
- **Server state**: For server-cached data, consider React Query or SWR if caching becomes complex

**Implementation Pattern**:

```typescript
// Global state (minimal)
- AuthContext: { user, login, logout, isAuthenticated }
- NotificationContext: { notifications, addNotification, clearNotification }

// Data fetching via custom hooks
- useEvents(): { events, loading, error, refetch }
- useDashboard(): { announcements, upcomingEvents, loading }
```

**When to reconsider**:

- If complex state synchronization across many components emerges
- If optimistic updates and cache invalidation become difficult to manage
- If developer experience suffers from prop drilling despite Context

**Alternatives Considered**:

1. **Redux Toolkit**: Industry standard but adds boilerplate; YAGNI for current scope
2. **Zustand**: Simpler than Redux but still a dependency; Context API is sufficient
3. **React Query**: Excellent for server state caching but adds learning curve; consider for Phase 2 if needed

**Constitutional Alignment**:

- ✅ YAGNI: Not adding state library until proven necessary
- ✅ KISS: Context API is straightforward, minimal abstraction
- ✅ DRY: Custom hooks centralize data fetching logic

---

## 4. API Design Patterns

### Decision: RESTful API with OpenAPI Specification

**Chosen Approach**: RESTful endpoints following REST conventions with OpenAPI 3.0 documentation.

**Rationale**:

- **Convention over configuration**: REST is widely understood, reduces learning curve
- **HTTP semantics**: GET (read), POST (create), PUT (update), DELETE (delete) are intuitive
- **Contract-first**: OpenAPI spec written before implementation ensures frontend/backend alignment
- **Tooling**: OpenAPI enables automatic client generation, validation middleware, API documentation
- **Versioning**: URL-based versioning (`/api/v1/...`) for backward compatibility

**Endpoint Structure**:

```
/api/v1/auth/login                    # POST - Authenticate user
/api/v1/auth/refresh                  # POST - Refresh access token
/api/v1/members                       # GET - List members (filtered, paginated)
/api/v1/members/:id                   # GET - Get member by ID
/api/v1/events                        # GET - List events, POST - Create event
/api/v1/events/:id                    # GET - Event details, PUT - Update, DELETE - Cancel
/api/v1/events/:id/rsvp               # POST - RSVP to event
/api/v1/announcements                 # GET - List announcements, POST - Create
/api/v1/announcements/:id/archive     # POST - Archive announcement
/api/v1/messages                      # GET - List user messages, POST - Send message
```

**Error Handling Standard**:

- HTTP status codes: 200 (success), 201 (created), 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)
- Consistent error response format: `{ "error": { "code": "INVALID_INPUT", "message": "Email is required", "field": "email" } }`

**Alternatives Considered**:

1. **GraphQL**: More flexible queries but adds complexity (schema, resolvers, caching); overkill for CRUD operations
2. **gRPC**: High performance but requires protobuf compilation; unnecessary for web application
3. **HATEOAS REST**: Hypermedia links add discoverability but increase response size and client complexity

**Constitutional Alignment**:

- ✅ API-First Design: OpenAPI contract before implementation
- ✅ KISS: REST conventions are simple and widely understood
- ✅ Separation of Concerns: API layer decoupled from frontend and business logic

---

## 5. Email Notification System

### Decision: NodeMailer with SMTP (configurable provider)

**Chosen Approach**: NodeMailer library with SMTP configuration for admin-defined email provider.

**Rationale**:

- **Provider agnostic**: Works with Gmail, SendGrid, AWS SES, or any SMTP server
- **Admin configurable**: Church can use their existing email service
- **No vendor lock-in**: Easy to switch providers without code changes
- **Template support**: Supports HTML templates for professional email formatting
- **Reliability**: Mature library with proven track record

**Email Types**:

1. **Transactional**: Password reset, account verification, invitation emails
2. **Notification**: Urgent announcements, event updates (if member opted in)
3. **Digest**: Weekly summary of events/announcements (future feature)

**Implementation Pattern**:

- Email templates in `backend/src/infrastructure/email/templates/`
- Queue system (optional Redis Bull queue) for async email sending to prevent API blocking
- Retry logic for failed sends (3 attempts with exponential backoff)
- Opt-out tracking in database (member preferences table)

**Alternatives Considered**:

1. **SendGrid API directly**: Vendor lock-in, requires API key management
2. **AWS SES**: Cost-effective but assumes AWS deployment
3. **Mailgun, Postmark**: Similar to SendGrid, adds dependency on specific provider

**Constitutional Alignment**:

- ✅ KISS: NodeMailer is straightforward SMTP client
- ✅ Framework Independence: Email infrastructure abstracted behind service interface
- ✅ Configuration Management: SMTP credentials externalized to environment variables

---

## 6. Real-Time Messaging Implementation

### Decision: Socket.io WebSockets for Real-Time Notifications

**Chosen Approach**: Socket.io library for WebSocket-based real-time notifications as specified in FR-032a requirement.

**Rationale**:

- **Requirement-driven**: FR-032a explicitly requires "real-time push notifications to online recipients"
- **Ease of use**: Socket.io provides automatic fallback (polling → WebSocket), reconnection logic, and room-based messaging
- **Production-ready**: Mature library with proven scalability and extensive documentation
- **Event-based architecture**: Clean pub/sub pattern aligns with Clean Architecture principles
- **Mobile-ready**: Supports future mobile app development with same backend infrastructure

**Implementation Details**:

- Socket.io server integrated with Express backend
- User authentication via JWT token in Socket.io handshake
- User-specific rooms for targeted message delivery: `user:{userId}`
- Events: `new_message`, `message_read`, `user_online`, `user_offline`
- Automatic reconnection with message queue for offline users
- Horizontal scaling support via Redis adapter (when needed)

**Use Cases**:

1. **Message notifications**: Instant delivery when sender sends message to online recipient
2. **Announcement alerts**: Real-time notification for urgent announcements
3. **Event updates**: Live updates when event is modified/cancelled (for RSVPed members)
4. **Presence indicators**: Optional user online/offline status

**Alternatives Considered**:

1. **HTTP Polling**: Simpler but violates FR-032a requirement for "real-time push"
2. **Server-Sent Events (SSE)**: Unidirectional only; doesn't support bidirectional communication
3. **Native WebSocket API**: Lower-level, requires manual reconnection and fallback logic
4. **Server-Sent Events (SSE)**: One-way communication, still requires separate POST for sending; not significantly simpler than polling
5. **Third-party service (Pusher, Ably)**: External dependency and cost, unnecessary for MVP

**Constitutional Alignment**:

- ✅ YAGNI: Not building WebSocket infrastructure until proven necessary
- ✅ KISS: HTTP polling is simplest approach
- ✅ Performance: 30-second polling meets "real-time for online users" requirement without over-engineering

---

## 7. Frontend Component Library: shadcn/ui

### Decision: shadcn/ui with Tailwind CSS

**Chosen Approach**: Copy shadcn/ui components into project (not npm dependency) with Tailwind CSS for styling.

**Rationale**:

- **Ownership**: Components are copied into codebase, full control and customization
- **Accessibility**: Built on Radix UI primitives (WCAG 2.1 Level AA compliant)
- **Constitutional mandate**: Constitution v1.1.0 specifies shadcn/ui as standard
- **Tailwind integration**: Seamless styling with utility classes, matches constitution styling standard
- **MCP server support**: shadcn MCP server provides intelligent component scaffolding during development
- **No dependency lock-in**: Components are source code in the repo, not versioned package

**Component Setup**:

```bash
# Initialize shadcn/ui in frontend project
npx shadcn-ui@latest init

# Add components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
```

**Customization Approach**:

- Modify `tailwind.config.js` with church-specific color palette (theme colors)
- Adjust component variants in `components/ui/` as needed
- Create composed components in `components/features/` (e.g., EventCard uses Card + Button)

**Alternatives Considered**:

1. **Material-UI (MUI)**: Full framework with heavy JS bundle, violates bundle size constraint (<200KB gzipped)
2. **Ant Design**: Opinionated styling, difficult to customize for church branding
3. **Chakra UI**: Dependency-based install, less control over component code
4. **Custom components from scratch**: Violates DRY and unnecessarily duplicates accessibility work

**Constitutional Alignment**:

- ✅ Constitution compliance: Explicitly mandated in constitution v1.1.0 UI Development Standards
- ✅ Accessibility: WCAG 2.1 Level AA via Radix UI primitives
- ✅ DRY: Reusable components from shadcn/ui library
- ✅ KISS: Pre-built accessible components, no need to reinvent

---

## 8. Multi-Factor Authentication (MFA) for Administrators

### Decision: TOTP-based MFA using speakeasy library

**Chosen Approach**: Time-based One-Time Password (TOTP) authentication for admin and staff roles using authenticator apps.

**Rationale**:

- **Constitutional mandate**: Constitution security requirements specify "Multi-factor authentication (MFA) required for admin roles"
- **Industry standard**: TOTP is RFC 6238 compliant, works with Google Authenticator, Authy, 1Password, etc.
- **No external dependencies**: Self-contained implementation, no third-party MFA service required
- **User-friendly**: Most users already have authenticator apps on their phones
- **Backup codes**: Recovery codes generated during enrollment for account recovery

**Implementation Details**:

- Use `speakeasy` npm library for TOTP generation and validation
- Store encrypted MFA secret in Member table (`mfaSecret` field, encrypted at rest)
- MFA enrollment flow: Generate QR code → User scans with authenticator app → Verify code → Save secret
- Login flow: Email/password → Validate TOTP code → Issue JWT
- Backup codes: Generate 10 single-use recovery codes during enrollment, bcrypt hashed in database
- Grace period: 7 days for admins to enroll in MFA after first login (soft enforcement)

**MFA Exemptions**:

- Member role: MFA optional (can enable voluntarily)
- Staff role: MFA required (same as admin)
- API tokens: Separate API key authentication for programmatic access (future feature)

**Alternatives Considered**:

1. **SMS-based MFA**: Less secure (SIM swapping attacks), requires SMS gateway costs
2. **Email-based codes**: Vulnerable if email account compromised
3. **Hardware tokens (YubiKey)**: More secure but requires physical devices, cost prohibitive for small churches
4. **Third-party service (Auth0, Okta)**: External dependency and cost, unnecessary for church scale

**Constitutional Alignment**:

- ✅ Security Requirements: Fulfills constitutional mandate for admin MFA
- ✅ KISS: TOTP is standard, well-documented, straightforward implementation
- ✅ YAGNI: No complex biometric or hardware token support until requested

---

## 9. Map Integration for Church Location

### Decision: Google Maps Embedded iframe

**Chosen Approach**: Direct Google Maps iframe embed (no API key required) for static church location display on landing page.

**Rationale**:

- **Zero configuration**: No API key or account setup required
- **Familiarity**: Most users recognize and trust Google Maps interface
- **Reliability**: Industry-leading uptime and accuracy
- **Mobile integration**: Seamless "Open in Google Maps app" on mobile devices
- **Completely free**: No usage limits or billing concerns
- **Ease of implementation**: Single iframe tag, no JavaScript or API integration needed
- **Pre-configured**: Specific coordinates and location already set in embed URL

**Implementation Details**:

- **Embed URL**: Pre-generated iframe for "Singburi Seventh Day Adventist (SDA) Center"
- **Coordinates**: 14.8924418, 100.40142999999999 (Sing Buri, Thailand)
- **No API key needed**: Standard Google Maps share/embed feature
- **Responsive iframe**: Tailwind CSS classes for mobile/tablet/desktop sizing
- **Implementation**: Simply paste iframe HTML into landing page component

```html
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3855.800285887927!2d100.40142999999999!3d14.8924418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e1f18a81a744c7%3A0x867c5a12e90f0d17!2sSingburi%20Seventh%20Day%20Adventist%20(SDA)%20Center!5e0!3m2!1sen!2sth!4v1762152706654!5m2!1sen!2sth"
  width="400"
  height="300"
  style="border:0;"
  allowfullscreen=""
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
>
</iframe>
```

**Alternatives Considered**:

1. **Google Maps Embed API (with API key)**: Unnecessary complexity, requires account and key management
2. **OpenStreetMap (Leaflet.js)**: Requires JavaScript library, less familiar to users
3. **Mapbox**: Requires account and credit card on file
4. **Apple Maps**: Limited web support, poor on Android devices
5. **Static map image**: No interactivity (zoom, directions), poor user experience

**Constitutional Alignment**:

- ✅ KISS: Iframe embed is simplest implementation
- ✅ YAGNI: No complex interactive map features (place search, multiple markers) until needed
- ✅ Performance: Iframe loads asynchronously, doesn't block page render

---

## 10. Testing Strategy (TDD-First Approach)

### Decision: Test-Driven Development with Three-Tier Testing Architecture

**Chosen Approach**: **TDD-MANDATORY** - Write tests BEFORE implementation using Jest (unit), Supertest (integration), and Playwright (E2E).

**Rationale**:

- **Constitutional mandate**: Constitution Principle II states "Tests MUST be written and approved before implementation begins" and "No Code Without Tests"
- **Test pyramid**: Many unit tests (fast, isolated), fewer integration tests, minimal E2E tests (slow, comprehensive)
- **Red-Green-Refactor cycle**: Write failing test → Make it pass → Refactor (repeated for every feature)
- **Coverage goals**: Minimum 80% overall, 90%+ for domain/application layers (business logic) - enforced in CI/CD
- **Contract-first**: API contract tests validate OpenAPI spec compliance before controller implementation

**Test Layers**:

1. **Unit Tests (Jest)**

   - Domain entities and value objects
   - Use case logic (business rules)
   - Utility functions
   - React components (React Testing Library)
   - Target: 90%+ coverage for `backend/src/domain/` and `backend/src/application/`

2. **Integration Tests (Supertest)**

   - API endpoint testing with test database
   - Authentication middleware
   - Database repository implementations
   - Third-party service mocks (email, maps)
   - Target: All API routes covered

3. **E2E Tests (Cypress or Playwright)**
   - Critical user flows: login → dashboard, create event → RSVP, post announcement → notification
   - Cross-browser testing (Chrome, Firefox, Safari)
   - Mobile responsive testing
   - Target: P1-P3 user stories from spec.md

**Test Database Strategy**:

- Separate test database (`church_app_test`)
- Database seeding with fixtures before integration tests
- Cleanup after each test suite
- Prisma's `@prisma/client` test utilities for mock data

**Alternatives Considered**:

1. **Only E2E tests**: Too slow for TDD workflow, debugging is difficult
2. **Jest + Testing Library only**: Misses API contract validation and integration issues
3. **Manual QA instead of E2E**: Not reproducible, doesn't catch regressions in CI

**Constitutional Alignment**:

- ✅ TDD: Three-tier strategy supports test-first development
- ✅ Coverage standards: 80% overall, 90% business logic
- ✅ Independent testability: Each layer tested in isolation per Clean Architecture

---

## 9. Deployment & Hosting Strategy

### Decision: Docker containers with PostgreSQL, deployment platform agnostic

**Chosen Approach**: Docker Compose for local development, containerized deployment to any cloud provider (Heroku, AWS, DigitalOcean, etc.).

**Rationale**:

- **Portability**: Docker ensures consistent environment across development and production
- **Church flexibility**: Not locked into specific provider, can choose based on budget and technical expertise
- **Scalability**: Easy to add caching layer (Redis), scale horizontally with load balancer
- **Backup strategy**: Standard PostgreSQL backup tools (pg_dump, WAL archiving) work with any provider

**Deployment Options** (church chooses):

1. **Heroku**: Simplest, managed PostgreSQL, automatic SSL, minimal DevOps knowledge required
2. **AWS (ECS/RDS)**: More complex but cost-effective at scale, full control
3. **DigitalOcean App Platform**: Middle ground, good documentation, affordable
4. **Self-hosted VPS**: Maximum control, requires more technical expertise

**Environment Management**:

- `.env` files for local development (not committed)
- Environment variables for production secrets (DB credentials, JWT secret, SMTP credentials)
- Separate environments: development, staging, production

**Backup Implementation** (per FR-035):

- Automated daily PostgreSQL backups
- 30-day retention policy
- Stored in separate location from primary database (S3, DigitalOcean Spaces, or cloud provider storage)
- Restore test every quarter to verify backup integrity

**Alternatives Considered**:

1. **Serverless (AWS Lambda, Vercel)**: Cost-effective for low traffic but cold starts may violate latency requirements
2. **Kubernetes**: Over-engineered for church application scale, violates KISS and YAGNI
3. **Traditional VPS with manual deployment**: Error-prone, no rollback mechanism, violates automation principles

**Constitutional Alignment**:

- ✅ Framework Independence: Docker abstracts deployment platform
- ✅ KISS: Docker Compose is straightforward for developers
- ✅ Performance: Can deploy to infrastructure meeting latency requirements

---

## 10. Security Best Practices

### Decision: Multi-layer security approach

**Chosen Approach**: Defense in depth with authentication, authorization, input validation, encryption, and audit logging.

**Security Layers**:

1. **Authentication**

   - bcrypt password hashing (salt rounds: 12)
   - JWT access tokens (15 min expiration)
   - Refresh tokens (7 day expiration, httpOnly cookies)
   - Account lockout after 5 failed attempts (15 minute lockout per FR-003a)
   - Password reset links expire after 1 hour (per FR-005)

2. **Authorization**

   - Role-Based Access Control (RBAC): Admin, Staff, Member
   - Middleware checks user role before sensitive operations
   - API endpoints enforce role permissions (e.g., only Admin can create members)
   - Privacy controls: members control field visibility (per FR-030)

3. **Input Validation**

   - Server-side validation (never trust client)
   - Joi or Zod schema validation for request bodies
   - Parameterized queries via Prisma (prevents SQL injection)
   - HTML sanitization for rich text content (announcements)

4. **Data Protection**

   - HTTPS enforced (redirect HTTP to HTTPS)
   - Database encryption at rest (provider-managed or LUKS encryption)
   - Sensitive fields encrypted in database (if needed for pastoral notes, etc.)
   - No passwords logged (sanitize logs)

5. **Audit Logging** (per FR-034)
   - Log all admin actions: create/update/delete members, events, announcements
   - Include: user ID, action type, timestamp, IP address, changed fields
   - Store in separate audit table (append-only)
   - Retention: same as data retention policy (at least 1 year)

**Security Headers**:

- `Content-Security-Policy`: Prevent XSS attacks
- `X-Frame-Options: DENY`: Prevent clickjacking
- `Strict-Transport-Security`: Force HTTPS
- `X-Content-Type-Options: nosniff`: Prevent MIME sniffing

**Dependency Security**:

- Regular `npm audit` in CI pipeline
- Dependabot for automatic security updates
- Pin major versions, auto-update patches

**Alternatives Considered**:

1. **OAuth2/OpenID Connect**: Deferred to future; adds complexity for MVP (YAGNI)
2. **Multi-factor authentication (MFA)**: Required for Admin role (per constitution), optional for members initially
3. **Rate limiting**: Add if abuse detected; not in MVP (YAGNI)

**Constitutional Alignment**:

- ✅ Security Requirements: Meets all constitutional security standards
- ✅ Audit Logging: Admin actions tracked (FR-034)
- ✅ Data Protection: Encryption at rest and in transit

---

## Summary of Key Decisions

| Area                 | Decision                   | Rationale                                                    |
| -------------------- | -------------------------- | ------------------------------------------------------------ |
| **Authentication**   | JWT with refresh tokens    | Stateless, scalable, industry standard                       |
| **Database**         | PostgreSQL + Prisma        | Relational integrity, type safety, migration management      |
| **State Management** | React Context + Hooks      | YAGNI - no Redux needed for simple state                     |
| **API Design**       | RESTful with OpenAPI       | Convention over configuration, well-understood               |
| **Email**            | NodeMailer (SMTP)          | Provider agnostic, no vendor lock-in                         |
| **Real-time**        | HTTP polling (30s)         | YAGNI - WebSocket deferred until proven necessary            |
| **UI Library**       | shadcn/ui + Tailwind       | Constitutional mandate, accessible, customizable             |
| **Testing**          | Jest + Supertest + Cypress | Three-tier strategy per TDD requirements                     |
| **Deployment**       | Docker containers          | Portable, platform agnostic                                  |
| **Security**         | Multi-layer defense        | Authentication, authorization, validation, encryption, audit |

---

## Open Questions / Future Research

_None at this time._ All technical unknowns have been resolved. Constitution Check passes with no violations.

---

**Status**: ✅ Research complete. Ready for Phase 1 (Design & Contracts).
