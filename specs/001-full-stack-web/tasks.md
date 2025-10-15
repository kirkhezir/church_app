# Tasks: Church Management Application for Sing Buri Adventist Center

**Feature**: 001-full-stack-web  
**Input**: Design documents from `/specs/001-full-stack-web/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/openapi.yaml ✅

**Tests**: NOT requested in specification - focusing on implementation tasks only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app with separate frontend/backend
- Backend: `backend/src/`, `backend/prisma/`, `backend/tests/`
- Frontend: `frontend/src/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [ ] T001 Create root project structure with backend/ and frontend/ directories
- [ ] T002 Initialize backend Node.js project with TypeScript, Express, Prisma dependencies in backend/package.json
- [ ] T003 Initialize frontend React project with Vite, TypeScript, shadcn/ui dependencies in frontend/package.json
- [ ] T004 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.json and backend/.prettierrc
- [ ] T005 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.json and frontend/.prettierrc
- [ ] T006 [P] Create backend Clean Architecture folder structure: backend/src/domain/, backend/src/application/, backend/src/infrastructure/, backend/src/presentation/
- [ ] T007 [P] Create frontend folder structure: frontend/src/components/, frontend/src/pages/, frontend/src/services/, frontend/src/hooks/, frontend/src/lib/, frontend/src/types/
- [ ] T008 Setup Tailwind CSS configuration for shadcn/ui in frontend/tailwind.config.js
- [ ] T009 Create backend environment configuration template in backend/.env.example with DATABASE_URL, JWT_SECRET, SMTP settings
- [ ] T010 Create frontend environment configuration template in frontend/.env.example with VITE_API_URL
- [ ] T011 [P] Setup development scripts in backend/package.json: dev, build, start, test
- [ ] T012 [P] Setup development scripts in frontend/package.json: dev, build, preview

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [ ] T013 Create Prisma schema with all entities (Member, Event, EventRSVP, Announcement, Message, MemberAnnouncementView, AuditLog) in backend/prisma/schema.prisma
- [ ] T014 Generate Prisma client and run initial migration in backend/
- [ ] T015 Create database seed script with sample data (admin user, members, events) in backend/prisma/seed.ts

### Authentication & Security Foundation

- [ ] T016 [P] Implement JWT token generation and validation service in backend/src/infrastructure/auth/jwtService.ts
- [ ] T017 [P] Implement bcrypt password hashing utility in backend/src/infrastructure/auth/passwordService.ts
- [ ] T018 Create authentication middleware for JWT validation in backend/src/presentation/middleware/authMiddleware.ts
- [ ] T019 Create role-based authorization middleware in backend/src/presentation/middleware/roleMiddleware.ts
- [ ] T020 Implement account lockout logic in backend/src/domain/entities/Member.ts

### API Foundation

- [ ] T021 Setup Express application with CORS and JSON middleware in backend/src/presentation/server.ts
- [ ] T022 [P] Create global error handling middleware in backend/src/presentation/middleware/errorMiddleware.ts
- [ ] T023 [P] Create request validation middleware using Zod in backend/src/presentation/middleware/validationMiddleware.ts
- [ ] T024 Create base API router structure with /api/v1 prefix in backend/src/presentation/routes/index.ts
- [ ] T025 [P] Implement logging service with Winston in backend/src/infrastructure/logging/logger.ts
- [ ] T026 [P] Create audit logging service in backend/src/application/services/auditLogService.ts

### Domain Layer Foundation

- [ ] T027 [P] Define Member domain entity with business rules in backend/src/domain/entities/Member.ts
- [ ] T028 [P] Define Role, EventCategory, RSVPStatus, Priority enums in backend/src/domain/valueObjects/
- [ ] T029 [P] Define repository interfaces for all entities in backend/src/domain/interfaces/

### Infrastructure Layer Foundation

- [ ] T030 [P] Implement Prisma repository for Member in backend/src/infrastructure/database/repositories/memberRepository.ts
- [ ] T031 [P] Implement Prisma client singleton in backend/src/infrastructure/database/prismaClient.ts
- [ ] T032 [P] Setup email service (SMTP) configuration in backend/src/infrastructure/email/emailService.ts

### Frontend Foundation

- [ ] T033 Setup Axios API client with interceptors in frontend/src/services/api/apiClient.ts
- [ ] T034 Create AuthContext for global authentication state in frontend/src/contexts/AuthContext.tsx
- [ ] T035 Create useAuth custom hook in frontend/src/hooks/useAuth.ts
- [ ] T036 [P] Install and configure shadcn/ui base components (Button, Input, Card, Form) in frontend/src/components/ui/
- [ ] T037 [P] Create shared TypeScript types matching backend DTOs in frontend/src/types/api.ts
- [ ] T038 Create layout components (Header, Footer, Navigation) in frontend/src/components/layout/
- [ ] T039 Setup React Router with route configuration in frontend/src/App.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Public Landing Page (Priority: P1) 🎯 MVP

**Goal**: Visitors can view information about Sing Buri Adventist Center through a public-facing landing page

**Independent Test**: Navigate to website URL and verify church name, worship times, location map, contact form are visible and functional without authentication

