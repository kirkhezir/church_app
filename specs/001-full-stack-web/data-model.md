# Data Model: Church Management Application

**Feature**: 001-full-stack-web  
**Date**: October 15, 2025  
**Status**: Complete

## Overview

This document defines the core domain entities, their attributes, relationships, validation rules, and state transitions for the Church Management Application. The model follows Clean Architecture principles with entities in the domain layer, independent of infrastructure concerns.

---

## Entity Relationship Diagram

```
┌─────────────┐
│   Member    │
└─────┬───────┘
      │
      │ 1:N
      ├──────────────────┐
      │                  │
      ▼                  ▼
┌─────────────┐    ┌─────────────┐
│    Event    │    │ Announcement │
│   (RSVP)    │    │   (viewed)   │
└─────────────┘    └──────────────┘
      │                  │
      │ 1:N              │ 1:N
      ▼                  ▼
┌─────────────┐    ┌──────────────┐
│  EventRSVP  │    │ MemberViews  │
└─────────────┘    └──────────────┘

      Member
      │ 1:N
      ├──────────────────┐
      │ sender           │ recipient
      ▼                  ▼
┌─────────────────────────────┐
│         Message             │
└─────────────────────────────┘
```

---

## Core Entities

### 1. Member

**Description**: Represents a church member with authentication credentials, profile information, and privacy preferences.

**Attributes**:

| Field                 | Type     | Constraints                   | Description                          |
| --------------------- | -------- | ----------------------------- | ------------------------------------ |
| `id`                  | UUID     | PRIMARY KEY                   | Unique identifier                    |
| `email`               | String   | UNIQUE, NOT NULL, valid email | Authentication email                 |
| `passwordHash`        | String   | NOT NULL                      | bcrypt hashed password               |
| `firstName`           | String   | NOT NULL, 2-50 chars          | Member's first name                  |
| `lastName`            | String   | NOT NULL, 2-50 chars          | Member's last name                   |
| `phone`               | String   | OPTIONAL, E.164 format        | Contact phone number                 |
| `address`             | String   | OPTIONAL, max 200 chars       | Physical address                     |
| `role`                | Enum     | NOT NULL, default: MEMBER     | Role: ADMIN, STAFF, MEMBER           |
| `membershipDate`      | Date     | NOT NULL                      | Date joined church                   |
| `privacySettings`     | JSON     | NOT NULL                      | Field visibility preferences         |
| `emailNotifications`  | Boolean  | NOT NULL, default: true       | Opt-in for event/announcement emails |
| `accountLocked`       | Boolean  | NOT NULL, default: false      | Account lockout status               |
| `lockedUntil`         | DateTime | NULLABLE                      | Lockout expiration time              |
| `failedLoginAttempts` | Integer  | NOT NULL, default: 0          | Failed login counter                 |
| `lastLoginAt`         | DateTime | NULLABLE                      | Last successful login timestamp      |
| `createdAt`           | DateTime | NOT NULL, auto                | Record creation timestamp            |
| `updatedAt`           | DateTime | NOT NULL, auto                | Record update timestamp              |
| `deletedAt`           | DateTime | NULLABLE                      | Soft delete timestamp                |

**Privacy Settings Structure**:

```typescript
{
  "showPhone": boolean,      // Default: false
  "showEmail": boolean,      // Default: false
  "showAddress": boolean     // Default: false
}
```

**Validation Rules**:

- Email must be unique and valid format
- Password must be at least 8 characters with uppercase, lowercase, and number
- Phone must be valid E.164 format if provided (e.g., +66812345678)
- Role must be one of: ADMIN, STAFF, MEMBER
- Name fields cannot be empty strings

**Business Rules**:

- Name fields are always visible in member directory (per FR-029)
- Account locks automatically expire after 15 minutes (per FR-003a)
- Failed login attempts reset to 0 on successful login
- Security-related emails (password reset, account changes) always sent regardless of `emailNotifications` setting (per FR-017)

**State Transitions**:

1. **Active → Locked**: After 5 failed login attempts, set `accountLocked=true`, `lockedUntil=now+15min`
2. **Locked → Active**: After `lockedUntil` expires, set `accountLocked=false`, `failedLoginAttempts=0`
3. **Active → Deleted**: Soft delete by setting `deletedAt=now` (data retained for audit)

**Relationships**:

