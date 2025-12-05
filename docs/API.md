# Church Management API Documentation

## Overview

The Church Management API provides RESTful endpoints for managing church members, events, announcements, and internal messaging. This API powers the Sing Buri Adventist Center church management application.

**Base URL:** `http://localhost:3000/api/v1`

## Authentication

The API uses JWT (JSON Web Token) authentication with refresh tokens.

### Authentication Flow

1. **Login** - POST `/auth/login` with email/password
2. **MFA Verification** (if enabled) - POST `/auth/mfa/login` with TOTP code
3. **Access Token** - Use in `Authorization: Bearer <token>` header
4. **Refresh Token** - Use to obtain new access tokens when expired

### Token Expiration

| Token Type    | Expiration |
| ------------- | ---------- |
| Access Token  | 15 minutes |
| Refresh Token | 7 days     |

---

## API Endpoints

### Health Check

| Method | Endpoint | Auth | Description               |
| ------ | -------- | ---- | ------------------------- |
| GET    | `/`      | No   | API health check and info |

---

### 🔐 Authentication

| Method | Endpoint                       | Auth | Description                  |
| ------ | ------------------------------ | ---- | ---------------------------- |
| POST   | `/auth/login`                  | No   | Login with email/password    |
| POST   | `/auth/refresh`                | No   | Refresh access token         |
| POST   | `/auth/logout`                 | Yes  | Logout and invalidate tokens |
| POST   | `/auth/password/reset-request` | No   | Request password reset email |
| POST   | `/auth/password/reset`         | No   | Reset password with token    |

#### MFA (Multi-Factor Authentication)

| Method | Endpoint                 | Auth | Description                        |
| ------ | ------------------------ | ---- | ---------------------------------- |
| POST   | `/auth/mfa/enroll`       | Yes  | Start MFA enrollment (get QR code) |
| POST   | `/auth/mfa/verify`       | Yes  | Verify and complete MFA enrollment |
| POST   | `/auth/mfa/login`        | No   | Verify MFA code during login       |
| POST   | `/auth/mfa/backup-codes` | Yes  | Regenerate backup codes            |
| DELETE | `/auth/mfa`              | Yes  | Disable MFA                        |

#### Login Request

```json
POST /auth/login
{
  "email": "member@example.com",
  "password": "password123"
}
```