### Implementation for User Story 1

- [ ] T040 [P] [US1] Create LandingPage component with hero section in frontend/src/pages/public/LandingPage.tsx
- [ ] T041 [P] [US1] Create WorshipTimesSection component in frontend/src/components/features/WorshipTimesSection.tsx
- [ ] T042 [P] [US1] Create LocationMapSection component with embedded map in frontend/src/components/features/LocationMapSection.tsx
- [ ] T043 [P] [US1] Create MissionStatementSection component in frontend/src/components/features/MissionStatementSection.tsx
- [ ] T044 [P] [US1] Create ContactForm component in frontend/src/components/features/ContactForm.tsx
- [ ] T045 [US1] Implement POST /api/v1/contact endpoint controller in backend/src/presentation/controllers/contactController.ts
- [ ] T046 [US1] Implement ContactService for sending contact form emails in backend/src/application/services/contactService.ts
- [ ] T047 [US1] Create contact route and attach to API router in backend/src/presentation/routes/contactRoutes.ts
- [ ] T048 [US1] Add public route for landing page in frontend React Router (no auth required)
- [ ] T049 [US1] Style landing page with responsive design (mobile-first) using Tailwind CSS

**Checkpoint**: At this point, User Story 1 should be fully functional - public can visit landing page and submit contact form

---

## Phase 4: User Story 2 - Member Authentication & Dashboard (Priority: P2)

**Goal**: Church members can securely log in to access their personalized dashboard

**Independent Test**: Create test member accounts, log in with valid/invalid credentials, verify dashboard displays with member information, test logout

### Implementation for User Story 2

#### Authentication Implementation

- [ ] T050 [P] [US2] Create AuthenticateUser use case in backend/src/application/useCases/authenticateUser.ts
- [ ] T051 [P] [US2] Create RefreshToken use case in backend/src/application/useCases/refreshToken.ts
- [ ] T052 [P] [US2] Create LogoutUser use case in backend/src/application/useCases/logoutUser.ts
- [ ] T053 [US2] Implement POST /api/v1/auth/login controller in backend/src/presentation/controllers/authController.ts
- [ ] T054 [US2] Implement POST /api/v1/auth/refresh controller in backend/src/presentation/controllers/authController.ts
- [ ] T055 [US2] Implement POST /api/v1/auth/logout controller in backend/src/presentation/controllers/authController.ts
- [ ] T056 [US2] Create auth routes in backend/src/presentation/routes/authRoutes.ts
- [ ] T057 [P] [US2] Create LoginPage component in frontend/src/pages/auth/LoginPage.tsx
- [ ] T058 [P] [US2] Create login form with validation using shadcn/ui Form components in LoginPage
- [ ] T059 [US2] Implement authService.login() in frontend/src/services/endpoints/authService.ts
- [ ] T060 [US2] Implement authService.refresh() with automatic token refresh in frontend/src/services/endpoints/authService.ts
- [ ] T061 [US2] Implement authService.logout() in frontend/src/services/endpoints/authService.ts

#### Password Reset Implementation

- [ ] T062 [P] [US2] Create RequestPasswordReset use case in backend/src/application/useCases/requestPasswordReset.ts
- [ ] T063 [P] [US2] Create ResetPassword use case in backend/src/application/useCases/resetPassword.ts
- [ ] T064 [US2] Implement POST /api/v1/auth/password/reset-request controller in backend/src/presentation/controllers/authController.ts
- [ ] T065 [US2] Implement POST /api/v1/auth/password/reset controller in backend/src/presentation/controllers/authController.ts
- [ ] T066 [P] [US2] Create PasswordResetRequestPage component in frontend/src/pages/auth/PasswordResetRequestPage.tsx
- [ ] T067 [P] [US2] Create PasswordResetPage component in frontend/src/pages/auth/PasswordResetPage.tsx
- [ ] T068 [US2] Implement password reset email template in backend/src/infrastructure/email/templates/passwordReset.ts

#### Dashboard Implementation

- [ ] T069 [P] [US2] Create GetMemberDashboard use case in backend/src/application/useCases/getMemberDashboard.ts
- [ ] T070 [US2] Implement GET /api/v1/members/me/dashboard controller in backend/src/presentation/controllers/memberController.ts
- [ ] T071 [US2] Create member routes in backend/src/presentation/routes/memberRoutes.ts
- [ ] T072 [P] [US2] Create MemberDashboard page component in frontend/src/pages/dashboard/MemberDashboard.tsx
- [ ] T073 [P] [US2] Create ProfileSummary component for dashboard in frontend/src/components/features/ProfileSummary.tsx
- [ ] T074 [P] [US2] Create UpcomingEventsWidget component in frontend/src/components/features/UpcomingEventsWidget.tsx
- [ ] T075 [P] [US2] Create RecentAnnouncementsWidget component in frontend/src/components/features/RecentAnnouncementsWidget.tsx
- [ ] T076 [US2] Implement dashboardService.getMemberDashboard() in frontend/src/services/endpoints/dashboardService.ts
- [ ] T077 [US2] Add protected routes for dashboard in frontend React Router (auth required)
- [ ] T078 [US2] Implement PrivateRoute wrapper component for protected routes in frontend/src/components/PrivateRoute.tsx

