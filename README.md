# Church Management Application - Sing Buri Adventist Center

A comprehensive full-stack web application for managing church operations including member authentication with MFA, event management, announcements, member directory, and internal messaging.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Test Coverage](https://img.shields.io/badge/coverage-80%25+-green)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

### Core Features

- **Public Landing Page** - Church information, worship times, location map, contact form
- **Member Authentication** - Secure login with JWT, password reset, account lockout protection
- **Multi-Factor Authentication (MFA)** - TOTP-based MFA for admin/staff accounts
- **Event Management** - Create, manage, and RSVP to church events
- **Announcement System** - Post announcements with priority levels and email notifications
- **Member Directory** - Searchable directory with privacy controls
- **Internal Messaging** - Member-to-member messaging with real-time notifications
- **Admin Dashboard** - Member management, audit logs, data export
- **Push Notifications** - Web push notifications for events and announcements
- **PDF Reports** - Generate member directory, events, and attendance reports

### Technical Features

- Clean Architecture design pattern
- Real-time notifications via WebSockets (Socket.io)
- Role-based access control (Admin, Staff, Member)
- Automated backups with retention policies
- Comprehensive API documentation (OpenAPI/Swagger)
- Error monitoring with Sentry integration
- Health check endpoints for monitoring
- CDN-optimized static asset delivery
- Staging environment configuration

## 🛠 Tech Stack

### Backend

| Technology | Version  | Purpose                 |
| ---------- | -------- | ----------------------- |
| Node.js    | 20.x LTS | Runtime environment     |
| TypeScript | 5.x      | Type-safe JavaScript    |
| Express.js | 4.x      | Web framework           |
| PostgreSQL | 15+      | Primary database        |
| Prisma     | 6.x      | Database ORM            |
| Socket.io  | 4.x      | Real-time communication |
| Jest       | 29.x     | Testing framework       |

### Frontend

| Technology   | Version | Purpose              |
| ------------ | ------- | -------------------- |
| React        | 18.x    | UI framework         |
| TypeScript   | 5.x     | Type-safe JavaScript |
| Vite         | 5.x     | Build tool           |
| shadcn/ui    | Latest  | UI component library |
| Tailwind CSS | 3.x     | Utility-first CSS    |
| React Router | 6.x     | Client-side routing  |
| Axios        | 1.x     | HTTP client          |

## 📁 Project Structure

```
├── backend/                  # Node.js/Express API server
│   ├── src/
│   │   ├── domain/          # Business entities and logic
│   │   ├── application/     # Use cases and services
│   │   ├── infrastructure/  # Database, email, external APIs
│   │   └── presentation/    # Controllers, routes, middleware
│   ├── prisma/              # Database schema and migrations
│   ├── tests/               # Unit, integration, and contract tests
│   └── docs/                # Backend documentation
│
├── frontend/                 # React web application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   ├── features/    # Feature-specific components
│   │   │   └── layout/      # Layout components
│   │   ├── pages/           # Route-level pages
│   │   ├── services/        # API client layer
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React Context providers
│   │   └── types/           # TypeScript type definitions
│   └── tests/               # Component tests
│
├── tests/                    # End-to-end tests (Playwright)
├── specs/                    # Feature specifications
│   └── 001-full-stack-web/
│       ├── contracts/       # OpenAPI specifications
│       └── tasks.md         # Implementation tasks
│
├── scripts/                  # Utility scripts (backup, deployment)
└── docs/                     # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **PostgreSQL** >= 15
- **Git**

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd church_app
   ```

2. **Install dependencies**

   ```bash
   # Install root dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment**

   Backend (`backend/.env`):

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

   Frontend (`frontend/.env`):

   ```bash
   cd ../frontend
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Setup database**

   ```bash
   cd backend
   npx prisma migrate dev
   npx prisma generate
   npm run prisma:seed
   ```

5. **Start development servers**

   Terminal 1 - Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 - Frontend:

   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000/api/v1
   - API Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health

### Default Credentials (Development)

| Role   | Email                         | Password  |
| ------ | ----------------------------- | --------- |
| Admin  | admin@singburi-adventist.org  | admin123  |
| Staff  | staff@singburi-adventist.org  | staff123  |
| Member | member@singburi-adventist.org | member123 |

> ⚠️ **Important**: Change these credentials in production!

## 📖 API Documentation

Interactive API documentation is available at `/api-docs` when the backend server is running.

### Key Endpoints

| Endpoint                  | Method   | Description             |
| ------------------------- | -------- | ----------------------- |
| `/api/v1/auth/login`      | POST     | User authentication     |
| `/api/v1/auth/mfa/verify` | POST     | MFA verification        |
| `/api/v1/members`         | GET      | Member directory        |
| `/api/v1/events`          | GET/POST | Event management        |
| `/api/v1/announcements`   | GET/POST | Announcements           |
| `/api/v1/messages`        | GET/POST | Internal messaging      |
| `/api/v1/admin/members`   | GET/POST | Admin member management |
| `/api/v1/contact`         | POST     | Public contact form     |
| `/api/v1/dashboard`       | GET      | Member dashboard data   |
| `/api/v1/push/subscribe`  | POST     | Push notification sub   |
| `/api/v1/reports/members` | GET      | Generate member PDF     |
| `/health`                 | GET      | Health check endpoint   |
| `/health/detailed`        | GET      | Detailed health status  |

### API Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Rate Limiting

- **Contact Form:** 10 requests per minute per IP
- **Login Attempts:** 5 attempts before 15-minute lockout
- **API Endpoints:** 100 requests per minute per user

For complete API documentation, see:

- [OpenAPI Specification](./specs/001-full-stack-web/contracts/openapi.yaml)
- Interactive Docs: http://localhost:3000/api-docs

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test suites
npm run test:integration    # Integration tests
npm run test:contract       # Contract tests
```

### Frontend Tests

```bash
cd frontend

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

### End-to-End Tests

```bash
# From project root
npx playwright test

# Run with UI
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/authentication.spec.ts
```

### Coverage Requirements

- **Minimum coverage**: 80% for all code
- **Domain/Application layers**: 90%+ coverage required
- **All tests must pass** before merging to main branch

## 🔒 Security

### Authentication Flow

1. User submits email/password
2. Server validates credentials
3. JWT access token (15min) and refresh token (7 days) issued
4. Admin/Staff accounts require MFA verification
5. Sessions timeout after 24 hours of inactivity

### Security Features

- Password hashing with bcrypt (10 salt rounds)
- Account lockout after 5 failed attempts (15 minutes)
- TOTP-based MFA for privileged accounts
- HTTPS enforcement in production
- Helmet.js security headers
- CORS protection
- Input sanitization
- SQL injection prevention via Prisma

### MFA Setup (Admin/Staff)

See [MFA Setup Guide](./docs/mfa-setup.md) for detailed instructions.

## 🏗 Architecture

This application follows **Clean Architecture** principles:

```
┌──────────────────────────────────────────────┐
│                Presentation                   │
│  (Controllers, Routes, Middleware, DTOs)      │
├──────────────────────────────────────────────┤
│                Application                    │
│  (Use Cases, Services, Business Logic)        │
├──────────────────────────────────────────────┤
│                   Domain                      │
│  (Entities, Value Objects, Interfaces)        │
├──────────────────────────────────────────────┤
│               Infrastructure                  │
│  (Database, Email, WebSocket, External APIs)  │
└──────────────────────────────────────────────┘
```

### Key Principles

- **Dependency Inversion**: Inner layers don't depend on outer layers
- **Single Responsibility**: Each class has one reason to change
- **Interface Segregation**: Specific interfaces over general ones
- **Open/Closed**: Open for extension, closed for modification

## 🚀 Deployment

### Production Environment Setup

1. **Environment Variables**

   ```bash
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:5432/church_app
   JWT_SECRET=<strong-random-secret>
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Build for Production**

   ```bash
   # Backend
   cd backend
   npm run build

   # Frontend
   cd frontend
   npm run build
   ```

3. **Database Migration**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Docker Deployment

```bash
docker-compose up -d
```

See [Deployment Guide](./docs/deployment.md) for detailed instructions.

## 📊 Performance

### Benchmarks (Phase 3 Baseline)

- **Throughput**: 2,324 req/s
- **Response Time**: 3.83ms avg (P95: 7ms, P99: 8ms)
- **Rate Limiting**: 100% effective at 10 req/min per IP
- **Error Rate**: 0% under normal load

### Performance Requirements

- API P95 latency < 200ms
- Frontend initial load < 2 seconds on 3G
- Support for 200+ concurrent users

## 🚀 Production Deployment

### Quick Deploy with Docker

```bash
# 1. Generate production secrets
./scripts/generate-secrets.sh

# 2. Configure environment
cp .env.production.example .env
# Edit .env with your values

# 3. Setup SSL certificates
./scripts/setup-ssl.sh yourdomain.com admin@yourdomain.com letsencrypt

# 4. Deploy
./scripts/deploy.sh production
```

### Docker Compose Services

| Service  | Port   | Description   |
| -------- | ------ | ------------- |
| backend  | 3000   | API server    |
| frontend | 80/443 | Nginx + React |
| postgres | 5432   | Database      |
| redis    | 6379   | Cache         |

### Environment Variables

See [.env.production.example](.env.production.example) for all required variables.

**Required:**

- `JWT_SECRET` - 64-char secret for JWT signing
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_PASSWORD` - Redis authentication
- `CORS_ORIGIN` - Allowed origins

### Monitoring Stack

```bash
# Start monitoring (Prometheus, Grafana, Alertmanager)
docker compose -f docker-compose.monitoring.yml up -d

# Access:
# - Grafana: http://localhost:3002
# - Prometheus: http://localhost:9090
# - Alertmanager: http://localhost:9093
```

### Backup & Recovery

```bash
# Create backup
./scripts/backup-database.sh

# Restore from backup
./scripts/restore-database.sh backups/backup_file.sql.gz

# Sync to S3
./scripts/sync-backups-s3.sh
```

### CI/CD Pipeline

The project includes GitHub Actions workflows:

- **ci-cd.yml** - Main CI/CD pipeline
- **deploy-staging.yml** - Auto-deploy to staging
- **release.yml** - Release workflow with changelog
- **security-scan.yml** - Security scanning
- **backup.yml** - Automated backups

For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests first (TDD approach)
4. Implement your changes
5. Run tests (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

Sing Buri Adventist Center

- Website: https://singburiadventist.org
- Email: admin@singburiadventist.org

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Prisma](https://prisma.io/) for the excellent database toolkit
- The open-source community for the amazing tools and libraries

---

Built with ❤️ for Sing Buri Adventist Center
