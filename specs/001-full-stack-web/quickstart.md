# Quick Start Guide: Church Management Application

**Feature**: 001-full-stack-web  
**Date**: October 15, 2025  
**For**: Developers setting up the development environment

---

## Overview

This guide walks you through setting up the Church Management Application development environment from scratch. By the end, you'll have both backend and frontend running locally with a test database.

**Estimated Setup Time**: 30-45 minutes

---

## Prerequisites

### Required Software

Install the following before proceeding:

1. **Node.js 20.x LTS** ([Download](https://nodejs.org/))

   ```powershell
   node --version  # Should be v20.x.x
   ```

2. **PostgreSQL 15+** ([Download](https://www.postgresql.org/download/))

   ```powershell
   psql --version  # Should be 15 or higher
   ```

3. **Git** ([Download](https://git-scm.com/downloads))

   ```powershell
   git --version
   ```

4. **VS Code** (recommended) with extensions:
   - ESLint
   - Prettier
   - Prisma
   - REST Client (for API testing)

---

## Step 1: Clone Repository

```powershell
# Clone the repository
git clone https://github.com/your-org/church-app.git
cd church-app

# Checkout the feature branch
git checkout 001-full-stack-web
```

---

## Step 2: Backend Setup

### 2.1 Install Dependencies

```powershell
cd backend
npm install
```

### 2.2 Configure Environment Variables

Create `.env` file in `backend/` directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/church_app_dev"

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-generated-secret-key-here"
JWT_REFRESH_SECRET="another-generated-secret-key-here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
EMAIL_FROM="Sing Buri Adventist Center <noreply@singburiadventist.org>"

# Application
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"

# Session
SESSION_TIMEOUT_HOURS=24

# Account Security
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_MINUTES=15
PASSWORD_RESET_EXPIRES_HOURS=1
```

**Note**: For Gmail, enable 2FA and generate an [App Password](https://support.google.com/accounts/answer/185833).

### 2.3 Create Database

```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE church_app_dev;

# Create test database
CREATE DATABASE church_app_test;

# Exit psql
\q
```

### 2.4 Run Database Migrations

```powershell
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with initial data (optional)
npm run db:seed
```

**Seed Script** creates:

- 1 Admin user: `admin@singburiadventist.org` / `Admin123!`
- 2 Staff users
- 10 Member users
- 5 Sample events
- 3 Announcements

### 2.5 Start Backend Server

```powershell
# Development mode with hot reload
npm run dev

# Backend should be running on http://localhost:3000
```

Verify backend is running:

```powershell
# Test health check endpoint
curl http://localhost:3000/api/v1/health
```

---

## Step 3: Frontend Setup

### 3.1 Install Dependencies

Open a **new terminal** window:

```powershell
cd frontend
npm install
```

### 3.2 Initialize shadcn/ui

```powershell
# Initialize shadcn/ui with default config
npx shadcn-ui@latest init

# When prompted, choose:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

### 3.3 Install Core UI Components

```powershell
# Install essential shadcn/ui components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add avatar
```

### 3.4 Configure Environment Variables

Create `.env` file in `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME="Sing Buri Adventist Center"
```

### 3.5 Start Frontend Development Server

```powershell
# Development mode with hot reload
npm run dev

# Frontend should be running on http://localhost:5173
```

---

## Step 4: Verify Installation

### 4.1 Access Application

Open browser and navigate to:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **API Documentation**: http://localhost:3000/api-docs (Swagger UI)

### 4.2 Test Login

1. Go to http://localhost:5173/login
2. Login with seeded admin account:
   - Email: `admin@singburiadventist.org`
   - Password: `Admin123!`
3. You should be redirected to the member dashboard

### 4.3 Test API Endpoints

Use VS Code REST Client extension with `.http` files in `backend/tests/api/`:

```http
### Login
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@singburiadventist.org",
  "password": "Admin123!"
}

### Get Current User (replace {token} with token from login response)
GET http://localhost:3000/api/v1/members/me
Authorization: Bearer {token}

### List Events
GET http://localhost:3000/api/v1/events
Authorization: Bearer {token}
```

---

## Step 5: Run Tests

### 5.1 Backend Tests

```powershell
cd backend

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- auth.test.ts
```

### 5.2 Frontend Tests

```powershell
cd frontend

# Run unit tests
npm test

# Run E2E tests (requires backend running)
npm run test:e2e
```

---

## Development Workflow

### Running Both Servers Concurrently

From repository root:

```powershell
# Install concurrently globally (one-time)
npm install -g concurrently

# Run both backend and frontend
npm run dev:all
```

Or use separate terminals:

- Terminal 1: `cd backend && npm run dev`
- Terminal 2: `cd frontend && npm run dev`

### Database Management

```powershell
# View database in Prisma Studio (GUI)
cd backend
npx prisma studio

# Create new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database again
npm run db:seed
```

### Code Quality Tools

```powershell
# Run linter
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Type check TypeScript
npm run type-check
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to database"

**Solution**: Verify PostgreSQL is running and credentials in `.env` are correct.

```powershell
# Check PostgreSQL status
pg_ctl status

# Restart PostgreSQL (Windows)
pg_ctl restart -D "C:\Program Files\PostgreSQL\15\data"
```

### Issue: "Port 3000 already in use"

**Solution**: Kill process using port 3000 or change PORT in backend `.env`.

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Issue: "Prisma client not generated"

**Solution**: Regenerate Prisma client.

```powershell
cd backend
npx prisma generate
```

### Issue: "shadcn/ui components not found"

**Solution**: Ensure shadcn/ui is initialized and components are installed.

```powershell
cd frontend
npx shadcn-ui@latest init
npx shadcn-ui@latest add <component-name>
```

---

## Next Steps

### For Frontend Development

1. **Implement Landing Page** (`frontend/src/pages/public/LandingPage.tsx`)

   - Church info, worship times, mission statement
   - Contact form integration

2. **Build Member Dashboard** (`frontend/src/pages/dashboard/MemberDashboard.tsx`)

   - Display upcoming events
   - Show recent announcements

3. **Create Event Management UI** (`frontend/src/pages/events/`)
   - Event list/calendar view
   - RSVP functionality
   - Admin event creation form

### For Backend Development

1. **Implement Domain Entities** (`backend/src/domain/entities/`)

   - Member, Event, Announcement, Message classes
   - Business validation logic

2. **Build Use Cases** (`backend/src/application/useCases/`)

   - AuthenticateUser, CreateEvent, SendAnnouncement
   - Follow TDD: write tests first

3. **Create API Controllers** (`backend/src/presentation/controllers/`)
   - Map HTTP requests to use cases
   - Handle errors and validation

### Testing Priorities

1. **Unit Tests**: Domain logic (90% coverage target)
2. **Integration Tests**: API endpoints with test database
3. **E2E Tests**: Critical user flows (login → dashboard → RSVP)

---

## Useful Commands Reference

| Command                          | Description                                    |
| -------------------------------- | ---------------------------------------------- |
| `npm run dev`                    | Start development server (backend or frontend) |
| `npm test`                       | Run all tests                                  |
| `npm run lint`                   | Check code quality                             |
| `npm run format`                 | Format code with Prettier                      |
| `npx prisma studio`              | Open database GUI                              |
| `npx prisma migrate dev`         | Create and apply migration                     |
| `npm run db:seed`                | Seed database with test data                   |
| `git checkout -b feature/<name>` | Create feature branch                          |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  Components → Pages → Services → API (REST)             │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP/JSON
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js/Express)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Presentation Layer (Controllers, Routes, DTOs)  │   │
│  └────────────────────┬────────────────────────────┘   │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────┐    │
│  │ Application Layer (Use Cases, Services)        │    │
│  └────────────────────┬────────────────────────────┘   │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────┐    │
│  │ Domain Layer (Entities, Business Logic)        │    │
│  └────────────────────┬────────────────────────────┘   │
│                       │                                  │
│  ┌────────────────────▼───────────────────────────┐    │
│  │ Infrastructure (Database, Email, Auth)         │    │
│  └─────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────┘
                            ▼
                    ┌───────────────┐
                    │  PostgreSQL   │
                    └───────────────┘
```

---

## Resources

- **Constitution**: `.specify/memory/constitution.md` - Project principles
- **Feature Spec**: `specs/001-full-stack-web/spec.md` - Requirements
- **Data Model**: `specs/001-full-stack-web/data-model.md` - Database schema
- **API Contracts**: `specs/001-full-stack-web/contracts/openapi.yaml` - API spec
- **Research**: `specs/001-full-stack-web/research.md` - Technical decisions

**External Docs**:

- [Prisma Docs](https://www.prisma.io/docs/)
- [shadcn/ui Docs](https://ui.shadcn.com/)
- [React Docs](https://react.dev/)
- [Express Docs](https://expressjs.com/)

---

## Support

For issues or questions:

1. Check `specs/001-full-stack-web/research.md` for technical decisions
2. Review `.specify/memory/constitution.md` for coding principles
3. Consult team lead or senior developer

---

**Status**: ✅ Quick start guide complete. Ready for implementation!