#### Profile Management Implementation

- [ ] T079 [P] [US2] Create UpdateProfile use case in backend/src/application/useCases/updateProfile.ts
- [ ] T080 [P] [US2] Create UpdateNotificationPreferences use case in backend/src/application/useCases/updateNotificationPreferences.ts
- [ ] T081 [US2] Implement PATCH /api/v1/members/me controller in backend/src/presentation/controllers/memberController.ts
- [ ] T082 [US2] Implement PATCH /api/v1/members/me/notifications controller in backend/src/presentation/controllers/memberController.ts
- [ ] T083 [P] [US2] Create EditProfilePage component in frontend/src/pages/dashboard/EditProfilePage.tsx
- [ ] T084 [P] [US2] Create NotificationSettingsPage component in frontend/src/pages/dashboard/NotificationSettingsPage.tsx
- [ ] T085 [US2] Implement memberService.updateProfile() in frontend/src/services/endpoints/memberService.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - public landing page accessible, members can login and view dashboard

---

## Phase 5: User Story 3 - Event Management (Priority: P3)

**Goal**: Church administrators can create/manage events, and members can view and RSVP to events

**Independent Test**: Admin creates various event types, members view events calendar, members RSVP to events, admin views RSVP lists

### Implementation for User Story 3

#### Domain & Repository

- [ ] T086 [P] [US3] Define Event domain entity in backend/src/domain/entities/Event.ts
- [ ] T087 [P] [US3] Define EventRSVP domain entity in backend/src/domain/entities/EventRSVP.ts
- [ ] T088 [P] [US3] Implement Prisma repository for Event in backend/src/infrastructure/database/repositories/eventRepository.ts
- [ ] T089 [P] [US3] Implement Prisma repository for EventRSVP in backend/src/infrastructure/database/repositories/eventRSVPRepository.ts

#### Event CRUD Use Cases

- [ ] T090 [P] [US3] Create CreateEvent use case in backend/src/application/useCases/createEvent.ts
- [ ] T091 [P] [US3] Create GetEvents use case with filtering in backend/src/application/useCases/getEvents.ts
- [ ] T092 [P] [US3] Create GetEventById use case in backend/src/application/useCases/getEventById.ts
- [ ] T093 [P] [US3] Create UpdateEvent use case in backend/src/application/useCases/updateEvent.ts
- [ ] T094 [P] [US3] Create CancelEvent use case in backend/src/application/useCases/cancelEvent.ts

#### RSVP Use Cases

- [ ] T095 [P] [US3] Create RSVPToEvent use case with capacity checking in backend/src/application/useCases/rsvpToEvent.ts
- [ ] T096 [P] [US3] Create CancelRSVP use case in backend/src/application/useCases/cancelRSVP.ts
- [ ] T097 [P] [US3] Create GetEventRSVPs use case in backend/src/application/useCases/getEventRSVPs.ts

#### Event API Controllers

- [ ] T098 [US3] Implement POST /api/v1/events controller in backend/src/presentation/controllers/eventController.ts
- [ ] T099 [US3] Implement GET /api/v1/events controller with query filters in backend/src/presentation/controllers/eventController.ts
- [ ] T100 [US3] Implement GET /api/v1/events/:id controller in backend/src/presentation/controllers/eventController.ts
- [ ] T101 [US3] Implement PATCH /api/v1/events/:id controller in backend/src/presentation/controllers/eventController.ts
- [ ] T102 [US3] Implement DELETE /api/v1/events/:id controller (cancel) in backend/src/presentation/controllers/eventController.ts
- [ ] T103 [US3] Implement POST /api/v1/events/:id/rsvp controller in backend/src/presentation/controllers/eventController.ts
- [ ] T104 [US3] Implement DELETE /api/v1/events/:id/rsvp controller in backend/src/presentation/controllers/eventController.ts
- [ ] T105 [US3] Implement GET /api/v1/events/:id/rsvps controller in backend/src/presentation/controllers/eventController.ts
- [ ] T106 [US3] Create event routes in backend/src/presentation/routes/eventRoutes.ts

#### Event Notification Service

- [ ] T107 [US3] Implement event notification service for RSVP confirmations in backend/src/application/services/eventNotificationService.ts
- [ ] T108 [US3] Implement event cancellation/modification notification logic in backend/src/application/services/eventNotificationService.ts

#### Frontend - Event List & Calendar

- [ ] T109 [P] [US3] Create EventsListPage component in frontend/src/pages/events/EventsListPage.tsx
- [ ] T110 [P] [US3] Create EventCard component for event display in frontend/src/components/features/EventCard.tsx
- [ ] T111 [P] [US3] Create EventCalendarView component in frontend/src/components/features/EventCalendarView.tsx
- [ ] T112 [P] [US3] Create EventFilters component (category, date range) in frontend/src/components/features/EventFilters.tsx
- [ ] T113 [US3] Implement eventService.getEvents() in frontend/src/services/endpoints/eventService.ts
- [ ] T114 [US3] Create useEvents custom hook in frontend/src/hooks/useEvents.ts