- **1:N with Event**: Member can RSVP to multiple events (via EventRSVP junction table)
- **1:N with Message**: Member can send/receive multiple messages
- **1:N with Announcement**: Member can view multiple announcements (tracking via MemberAnnouncementView)

---

### 2. Event

**Description**: Represents a church event (worship service, Bible study, community gathering) with RSVP tracking.

**Attributes**:

| Field           | Type     | Constraints              | Description                                 |
| --------------- | -------- | ------------------------ | ------------------------------------------- |
| `id`            | UUID     | PRIMARY KEY              | Unique identifier                           |
| `title`         | String   | NOT NULL, 3-100 chars    | Event name                                  |
| `description`   | Text     | NOT NULL, max 2000 chars | Event details (Markdown supported)          |
| `startDateTime` | DateTime | NOT NULL                 | Event start time                            |
| `endDateTime`   | DateTime | NOT NULL                 | Event end time                              |
| `location`      | String   | NOT NULL, max 200 chars  | Physical location                           |
| `category`      | Enum     | NOT NULL                 | WORSHIP, BIBLE_STUDY, COMMUNITY, FELLOWSHIP |
| `maxCapacity`   | Integer  | NULLABLE                 | Optional max attendees                      |
| `imageUrl`      | String   | NULLABLE, valid URL      | Event banner image                          |
| `createdById`   | UUID     | NOT NULL, FK → Member    | Creator (admin/staff)                       |
| `createdAt`     | DateTime | NOT NULL, auto           | Record creation timestamp                   |
| `updatedAt`     | DateTime | NOT NULL, auto           | Record update timestamp                     |
| `cancelledAt`   | DateTime | NULLABLE                 | Cancellation timestamp (soft cancel)        |
| `deletedAt`     | DateTime | NULLABLE                 | Soft delete timestamp                       |

**Validation Rules**:

- `endDateTime` must be after `startDateTime`
- `maxCapacity` must be positive integer if provided
- `category` must be one of: WORSHIP, BIBLE_STUDY, COMMUNITY, FELLOWSHIP
- `title` cannot be empty or whitespace-only
- `startDateTime` must be in the future when creating new event

**Business Rules**:

- When capacity is set and reached, new RSVPs are waitlisted (per FR-020a)
- Cancelled events still visible but marked as cancelled
- Modifying or cancelling event triggers notification to all RSVPed members (per FR-023)
- Only ADMIN and STAFF roles can create/modify events (per FR-018)

**State Transitions**:

1. **Draft → Published**: Event becomes visible to members
2. **Published → Full**: RSVP count reaches `maxCapacity` (if set)
3. **Published → Cancelled**: Admin cancels event, set `cancelledAt=now`
4. **Published → Past**: `endDateTime` passes, event moves to history

**Relationships**:

- **N:1 with Member**: Event created by a member (admin/staff)
- **1:N with EventRSVP**: Event has multiple RSVPs

---

### 3. EventRSVP

**Description**: Junction table tracking member RSVPs to events with status (confirmed, waitlisted).

**Attributes**:

| Field       | Type     | Constraints                  | Description                      |
| ----------- | -------- | ---------------------------- | -------------------------------- |
| `id`        | UUID     | PRIMARY KEY                  | Unique identifier                |
| `eventId`   | UUID     | NOT NULL, FK → Event         | Referenced event                 |
| `memberId`  | UUID     | NOT NULL, FK → Member        | RSVPing member                   |
| `status`    | Enum     | NOT NULL, default: CONFIRMED | CONFIRMED, WAITLISTED, CANCELLED |
| `rsvpedAt`  | DateTime | NOT NULL, auto               | RSVP timestamp                   |
| `updatedAt` | DateTime | NOT NULL, auto               | Status update timestamp          |

**Validation Rules**:

- Composite unique constraint on `(eventId, memberId)` - member can RSVP only once per event
- `status` must be one of: CONFIRMED, WAITLISTED, CANCELLED

**Business Rules**:

- If event at capacity, new RSVP gets `status=WAITLISTED` (per FR-020a)
- If event cancelled, all RSVPs automatically marked as `status=CANCELLED`
- Member can change RSVP from CONFIRMED to CANCELLED (withdraw attendance)

**State Transitions**:

