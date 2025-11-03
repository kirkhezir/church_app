# Church Management Application - Sing Buri Adventist Center

A full-stack web application for managing church operations including member authentication, event management, announcements, and member directory.

## Tech Stack

### Backend

- **Runtime**: Node.js 20.x LTS
- **Language**: TypeScript 5.x
- **Framework**: Express.js
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Authentication**: JWT with refresh tokens
- **Testing**: Jest, Supertest
- **Real-time**: Socket.io

### Frontend

- **Framework**: React 18.x with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Testing**: Jest, React Testing Library, Playwright

## Project Structure

```
├── backend/          # Node.js/Express API server
│   ├── src/
│   │   ├── domain/         # Business entities and logic
│   │   ├── application/    # Use cases and services
│   │   ├── infrastructure/ # Database, external APIs
│   │   └── presentation/   # Controllers, routes, middleware
│   ├── prisma/       # Database schema and migrations
│   └── tests/        # Unit, integration, and contract tests
│
├── frontend/         # React web application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level pages
│   │   ├── services/    # API client layer
│   │   ├── hooks/       # Custom React hooks
│   │   └── types/       # TypeScript type definitions
│   └── tests/        # Component and E2E tests
│
├── tests/            # End-to-end tests (Playwright)
└── specs/            # Feature specifications and documentation

```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL >= 15

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd church_app
```

2. **Install backend dependencies**

```bash
cd backend
npm install
```

3. **Install frontend dependencies**

```bash
cd ../frontend
npm install
```

4. **Setup environment variables**

Backend:

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and configuration
```

Frontend:

```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
```

5. **Setup database**

```bash
cd backend
npx prisma migrate dev
npx prisma generate
npm run prisma:seed
```

### Development

Run backend and frontend concurrently:

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173 and the backend API at http://localhost:3000.

### Testing

**Backend tests:**

```bash
cd backend
npm test                    # Run all tests with coverage
npm run test:watch          # Watch mode
npm run test:integration    # Integration tests only
npm run test:contract       # Contract tests only
```

**Frontend tests:**

```bash
cd frontend
npm test                    # Run all tests with coverage
npm run test:watch          # Watch mode
```

**E2E tests:**

```bash
cd tests/e2e
npx playwright test
```

## Architecture

This application follows **Clean Architecture** principles:

- **Domain Layer**: Business entities and logic (innermost, framework-independent)
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: Database access, external APIs, frameworks
- **Presentation Layer**: API controllers, routes, DTOs

## Development Principles

- **Test-Driven Development (TDD)**: Write tests before implementation
- **DRY (Don't Repeat Yourself)**: Minimize code duplication
- **KISS (Keep It Simple, Stupid)**: Prefer simple solutions
- **YAGNI (You Aren't Gonna Need It)**: Build only what's needed
- **Separation of Concerns**: Clear boundaries between layers

## License

MIT

## Contact

Sing Buri Adventist Center