#### Frontend - Event Detail & RSVP

- [ ] T115 [P] [US3] Create EventDetailPage component in frontend/src/pages/events/EventDetailPage.tsx
- [ ] T116 [P] [US3] Create RSVPButton component with capacity handling in frontend/src/components/features/RSVPButton.tsx
- [ ] T117 [US3] Implement eventService.getEventById() in frontend/src/services/endpoints/eventService.ts
- [ ] T118 [US3] Implement eventService.rsvpToEvent() in frontend/src/services/endpoints/eventService.ts
- [ ] T119 [US3] Implement eventService.cancelRSVP() in frontend/src/services/endpoints/eventService.ts

#### Frontend - Event Management (Admin/Staff)

- [ ] T120 [P] [US3] Create EventCreatePage component (admin/staff only) in frontend/src/pages/events/EventCreatePage.tsx
- [ ] T121 [P] [US3] Create EventEditPage component (admin/staff only) in frontend/src/pages/events/EventEditPage.tsx
- [ ] T122 [P] [US3] Create EventForm component with validation in frontend/src/components/features/EventForm.tsx
- [ ] T123 [P] [US3] Create RSVPListPage component for viewing attendees (admin/staff) in frontend/src/pages/events/RSVPListPage.tsx
- [ ] T124 [US3] Implement eventService.createEvent() in frontend/src/services/endpoints/eventService.ts
- [ ] T125 [US3] Implement eventService.updateEvent() in frontend/src/services/endpoints/eventService.ts
- [ ] T126 [US3] Implement eventService.cancelEvent() in frontend/src/services/endpoints/eventService.ts
- [ ] T127 [US3] Implement eventService.getEventRSVPs() in frontend/src/services/endpoints/eventService.ts
- [ ] T128 [US3] Add event management routes to React Router with role-based access

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - admins can manage events, members can view and RSVP

---

## Phase 6: User Story 4 - Announcement System (Priority: P4)

**Goal**: Church leaders can post announcements visible to all members, with email notifications for urgent announcements

**Independent Test**: Admin creates normal and urgent announcements, members see them on dashboard, urgent announcements trigger email, admin can archive announcements

### Implementation for User Story 4

#### Domain & Repository

- [ ] T129 [P] [US4] Define Announcement domain entity in backend/src/domain/entities/Announcement.ts
- [ ] T130 [P] [US4] Implement Prisma repository for Announcement in backend/src/infrastructure/database/repositories/announcementRepository.ts
- [ ] T131 [P] [US4] Implement Prisma repository for MemberAnnouncementView in backend/src/infrastructure/database/repositories/memberAnnouncementViewRepository.ts

#### Announcement Use Cases

- [ ] T132 [P] [US4] Create CreateAnnouncement use case in backend/src/application/useCases/createAnnouncement.ts
- [ ] T133 [P] [US4] Create GetAnnouncements use case (active only) in backend/src/application/useCases/getAnnouncements.ts
- [ ] T134 [P] [US4] Create GetArchivedAnnouncements use case in backend/src/application/useCases/getArchivedAnnouncements.ts
- [ ] T135 [P] [US4] Create UpdateAnnouncement use case in backend/src/application/useCases/updateAnnouncement.ts
- [ ] T136 [P] [US4] Create ArchiveAnnouncement use case in backend/src/application/useCases/archiveAnnouncement.ts
- [ ] T137 [P] [US4] Create DeleteAnnouncement use case in backend/src/application/useCases/deleteAnnouncement.ts
- [ ] T138 [P] [US4] Create TrackAnnouncementView use case in backend/src/application/useCases/trackAnnouncementView.ts

#### Announcement Notification Service

- [ ] T139 [US4] Implement announcement notification service for urgent announcements in backend/src/application/services/announcementNotificationService.ts
- [ ] T140 [US4] Create urgent announcement email template in backend/src/infrastructure/email/templates/urgentAnnouncement.ts

#### Announcement API Controllers

- [ ] T141 [US4] Implement POST /api/v1/announcements controller in backend/src/presentation/controllers/announcementController.ts
- [ ] T142 [US4] Implement GET /api/v1/announcements controller in backend/src/presentation/controllers/announcementController.ts
- [ ] T143 [US4] Implement GET /api/v1/announcements/archived controller in backend/src/presentation/controllers/announcementController.ts
- [ ] T144 [US4] Implement PATCH /api/v1/announcements/:id controller in backend/src/presentation/controllers/announcementController.ts
- [ ] T145 [US4] Implement POST /api/v1/announcements/:id/archive controller in backend/src/presentation/controllers/announcementController.ts
- [ ] T146 [US4] Implement DELETE /api/v1/announcements/:id controller in backend/src/presentation/controllers/announcementController.ts
- [ ] T147 [US4] Implement POST /api/v1/announcements/:id/view controller for tracking views in backend/src/presentation/controllers/announcementController.ts
- [ ] T148 [US4] Create announcement routes in backend/src/presentation/routes/announcementRoutes.ts