1. **New RSVP**: If capacity available → `status=CONFIRMED`, else `status=WAITLISTED`
2. **Confirmed → Cancelled**: Member withdraws RSVP
3. **Waitlisted → Confirmed**: If someone cancels and space opens, promote first waitlisted RSVP

**Relationships**:

- **N:1 with Event**: RSVP belongs to one event
- **N:1 with Member**: RSVP belongs to one member

---

### 4. Announcement

**Description**: Represents a church-wide announcement posted by admins/staff, visible to all members.

**Attributes**:

| Field         | Type     | Constraints               | Description                            |
| ------------- | -------- | ------------------------- | -------------------------------------- |
| `id`          | UUID     | PRIMARY KEY               | Unique identifier                      |
| `title`       | String   | NOT NULL, 3-150 chars     | Announcement title                     |
| `content`     | Text     | NOT NULL, max 5000 chars  | Announcement body (Markdown supported) |
| `priority`    | Enum     | NOT NULL, default: NORMAL | URGENT, NORMAL                         |
| `authorId`    | UUID     | NOT NULL, FK → Member     | Author (admin/staff)                   |
| `publishedAt` | DateTime | NOT NULL, auto            | Publication timestamp                  |
| `archivedAt`  | DateTime | NULLABLE                  | Archive timestamp                      |
| `createdAt`   | DateTime | NOT NULL, auto            | Record creation timestamp              |
| `updatedAt`   | DateTime | NOT NULL, auto            | Record update timestamp                |
| `deletedAt`   | DateTime | NULLABLE                  | Soft delete timestamp                  |

**Validation Rules**:

- `title` cannot be empty or whitespace-only
- `content` cannot be empty
- `priority` must be one of: URGENT, NORMAL
- Only ADMIN and STAFF roles can create announcements

**Business Rules**:

- URGENT announcements trigger email notification to all members with `emailNotifications=true` (per FR-027)
- Archived announcements still accessible to all logged-in members (per FR-028a)
- Announcements displayed on dashboard ordered by `publishedAt` DESC (most recent first)
- Archive action sets `archivedAt=now`, removes from main dashboard but keeps in archive

**State Transitions**:

1. **Draft → Published**: Announcement becomes visible, set `publishedAt=now`
2. **Published → Archived**: Admin archives, set `archivedAt=now`
3. **Published → Deleted**: Soft delete, set `deletedAt=now` (for mistakes)

**Relationships**:

- **N:1 with Member**: Announcement authored by a member (admin/staff)
- **1:N with MemberAnnouncementView**: Track which members viewed announcement

---

### 5. Message

**Description**: Internal messaging between church members.

**Attributes**:

| Field                | Type     | Constraints              | Description            |
| -------------------- | -------- | ------------------------ | ---------------------- |
| `id`                 | UUID     | PRIMARY KEY              | Unique identifier      |
| `senderId`           | UUID     | NOT NULL, FK → Member    | Sender member          |
| `recipientId`        | UUID     | NOT NULL, FK → Member    | Recipient member       |
| `subject`            | String   | NOT NULL, 3-100 chars    | Message subject        |
| `body`               | Text     | NOT NULL, max 2000 chars | Message content        |
| `isRead`             | Boolean  | NOT NULL, default: false | Read status            |
| `readAt`             | DateTime | NULLABLE                 | Timestamp when read    |
| `sentAt`             | DateTime | NOT NULL, auto           | Send timestamp         |
| `deletedBySender`    | Boolean  | NOT NULL, default: false | Sender deleted flag    |
| `deletedByRecipient` | Boolean  | NOT NULL, default: false | Recipient deleted flag |

**Validation Rules**:

- `subject` and `body` cannot be empty or whitespace-only
- `senderId` and `recipientId` must be different (cannot message self)

**Business Rules**:

- Real-time push notification if recipient online (per FR-032a)
- Messages stored in-app, accessible when recipient offline (per FR-032b)
- Soft delete: message only truly deleted when both sender and recipient delete
- Unread messages highlighted in UI

**State Transitions**:

1. **Sent → Read**: Recipient opens message, set `isRead=true`, `readAt=now`
2. **Sent/Read → Deleted by Sender**: Set `deletedBySender=true`
3. **Sent/Read → Deleted by Recipient**: Set `deletedByRecipient=true`
4. **Deleted by Both → Hard Delete**: When `deletedBySender=true AND deletedByRecipient=true`, can be purged

**Relationships**:

