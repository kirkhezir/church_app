# Church Management Application - API Reference

## Overview

RESTful API for the Sing Buri Adventist Center Church Management Application.

**Base URL:** `/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Auth Endpoints

| Method | Endpoint                       | Description                | Auth Required |
| ------ | ------------------------------ | -------------------------- | ------------- |
| POST   | `/auth/login`                  | User login                 | No            |
| POST   | `/auth/register`               | Register new member        | No            |
| POST   | `/auth/refresh`                | Refresh access token       | No            |
| POST   | `/auth/logout`                 | Logout (invalidate tokens) | Yes           |
| POST   | `/auth/password-reset-request` | Request password reset     | No            |
| POST   | `/auth/password-reset`         | Reset password with token  | No            |

### MFA Endpoints

| Method | Endpoint            | Description         | Auth Required |
| ------ | ------------------- | ------------------- | ------------- |
| POST   | `/auth/mfa/enable`  | Enable MFA for user | Yes           |
| POST   | `/auth/mfa/verify`  | Verify MFA code     | Yes           |
| POST   | `/auth/mfa/disable` | Disable MFA         | Yes           |
| GET    | `/auth/mfa/status`  | Get MFA status      | Yes           |

## Members

| Method | Endpoint                    | Description                 | Auth Required |
| ------ | --------------------------- | --------------------------- | ------------- |
| GET    | `/members`                  | List all members            | Yes           |
| GET    | `/members/:id`              | Get member by ID            | Yes           |
| GET    | `/members/me`               | Get current user profile    | Yes           |
| PUT    | `/members/me`               | Update current user profile | Yes           |
| PUT    | `/members/me/password`      | Change password             | Yes           |
| PUT    | `/members/me/privacy`       | Update privacy settings     | Yes           |
| PUT    | `/members/me/notifications` | Update notification prefs   | Yes           |

### Admin Member Management

| Method | Endpoint            | Description        | Auth Required |
| ------ | ------------------- | ------------------ | ------------- |
| POST   | `/members`          | Create new member  | Admin         |
| PUT    | `/members/:id`      | Update member      | Admin         |
| DELETE | `/members/:id`      | Delete member      | Admin         |
| PUT    | `/members/:id/role` | Change member role | Admin         |

## Events

| Method | Endpoint            | Description       | Auth Required |
| ------ | ------------------- | ----------------- | ------------- |
| GET    | `/events`           | List all events   | No            |
| GET    | `/events/:id`       | Get event details | No            |
| POST   | `/events`           | Create event      | Admin/Staff   |
| PUT    | `/events/:id`       | Update event      | Admin/Staff   |
| DELETE | `/events/:id`       | Delete event      | Admin         |
| POST   | `/events/:id/rsvp`  | RSVP to event     | Yes           |
| DELETE | `/events/:id/rsvp`  | Cancel RSVP       | Yes           |
| GET    | `/events/:id/rsvps` | Get event RSVPs   | Admin/Staff   |

## Announcements

| Method | Endpoint                       | Description         | Auth Required |
| ------ | ------------------------------ | ------------------- | ------------- |
| GET    | `/announcements`               | List announcements  | Yes           |
| GET    | `/announcements/:id`           | Get announcement    | Yes           |
| POST   | `/announcements`               | Create announcement | Admin/Staff   |
| PUT    | `/announcements/:id`           | Update announcement | Admin/Staff   |
| DELETE | `/announcements/:id`           | Delete announcement | Admin         |
| POST   | `/announcements/:id/view`      | Mark as viewed      | Yes           |
| GET    | `/announcements/:id/analytics` | Get view analytics  | Admin         |

## Messages

| Method | Endpoint                 | Description      | Auth Required |
| ------ | ------------------------ | ---------------- | ------------- |
| GET    | `/messages`              | List messages    | Yes           |
| GET    | `/messages/:id`          | Get message      | Yes           |
| POST   | `/messages`              | Send message     | Yes           |
| DELETE | `/messages/:id`          | Delete message   | Yes           |
| PUT    | `/messages/:id/read`     | Mark as read     | Yes           |
| GET    | `/messages/unread/count` | Get unread count | Yes           |

## Reports (PDF Generation)

| Method | Endpoint                         | Description              | Auth Required |
| ------ | -------------------------------- | ------------------------ | ------------- |
| GET    | `/reports/members`               | Member directory PDF     | Admin         |
| GET    | `/reports/events`                | Events report PDF        | Admin         |
| GET    | `/reports/events/:id/attendance` | Event attendance PDF     | Admin         |
| GET    | `/reports/announcements`         | Announcements report PDF | Admin         |

### Query Parameters

- `startDate` (ISO date) - Filter start date
- `endDate` (ISO date) - Filter end date

## Push Notifications

| Method | Endpoint              | Description             | Auth Required |
| ------ | --------------------- | ----------------------- | ------------- |
| GET    | `/push/vapid-key`     | Get VAPID public key    | Yes           |
| POST   | `/push/subscribe`     | Subscribe to push       | Yes           |
| DELETE | `/push/subscribe`     | Unsubscribe (device)    | Yes           |
| DELETE | `/push/subscribe/all` | Unsubscribe all devices | Yes           |
| GET    | `/push/status`        | Get subscription status | Yes           |

## Health Check

| Method | Endpoint           | Description            | Auth Required |
| ------ | ------------------ | ---------------------- | ------------- |
| GET    | `/health`          | Basic health status    | No            |
| GET    | `/health/detailed` | Detailed health status | No            |
| GET    | `/health/ready`    | Kubernetes readiness   | No            |
| GET    | `/health/live`     | Kubernetes liveness    | No            |
| GET    | `/health/metrics`  | Prometheus metrics     | No            |

## Contact

| Method | Endpoint   | Description         | Auth Required |
| ------ | ---------- | ------------------- | ------------- |
| POST   | `/contact` | Submit contact form | No            |

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### Common Error Codes

| Code               | HTTP Status | Description              |
| ------------------ | ----------- | ------------------------ |
| `UNAUTHORIZED`     | 401         | Missing or invalid token |
| `FORBIDDEN`        | 403         | Insufficient permissions |
| `NOT_FOUND`        | 404         | Resource not found       |
| `VALIDATION_ERROR` | 400         | Invalid input data       |
| `INTERNAL_ERROR`   | 500         | Server error             |

## Rate Limiting

- Default: 100 requests per 15 minutes
- Auth endpoints: 5 requests per minute
- Contact form: 3 requests per hour

Rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

## WebSocket

WebSocket connection for real-time updates:

```
ws://localhost:3000/ws?token=<access_token>
```

Events:

- `notification` - New notification
- `message` - New message
- `event_update` - Event changes
- `announcement` - New announcement