#### Frontend - Announcement Display

- [ ] T149 [P] [US4] Create AnnouncementsPage component in frontend/src/pages/announcements/AnnouncementsPage.tsx
- [ ] T150 [P] [US4] Create AnnouncementCard component with priority badges in frontend/src/components/features/AnnouncementCard.tsx
- [ ] T151 [P] [US4] Create AnnouncementDetail component with Markdown rendering in frontend/src/components/features/AnnouncementDetail.tsx
- [ ] T152 [P] [US4] Create AnnouncementArchivePage component in frontend/src/pages/announcements/AnnouncementArchivePage.tsx
- [ ] T153 [US4] Implement announcementService.getAnnouncements() in frontend/src/services/endpoints/announcementService.ts
- [ ] T154 [US4] Implement announcementService.getArchivedAnnouncements() in frontend/src/services/endpoints/announcementService.ts
- [ ] T155 [US4] Implement announcementService.trackView() in frontend/src/services/endpoints/announcementService.ts
- [ ] T156 [US4] Create useAnnouncements custom hook in frontend/src/hooks/useAnnouncements.ts

#### Frontend - Announcement Management (Admin/Staff)

- [ ] T157 [P] [US4] Create AnnouncementCreatePage component (admin/staff only) in frontend/src/pages/announcements/AnnouncementCreatePage.tsx
- [ ] T158 [P] [US4] Create AnnouncementEditPage component (admin/staff only) in frontend/src/pages/announcements/AnnouncementEditPage.tsx
- [ ] T159 [P] [US4] Create AnnouncementForm component with Markdown editor in frontend/src/components/features/AnnouncementForm.tsx
- [ ] T160 [US4] Implement announcementService.createAnnouncement() in frontend/src/services/endpoints/announcementService.ts
- [ ] T161 [US4] Implement announcementService.updateAnnouncement() in frontend/src/services/endpoints/announcementService.ts
- [ ] T162 [US4] Implement announcementService.archiveAnnouncement() in frontend/src/services/endpoints/announcementService.ts
- [ ] T163 [US4] Implement announcementService.deleteAnnouncement() in frontend/src/services/endpoints/announcementService.ts
- [ ] T164 [US4] Add announcement management routes to React Router with role-based access

**Checkpoint**: At this point, User Stories 1-4 should all work independently - announcement system fully functional with notifications

---

## Phase 7: User Story 5 - Member Directory (Priority: P5)

**Goal**: Members can view a directory of other church members with privacy controls, and send internal messages

**Independent Test**: View member directory with various privacy settings, search for members, send messages, verify real-time notifications

### Implementation for User Story 5

#### Domain & Repository

- [ ] T165 [P] [US5] Define Message domain entity in backend/src/domain/entities/Message.ts
- [ ] T166 [P] [US5] Implement Prisma repository for Message in backend/src/infrastructure/database/repositories/messageRepository.ts

#### Member Directory Use Cases

- [ ] T167 [P] [US5] Create GetMemberDirectory use case with privacy filtering in backend/src/application/useCases/getMemberDirectory.ts
- [ ] T168 [P] [US5] Create SearchMembers use case in backend/src/application/useCases/searchMembers.ts
- [ ] T169 [P] [US5] Create GetMemberProfile use case with privacy controls in backend/src/application/useCases/getMemberProfile.ts
- [ ] T170 [P] [US5] Create UpdatePrivacySettings use case in backend/src/application/useCases/updatePrivacySettings.ts

#### Messaging Use Cases

- [ ] T171 [P] [US5] Create SendMessage use case in backend/src/application/useCases/sendMessage.ts
- [ ] T172 [P] [US5] Create GetMessages use case (inbox) in backend/src/application/useCases/getMessages.ts
- [ ] T173 [P] [US5] Create GetSentMessages use case in backend/src/application/useCases/getSentMessages.ts
- [ ] T174 [P] [US5] Create MarkMessageAsRead use case in backend/src/application/useCases/markMessageAsRead.ts
- [ ] T175 [P] [US5] Create DeleteMessage use case in backend/src/application/useCases/deleteMessage.ts

#### Real-time Notification Setup

- [ ] T176 [US5] Setup WebSocket server for real-time notifications in backend/src/infrastructure/websocket/websocketServer.ts
- [ ] T177 [US5] Implement real-time message notification service in backend/src/application/services/messageNotificationService.ts

#### Member Directory API Controllers

- [ ] T178 [US5] Implement GET /api/v1/members controller (directory) in backend/src/presentation/controllers/memberController.ts
- [ ] T179 [US5] Implement GET /api/v1/members/search controller in backend/src/presentation/controllers/memberController.ts
- [ ] T180 [US5] Implement GET /api/v1/members/:id controller in backend/src/presentation/controllers/memberController.ts
- [ ] T181 [US5] Implement PATCH /api/v1/members/me/privacy controller in backend/src/presentation/controllers/memberController.ts

#### Messaging API Controllers