- **N:1 with Member (sender)**: Message sent by one member
- **N:1 with Member (recipient)**: Message received by one member

---

### 6. MemberAnnouncementView (Optional Tracking)

**Description**: Tracks which members have viewed announcements (for analytics, optional feature).

**Attributes**:

| Field            | Type     | Constraints                 | Description         |
| ---------------- | -------- | --------------------------- | ------------------- |
| `id`             | UUID     | PRIMARY KEY                 | Unique identifier   |
| `memberId`       | UUID     | NOT NULL, FK → Member       | Member who viewed   |
| `announcementId` | UUID     | NOT NULL, FK → Announcement | Viewed announcement |
| `viewedAt`       | DateTime | NOT NULL, auto              | View timestamp      |

**Validation Rules**:

- Composite unique constraint on `(memberId, announcementId)` - member can be tracked once per announcement

**Business Rules**:

- Optional: Only track if admin wants view analytics
- Can be used to show unread announcement count

**Relationships**:

- **N:1 with Member**: View by one member
- **N:1 with Announcement**: View of one announcement

---

### 7. AuditLog

**Description**: Audit trail for administrative actions (per FR-034).

**Attributes**:

| Field        | Type     | Constraints           | Description                                   |
| ------------ | -------- | --------------------- | --------------------------------------------- |
| `id`         | UUID     | PRIMARY KEY           | Unique identifier                             |
| `userId`     | UUID     | NOT NULL, FK → Member | User who performed action                     |
| `action`     | String   | NOT NULL              | Action type (CREATE, UPDATE, DELETE)          |
| `entityType` | String   | NOT NULL              | Affected entity (MEMBER, EVENT, ANNOUNCEMENT) |
| `entityId`   | UUID     | NOT NULL              | Affected entity ID                            |
| `changes`    | JSON     | NULLABLE              | Changed fields (before/after values)          |
| `ipAddress`  | String   | NOT NULL              | User's IP address                             |
| `userAgent`  | String   | NOT NULL              | User's browser/client                         |
| `timestamp`  | DateTime | NOT NULL, auto        | Action timestamp                              |

**Validation Rules**:

- `action` must be one of: CREATE, UPDATE, DELETE
- `entityType` must be one of: MEMBER, EVENT, ANNOUNCEMENT, MESSAGE

**Business Rules**:

- Append-only table (no updates or deletes)
- Log all admin actions on sensitive entities
- Retention: at least 1 year
- Never log passwords or sensitive fields

**Relationships**:

- **N:1 with Member**: Audit log entry by one user

---

## Indexes

**Performance-critical indexes**:

1. **Member**:

   - `email` (UNIQUE) - authentication lookup
   - `role` - filtering by role
   - `membershipDate` - sorting/filtering

2. **Event**:

   - `(startDateTime, category)` - event filtering and calendar view
   - `createdById` - finding events by creator

3. **EventRSVP**:

   - `(eventId, memberId)` (UNIQUE) - RSVP lookup
   - `eventId` - counting RSVPs per event

4. **Announcement**:

   - `publishedAt DESC` - ordered listing
   - `(archivedAt, publishedAt)` - separating active from archived

5. **Message**:

   - `(recipientId, isRead)` - unread messages count
   - `(senderId, sentAt)` - sent messages by user

6. **AuditLog**:
   - `(userId, timestamp)` - audit trail by user
   - `(entityType, entityId)` - entity history

---

## Database Schema (Prisma)