#### Login Response

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1...",
    "member": {
      "id": "uuid",
      "email": "member@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "MEMBER"
    },
    "mfaRequired": false
  }
}
```

---

### 👥 Members

| Method | Endpoint                    | Auth | Description                     |
| ------ | --------------------------- | ---- | ------------------------------- |
| GET    | `/members`                  | Yes  | List all members (directory)    |
| GET    | `/members/me`               | Yes  | Get current user profile        |
| GET    | `/members/dashboard`        | Yes  | Get member dashboard data       |
| GET    | `/members/search`           | Yes  | Search members by name          |
| GET    | `/members/:id`              | Yes  | Get member by ID                |
| PATCH  | `/members/me`               | Yes  | Update current user profile     |
| PATCH  | `/members/me/privacy`       | Yes  | Update privacy settings         |
| PATCH  | `/members/me/notifications` | Yes  | Update notification preferences |

#### Get Profile Response

```json
GET /members/me
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "member@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "address": "123 Church St",
    "role": "MEMBER",
    "createdAt": "2024-01-15T10:30:00Z",
    "privacySettings": {
      "showEmail": true,
      "showPhone": false,
      "showAddress": false
    }
  }
}
```

#### Update Profile Request

```json
PATCH /members/me
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "address": "456 New St"
}
```

---

### 📅 Events

| Method | Endpoint            | Auth | Role        | Description       |
| ------ | ------------------- | ---- | ----------- | ----------------- |
| GET    | `/events`           | No   | -           | List all events   |
| GET    | `/events/:id`       | No   | -           | Get event details |
| POST   | `/events`           | Yes  | ADMIN/STAFF | Create event      |
| PATCH  | `/events/:id`       | Yes  | ADMIN/STAFF | Update event      |
| DELETE | `/events/:id`       | Yes  | ADMIN/STAFF | Cancel event      |
| GET    | `/events/:id/rsvps` | Yes  | ADMIN/STAFF | Get event RSVPs   |
| POST   | `/events/:id/rsvp`  | Yes  | -           | RSVP to event     |
| DELETE | `/events/:id/rsvp`  | Yes  | -           | Cancel RSVP       |

#### List Events Request

```
GET /events?category=WORSHIP&startDate=2024-01-01&endDate=2024-12-31&page=1&limit=10
```

#### Event Categories

- `WORSHIP` - Worship services
- `FELLOWSHIP` - Fellowship events
- `OUTREACH` - Community outreach
- `YOUTH` - Youth activities
- `PRAYER` - Prayer meetings
- `SPECIAL` - Special events
- `OTHER` - Other events

#### Create Event Request

```json
POST /events
{
  "title": "Sabbath Service",
  "description": "Weekly Sabbath worship service",
  "startDateTime": "2024-12-07T09:30:00Z",
  "endDateTime": "2024-12-07T12:00:00Z",
  "location": "Main Sanctuary",
  "category": "WORSHIP",
  "maxCapacity": 200,
  "imageUrl": "https://example.com/image.jpg"
}
```

#### RSVP Request

```json
POST /events/:id/rsvp
{
  "status": "CONFIRMED",
  "guestCount": 2
}
```

---

### 📢 Announcements

| Method | Endpoint                       | Auth | Role        | Description              |
| ------ | ------------------------------ | ---- | ----------- | ------------------------ |
| GET    | `/announcements`               | Yes  | -           | List announcements       |
| GET    | `/announcements/:id`           | Yes  | -           | Get announcement         |
| GET    | `/announcements/authors`       | Yes  | -           | Get announcement authors |
| POST   | `/announcements`               | Yes  | ADMIN/STAFF | Create announcement      |
| PUT    | `/announcements/:id`           | Yes  | ADMIN/STAFF | Update announcement      |
| DELETE | `/announcements/:id`           | Yes  | ADMIN/STAFF | Delete announcement      |
| POST   | `/announcements/:id/archive`   | Yes  | ADMIN/STAFF | Archive announcement     |
| POST   | `/announcements/:id/unarchive` | Yes  | ADMIN/STAFF | Restore announcement     |
| POST   | `/announcements/:id/view`      | Yes  | -           | Track view               |
| GET    | `/announcements/:id/analytics` | Yes  | ADMIN/STAFF | Get view analytics       |

#### Create Announcement Request

```json
POST /announcements
{
  "title": "Important Update",
  "content": "This is the announcement content...",
  "priority": "NORMAL",
  "isDraft": false
}
```

#### Announcement Priority

- `NORMAL` - Standard announcement
- `URGENT` - Sends email to all members immediately

---

### 💬 Messages

| Method | Endpoint             | Auth | Description                |
| ------ | -------------------- | ---- | -------------------------- |
| GET    | `/messages`          | Yes  | List messages (inbox/sent) |
| GET    | `/messages/:id`      | Yes  | Get message details        |
| POST   | `/messages`          | Yes  | Send a message             |
| PATCH  | `/messages/:id/read` | Yes  | Mark as read               |
| DELETE | `/messages/:id`      | Yes  | Delete message             |

#### List Messages Request

```
GET /messages?folder=inbox&page=1&limit=20
```

#### Send Message Request

```json
POST /messages
{
  "recipientId": "uuid",
  "subject": "Hello",
  "content": "Message content here..."
}
```

---

### 📞 Contact

| Method | Endpoint   | Auth | Description         |
| ------ | ---------- | ---- | ------------------- |
| POST   | `/contact` | No   | Submit contact form |

#### Contact Form Request

```json
POST /contact
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "I would like to learn more about your church..."
}
```

---

### ⚙️ Admin

> **Note:** All admin routes require ADMIN role + MFA verification

| Method | Endpoint                | Auth            | Description      |
| ------ | ----------------------- | --------------- | ---------------- |
| POST   | `/admin/members`        | Yes (ADMIN+MFA) | Create member    |
| GET    | `/admin/members`        | Yes (ADMIN+MFA) | List all members |
| DELETE | `/admin/members/:id`    | Yes (ADMIN+MFA) | Delete member    |
| GET    | `/admin/audit-logs`     | Yes (ADMIN+MFA) | View audit logs  |
| GET    | `/admin/export/members` | Yes (ADMIN+MFA) | Export members   |
| GET    | `/admin/export/events`  | Yes (ADMIN+MFA) | Export events    |

#### Create Member Request

```json
POST /admin/members
{
  "email": "newmember@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "MEMBER",
  "sendWelcomeEmail": true
}
```

---

## Error Responses

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### Common Error Codes

| Code               | HTTP Status | Description                       |
| ------------------ | ----------- | --------------------------------- |
| `VALIDATION_ERROR` | 400         | Invalid input data                |
| `UNAUTHORIZED`     | 401         | Missing or invalid authentication |
| `FORBIDDEN`        | 403         | Insufficient permissions          |
| `NOT_FOUND`        | 404         | Resource not found                |
| `CONFLICT`         | 409         | Resource already exists           |
| `RATE_LIMITED`     | 429         | Too many requests                 |
| `INTERNAL_ERROR`   | 500         | Server error                      |

---

## Rate Limiting

| Endpoint                       | Limit                      |
| ------------------------------ | -------------------------- |
| `/auth/login`                  | 10 requests per 15 minutes |
| `/auth/password/reset-request` | 3 requests per hour        |
| `/auth/mfa/verify`             | 5 requests per 5 minutes   |
| `/messages` (POST)             | 10 requests per minute     |
| `/contact`                     | 10 requests per minute     |
| General API                    | 100 requests per minute    |

---

## Pagination

Paginated endpoints accept the following query parameters:

| Parameter | Type   | Default | Description              |
| --------- | ------ | ------- | ------------------------ |
| `page`    | number | 1       | Page number              |
| `limit`   | number | 10      | Items per page (max 100) |

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasMore": true
  }
}
```

---

## WebSocket Events

Real-time updates are available via WebSocket connection at `ws://localhost:3000`.

### Events

| Event              | Description                |
| ------------------ | -------------------------- |
| `announcement:new` | New announcement published |
| `message:new`      | New message received       |
| `event:updated`    | Event details changed      |
| `event:cancelled`  | Event cancelled            |

---

## Environment Variables

| Variable             | Description                  | Required |
| -------------------- | ---------------------------- | -------- |
| `DATABASE_URL`       | PostgreSQL connection string | Yes      |
| `JWT_SECRET`         | Secret for JWT signing       | Yes      |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens    | Yes      |
| `SMTP_HOST`          | Email server host            | Yes      |
| `SMTP_PORT`          | Email server port            | Yes      |
| `SMTP_USER`          | Email username               | Yes      |
| `SMTP_PASS`          | Email password               | Yes      |
| `FRONTEND_URL`       | Frontend URL for CORS        | Yes      |