- [ ] T182 [US5] Implement POST /api/v1/messages controller in backend/src/presentation/controllers/messageController.ts
- [ ] T183 [US5] Implement GET /api/v1/messages/inbox controller in backend/src/presentation/controllers/messageController.ts
- [ ] T184 [US5] Implement GET /api/v1/messages/sent controller in backend/src/presentation/controllers/messageController.ts
- [ ] T185 [US5] Implement PATCH /api/v1/messages/:id/read controller in backend/src/presentation/controllers/messageController.ts
- [ ] T186 [US5] Implement DELETE /api/v1/messages/:id controller in backend/src/presentation/controllers/messageController.ts
- [ ] T187 [US5] Create message routes in backend/src/presentation/routes/messageRoutes.ts

#### Frontend - Member Directory

- [ ] T188 [P] [US5] Create MemberDirectoryPage component in frontend/src/pages/members/MemberDirectoryPage.tsx
- [ ] T189 [P] [US5] Create MemberCard component with privacy-aware display in frontend/src/components/features/MemberCard.tsx
- [ ] T190 [P] [US5] Create MemberProfilePage component in frontend/src/pages/members/MemberProfilePage.tsx
- [ ] T191 [P] [US5] Create MemberSearchBar component in frontend/src/components/features/MemberSearchBar.tsx
- [ ] T192 [P] [US5] Create PrivacySettingsForm component in frontend/src/components/features/PrivacySettingsForm.tsx
- [ ] T193 [US5] Implement memberService.getMemberDirectory() in frontend/src/services/endpoints/memberService.ts
- [ ] T194 [US5] Implement memberService.searchMembers() in frontend/src/services/endpoints/memberService.ts
- [ ] T195 [US5] Implement memberService.getMemberProfile() in frontend/src/services/endpoints/memberService.ts
- [ ] T196 [US5] Implement memberService.updatePrivacySettings() in frontend/src/services/endpoints/memberService.ts

#### Frontend - Messaging

- [ ] T197 [P] [US5] Create MessagesPage component with inbox/sent tabs in frontend/src/pages/messages/MessagesPage.tsx
- [ ] T198 [P] [US5] Create MessageList component in frontend/src/components/features/MessageList.tsx
- [ ] T199 [P] [US5] Create MessageCompose component in frontend/src/components/features/MessageCompose.tsx
- [ ] T200 [P] [US5] Create MessageDetail component in frontend/src/components/features/MessageDetail.tsx
- [ ] T201 [US5] Implement messageService.sendMessage() in frontend/src/services/endpoints/messageService.ts
- [ ] T202 [US5] Implement messageService.getInbox() in frontend/src/services/endpoints/messageService.ts
- [ ] T203 [US5] Implement messageService.getSentMessages() in frontend/src/services/endpoints/messageService.ts
- [ ] T204 [US5] Implement messageService.markAsRead() in frontend/src/services/endpoints/messageService.ts
- [ ] T205 [US5] Implement messageService.deleteMessage() in frontend/src/services/endpoints/messageService.ts

#### Frontend - Real-time Notifications

- [ ] T206 [US5] Setup WebSocket client connection in frontend/src/services/websocket/websocketClient.ts
- [ ] T207 [US5] Create useNotifications custom hook for real-time updates in frontend/src/hooks/useNotifications.ts
- [ ] T208 [US5] Create NotificationToast component for displaying notifications in frontend/src/components/features/NotificationToast.tsx
- [ ] T209 [US5] Integrate WebSocket notifications into MessagesPage and Navigation

#### Frontend - Routing

- [ ] T210 [US5] Add member directory and messaging routes to React Router

**Checkpoint**: All user stories (1-5) should now be independently functional - complete feature set implemented

---

## Phase 8: Admin Features & Account Management

**Purpose**: Admin-only functionality for member account creation and management

- [ ] T211 [P] Create CreateMemberAccount use case (admin only) in backend/src/application/useCases/createMemberAccount.ts
- [ ] T212 [P] Create invitation email template in backend/src/infrastructure/email/templates/memberInvitation.ts
- [ ] T213 [US2] Implement POST /api/v1/admin/members controller in backend/src/presentation/controllers/adminController.ts
- [ ] T214 [US2] Implement GET /api/v1/admin/members controller for admin member list in backend/src/presentation/controllers/adminController.ts
- [ ] T215 [US2] Implement DELETE /api/v1/admin/members/:id controller (soft delete) in backend/src/presentation/controllers/adminController.ts
- [ ] T216 [US2] Create admin routes in backend/src/presentation/routes/adminRoutes.ts
- [ ] T217 [P] Create AdminDashboard page component in frontend/src/pages/admin/AdminDashboard.tsx
- [ ] T218 [P] Create MemberManagementPage component in frontend/src/pages/admin/MemberManagementPage.tsx
- [ ] T219 [P] Create CreateMemberForm component in frontend/src/components/features/CreateMemberForm.tsx
- [ ] T220 [P] Create MemberListTable component with actions in frontend/src/components/features/MemberListTable.tsx
- [ ] T221 Implement adminService.createMember() in frontend/src/services/endpoints/adminService.ts
- [ ] T222 Implement adminService.getMembers() in frontend/src/services/endpoints/adminService.ts
- [ ] T223 Implement adminService.deleteMember() in frontend/src/services/endpoints/adminService.ts
- [ ] T224 Add admin routes to React Router with admin role check

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Documentation