```prisma
// This will be the basis for backend/prisma/schema.prisma

enum Role {
  ADMIN
  STAFF
  MEMBER
}

enum EventCategory {
  WORSHIP
  BIBLE_STUDY
  COMMUNITY
  FELLOWSHIP
}

enum RSVPStatus {
  CONFIRMED
  WAITLISTED
  CANCELLED
}

enum Priority {
  URGENT
  NORMAL
}

model Member {
  id                   String    @id @default(uuid())
  email                String    @unique
  passwordHash         String
  firstName            String
  lastName             String
  phone                String?
  address              String?
  role                 Role      @default(MEMBER)
  membershipDate       DateTime
  privacySettings      Json      // { showPhone, showEmail, showAddress }
  emailNotifications   Boolean   @default(true)
  accountLocked        Boolean   @default(false)
  lockedUntil          DateTime?
  failedLoginAttempts  Int       @default(0)
  lastLoginAt          DateTime?
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt
  deletedAt            DateTime?

  // Relationships
  createdEvents        Event[]           @relation("EventCreator")
  rsvps                EventRSVP[]
  sentMessages         Message[]         @relation("MessageSender")
  receivedMessages     Message[]         @relation("MessageRecipient")
  announcements        Announcement[]    @relation("AnnouncementAuthor")
  announcementViews    MemberAnnouncementView[]
  auditLogs            AuditLog[]

  @@index([email])
  @@index([role])
  @@index([membershipDate])
}

model Event {
  id              String        @id @default(uuid())
  title           String
  description     String        @db.Text
  startDateTime   DateTime
  endDateTime     DateTime
  location        String
  category        EventCategory
  maxCapacity     Int?
  imageUrl        String?
  createdById     String
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  cancelledAt     DateTime?
  deletedAt       DateTime?

  // Relationships
  creator         Member        @relation("EventCreator", fields: [createdById], references: [id])
  rsvps           EventRSVP[]

  @@index([startDateTime, category])
  @@index([createdById])
}

model EventRSVP {
  id        String      @id @default(uuid())
  eventId   String
  memberId  String
  status    RSVPStatus  @default(CONFIRMED)
  rsvpedAt  DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  // Relationships
  event     Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  member    Member      @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@unique([eventId, memberId])
  @@index([eventId])
}

model Announcement {
  id          String    @id @default(uuid())
  title       String
  content     String    @db.Text
  priority    Priority  @default(NORMAL)
  authorId    String
  publishedAt DateTime  @default(now())
  archivedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  // Relationships
  author      Member    @relation("AnnouncementAuthor", fields: [authorId], references: [id])
  views       MemberAnnouncementView[]

  @@index([publishedAt(sort: Desc)])
  @@index([archivedAt, publishedAt])
}

model Message {
  id                  String    @id @default(uuid())
  senderId            String
  recipientId         String
  subject             String
  body                String    @db.Text
  isRead              Boolean   @default(false)
  readAt              DateTime?
  sentAt              DateTime  @default(now())
  deletedBySender     Boolean   @default(false)
  deletedByRecipient  Boolean   @default(false)

  // Relationships
  sender              Member    @relation("MessageSender", fields: [senderId], references: [id])
  recipient           Member    @relation("MessageRecipient", fields: [recipientId], references: [id])

  @@index([recipientId, isRead])
  @@index([senderId, sentAt])
}

model MemberAnnouncementView {
  id              String       @id @default(uuid())
  memberId        String
  announcementId  String
  viewedAt        DateTime     @default(now())

  // Relationships
  member          Member       @relation(fields: [memberId], references: [id])
  announcement    Announcement @relation(fields: [announcementId], references: [id])

  @@unique([memberId, announcementId])
}

model AuditLog {
  id          String    @id @default(uuid())
  userId      String
  action      String    // CREATE, UPDATE, DELETE
  entityType  String    // MEMBER, EVENT, ANNOUNCEMENT
  entityId    String
  changes     Json?     // { before: {}, after: {} }
  ipAddress   String
  userAgent   String
  timestamp   DateTime  @default(now())

  // Relationships
  user        Member    @relation(fields: [userId], references: [id])

  @@index([userId, timestamp])
  @@index([entityType, entityId])
}
```

---

## Summary

**Entity Count**: 7 core entities (Member, Event, EventRSVP, Announcement, Message, MemberAnnouncementView, AuditLog)

**Key Design Decisions**:

1. **Soft Deletes**: All primary entities use `deletedAt` for audit trail
2. **Audit Logging**: Separate table for compliance with FR-034
3. **Privacy Controls**: JSON field in Member for flexible field-level privacy (per FR-030)
4. **RSVP Status**: Enum handles confirmed, waitlisted, cancelled states (per FR-020a)
5. **Announcement Archiving**: Timestamp-based, keeps data accessible (per FR-028a)
6. **Message Soft Delete**: Dual-flag system allows independent deletion by sender/recipient

**Constitutional Alignment**:

- ✅ Clean Architecture: Domain entities independent of database (Prisma schema in infrastructure layer)
- ✅ DRY: Single schema is source of truth for DB structure and TypeScript types
- ✅ KISS: Straightforward relational model, no over-normalized complexity

**Status**: ✅ Data model complete. Ready for API contract definition.