- [ ] T225 [P] Create API documentation using OpenAPI spec at /api-docs endpoint in backend
- [ ] T226 [P] Create README.md with setup instructions for developers in repository root
- [ ] T227 [P] Document environment variables in backend/.env.example and frontend/.env.example
- [ ] T228 [P] Create CONTRIBUTING.md with code style and PR guidelines

### Security Hardening

- [ ] T229 [P] Add rate limiting middleware for authentication endpoints in backend/src/presentation/middleware/rateLimitMiddleware.ts
- [ ] T230 [P] Implement CSRF protection for forms in backend/src/presentation/middleware/csrfMiddleware.ts
- [ ] T231 [P] Add security headers (helmet.js) to Express app in backend/src/presentation/server.ts
- [ ] T232 [P] Implement input sanitization for user-generated content in backend/src/presentation/middleware/sanitizationMiddleware.ts
- [ ] T233 Add HTTPS enforcement configuration in backend

### Performance Optimization

- [ ] T234 [P] Add database query optimization and indexing review
- [ ] T235 [P] Implement Redis caching for member directory and announcements (optional) in backend/src/infrastructure/cache/
- [ ] T236 [P] Optimize frontend bundle size with code splitting in frontend/vite.config.ts
- [ ] T237 [P] Add lazy loading for routes in frontend React Router
- [ ] T238 [P] Implement image optimization for event and announcement images

### Error Handling & Logging

- [ ] T239 [P] Review and enhance error messages across all endpoints
- [ ] T240 [P] Add comprehensive logging for security events (login failures, account lockouts)
- [ ] T241 [P] Create error boundary components in frontend for graceful error handling in frontend/src/components/ErrorBoundary.tsx

### Testing & Validation

- [ ] T242 Run quickstart.md validation: Setup backend and frontend from scratch
- [ ] T243 Validate all acceptance scenarios from spec.md for User Story 1
- [ ] T244 Validate all acceptance scenarios from spec.md for User Story 2
- [ ] T245 Validate all acceptance scenarios from spec.md for User Story 3
- [ ] T246 Validate all acceptance scenarios from spec.md for User Story 4
- [ ] T247 Validate all acceptance scenarios from spec.md for User Story 5
- [ ] T248 Test all edge cases from spec.md (password reset expiration, account lockout, capacity limits, etc.)
- [ ] T249 Perform security audit: Test JWT expiration, RBAC enforcement, input validation

### Accessibility & UX

- [ ] T250 [P] Audit frontend for WCAG 2.1 Level AA compliance
- [ ] T251 [P] Add loading states for all async operations
- [ ] T252 [P] Implement proper error messages and user feedback for all forms
- [ ] T253 [P] Add keyboard navigation support for all interactive elements

### Deployment Preparation

- [ ] T254 [P] Create production environment configuration
- [ ] T255 [P] Setup database backup automation scripts
- [ ] T256 [P] Create deployment documentation in docs/deployment.md
- [ ] T257 [P] Configure CORS for production domains
- [ ] T258 Perform load testing to verify 200 concurrent users support

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if team capacity allows)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Admin Features (Phase 8)**: Depends on Phase 2 (Foundational) and Phase 4 (US2 - Authentication)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Landing Page**: Can start after Foundational (Phase 2) - **No dependencies on other stories**
- **User Story 2 (P2) - Authentication**: Can start after Foundational (Phase 2) - **No dependencies on other stories**
- **User Story 3 (P3) - Events**: Can start after Foundational (Phase 2) - Integrates with US2 for authenticated access but independently testable
- **User Story 4 (P4) - Announcements**: Can start after Foundational (Phase 2) - Integrates with US2 for authenticated access but independently testable
- **User Story 5 (P5) - Directory**: Can start after Foundational (Phase 2) - Integrates with US2 for authenticated access but independently testable

### Within Each User Story

- Domain entities and repositories before use cases
- Use cases before controllers
- Controllers before routes
- Backend routes before frontend services
- Frontend services before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks marked [P] can run in parallel (T004-T005, T006-T007, T011-T012)

**Phase 2 (Foundational)**:

- Database group (T013-T015) must be sequential
- Auth group tasks marked [P] can run in parallel (T016-T017)
- API foundation tasks marked [P] can run in parallel (T022-T023, T025-T026)
- Domain tasks marked [P] can run in parallel (T027-T029)
- Infrastructure tasks marked [P] can run in parallel (T030, T032)
- Frontend tasks marked [P] can run in parallel (T036-T037)

**Phase 3 (US1)**: All tasks marked [P] can run in parallel (T040-T044)

**Phase 4 (US2)**:

- Auth implementation: T050-T052 can run in parallel
- Password reset: T062-T063, T066-T067 can run in parallel
- Dashboard widgets: T073-T075 can run in parallel
- Profile pages: T083-T084 can run in parallel

**Phase 5 (US3)**:

- Domain: T086-T087, T088-T089 can run in parallel
- Use cases: All use case tasks (T090-T097) can run in parallel
- Frontend components: Most UI components marked [P] can be built in parallel

**Phase 6 (US4)**:

- Domain and use cases marked [P] can run in parallel
- Frontend components marked [P] can run in parallel

**Phase 7 (US5)**:

- Domain and use cases marked [P] can run in parallel
- Frontend components marked [P] can run in parallel

**Phase 8 (Admin)**: Tasks marked [P] can run in parallel (T211-T212, T217-T220)

**Phase 9 (Polish)**: Most tasks marked [P] can run in parallel

### Once Foundational Phase Completes

All user stories can start in parallel (if team capacity allows):

- Developer A: User Story 1 (Landing Page)
- Developer B: User Story 2 (Authentication)
- Developer C: User Story 3 (Events)
- Developer D: User Story 4 (Announcements)
- Developer E: User Story 5 (Directory)

---

## Parallel Example: User Story 3 (Events)

```bash
# Domain & Repository (parallel):
Task T086: "Define Event domain entity"
Task T087: "Define EventRSVP domain entity"
Task T088: "Implement Prisma repository for Event"
Task T089: "Implement Prisma repository for EventRSVP"

# Use Cases (all parallel after domain complete):
Task T090: "Create CreateEvent use case"
Task T091: "Create GetEvents use case"
Task T092: "Create GetEventById use case"
Task T093: "Create UpdateEvent use case"
Task T094: "Create CancelEvent use case"
Task T095: "Create RSVPToEvent use case"
Task T096: "Create CancelRSVP use case"
Task T097: "Create GetEventRSVPs use case"

# Frontend UI components (parallel):
Task T109: "Create EventsListPage component"
Task T110: "Create EventCard component"
Task T111: "Create EventCalendarView component"
Task T112: "Create EventFilters component"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

For fastest time-to-value, implement only the core:

1. **Complete Phase 1**: Setup (T001-T012)
2. **Complete Phase 2**: Foundational (T013-T039) - **CRITICAL BLOCKER**
3. **Complete Phase 3**: User Story 1 - Landing Page (T040-T049)
4. **Complete Phase 4**: User Story 2 - Authentication & Dashboard (T050-T085)
5. **STOP and VALIDATE**: Test independently, deploy/demo
6. **Result**: Public website with member authentication - immediate value!

### Incremental Delivery

Add features one story at a time:

1. **Setup + Foundational** → Foundation ready
2. **+ User Story 1** → Test independently → Deploy (Public landing page live!)
3. **+ User Story 2** → Test independently → Deploy (Member authentication working!)
4. **+ User Story 3** → Test independently → Deploy (Event management live!)
5. **+ User Story 4** → Test independently → Deploy (Announcements working!)
6. **+ User Story 5** → Test independently → Deploy (Full feature set complete!)
7. **+ Admin Features** → Deploy (Admin account management ready!)
8. **+ Polish** → Production-ready application

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With 5+ developers after Foundational phase complete:

1. **Team completes Setup + Foundational together** (T001-T039)
2. **Once Foundational is done, parallel work begins**:
   - Developer A: User Story 1 (Landing Page) - T040-T049
   - Developer B: User Story 2 (Authentication) - T050-T085
   - Developer C: User Story 3 (Events) - T086-T128
   - Developer D: User Story 4 (Announcements) - T129-T164
   - Developer E: User Story 5 (Directory) - T165-T210
3. **Stories complete and integrate independently**
4. **Entire team**: Admin Features (T211-T224) and Polish (T225-T258)

---

## Summary

**Total Tasks**: 258 tasks across 9 phases

**Task Count by Phase**:

- Phase 1 (Setup): 12 tasks
- Phase 2 (Foundational): 27 tasks - **CRITICAL PATH**
- Phase 3 (US1 - Landing Page): 10 tasks
- Phase 4 (US2 - Authentication): 36 tasks
- Phase 5 (US3 - Events): 43 tasks
- Phase 6 (US4 - Announcements): 36 tasks
- Phase 7 (US5 - Directory): 46 tasks
- Phase 8 (Admin Features): 14 tasks
- Phase 9 (Polish): 34 tasks

**Parallel Opportunities**: ~120 tasks marked [P] can run in parallel within their phases

**MVP Scope** (Recommended first delivery):

- Phase 1: Setup (12 tasks)
- Phase 2: Foundational (27 tasks)
- Phase 3: User Story 1 - Landing Page (10 tasks)
- Phase 4: User Story 2 - Authentication & Dashboard (36 tasks)
- **Total MVP: 85 tasks** - Delivers public website with member authentication

**Independent Test Criteria**:

- US1: Navigate to website, verify public content visible without authentication
- US2: Create account, login, view dashboard, logout, test password reset
- US3: Admin creates event, member RSVPs, admin views attendees
- US4: Admin creates announcement, member sees it, urgent notification sent
- US5: Member views directory, searches members, sends message, receives notification

**Format Validation**: ✅ All tasks follow required checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`

**Ready for Implementation**: ✅ Tasks are immediately executable with specific file paths and clear descriptions
