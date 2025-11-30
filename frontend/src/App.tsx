import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Eagerly loaded - critical path
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import { PrivateRoute } from './components/routing/PrivateRoute';
import { AdminRoute } from './components/routing/AdminRoute';
import { PublicRoute } from './components/routing/PublicRoute';

// Lazy loaded pages - code splitting for better performance
const PasswordResetRequestPage = lazy(() => import('./pages/auth/PasswordResetRequestPage'));
const PasswordResetPage = lazy(() => import('./pages/auth/PasswordResetPage'));
const MFAEnrollmentPage = lazy(() => import('./pages/auth/MFAEnrollmentPage'));
const MFAVerificationPage = lazy(() => import('./pages/auth/MFAVerificationPage'));
const MemberDashboard = lazy(() => import('./pages/dashboard/MemberDashboard'));
const EditProfilePage = lazy(() => import('./pages/dashboard/EditProfilePage'));
const NotificationSettingsPage = lazy(() => import('./pages/dashboard/NotificationSettingsPage'));

// Event pages
const EventsListPage = lazy(() =>
  import('./pages/events/EventsListPage').then((m) => ({ default: m.EventsListPage }))
);
const EventDetailPage = lazy(() =>
  import('./pages/events/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);
const EventCreatePage = lazy(() =>
  import('./pages/events/EventCreatePage').then((m) => ({ default: m.EventCreatePage }))
);
const EventEditPage = lazy(() =>
  import('./pages/events/EventEditPage').then((m) => ({ default: m.EventEditPage }))
);
const RSVPListPage = lazy(() =>
  import('./pages/events/RSVPListPage').then((m) => ({ default: m.RSVPListPage }))
);

// Announcement pages
const AnnouncementsPage = lazy(() =>
  import('./pages/announcements/AnnouncementsPage').then((m) => ({ default: m.AnnouncementsPage }))
);
const AnnouncementDetailPage = lazy(() =>
  import('./pages/announcements/AnnouncementDetailPage').then((m) => ({
    default: m.AnnouncementDetailPage,
  }))
);
const AnnouncementCreatePage = lazy(() =>
  import('./pages/announcements/AnnouncementCreatePage').then((m) => ({
    default: m.AnnouncementCreatePage,
  }))
);
const AnnouncementEditPage = lazy(() =>
  import('./pages/announcements/AnnouncementEditPage').then((m) => ({
    default: m.AnnouncementEditPage,
  }))
);
const AnnouncementAnalyticsPage = lazy(() =>
  import('./pages/announcements/AnnouncementAnalyticsPage').then((m) => ({
    default: m.AnnouncementAnalyticsPage,
  }))
);

// Admin pages
const AdminAnnouncementsPage = lazy(() =>
  import('./pages/admin/AdminAnnouncementsPage').then((m) => ({
    default: m.AdminAnnouncementsPage,
  }))
);
const AdminMemberListPage = lazy(() => import('./pages/admin/AdminMemberListPage'));
const AdminCreateMemberPage = lazy(() => import('./pages/admin/AdminCreateMemberPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'));
const AdminDataExportPage = lazy(() => import('./pages/admin/AdminDataExportPage'));

// Member and Message pages
const MemberDirectoryPage = lazy(() =>
  import('./pages/members').then((m) => ({ default: m.MemberDirectoryPage }))
);
const MemberProfilePage = lazy(() =>
  import('./pages/members').then((m) => ({ default: m.MemberProfilePage }))
);
const MessagesListPage = lazy(() =>
  import('./pages/messages').then((m) => ({ default: m.MessagesListPage }))
);
const MessageDetailPage = lazy(() =>
  import('./pages/messages').then((m) => ({ default: m.MessageDetailPage }))
);
const ComposeMessagePage = lazy(() =>
  import('./pages/messages').then((m) => ({ default: m.ComposeMessagePage }))
);

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Placeholder components

const RegisterPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Register</h1>
      <p className="text-gray-600">Register page will be implemented in Phase 4</p>
    </div>
  </div>
);

const NotFoundPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">404 - Not Found</h1>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
    </div>
  </div>
);

/**
 * Main App Component with Routing
 * Uses React.lazy for code splitting and better performance
 */
const App: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page (no authentication required) */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/password-reset-request"
          element={
            <PublicRoute>
              <PasswordResetRequestPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <PasswordResetPage />
            </PublicRoute>
          }
        />

        {/* MFA Routes */}
        <Route
          path="/mfa-verify"
          element={
            <PublicRoute>
              <MFAVerificationPage />
            </PublicRoute>
          }
        />
        <Route
          path="/mfa-enroll"
          element={
            <PrivateRoute>
              <MFAEnrollmentPage />
            </PrivateRoute>
          }
        />

        {/* Public Events Page (no authentication required, but RSVP requires login) */}
        <Route path="/events" element={<EventsListPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />

        {/* Event Management Routes (ADMIN/STAFF only - protected in components) */}
        <Route
          path="/events/create"
          element={
            <PrivateRoute>
              <EventCreatePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/events/create"
          element={
            <AdminRoute>
              <EventCreatePage />
            </AdminRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <AdminRoute>
              <EventEditPage />
            </AdminRoute>
          }
        />
        <Route
          path="/events/:id/rsvps"
          element={
            <AdminRoute>
              <RSVPListPage />
            </AdminRoute>
          }
        />

        {/* Private Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <MemberDashboard />
            </PrivateRoute>
          }
        />

        {/* Announcements Routes */}
        <Route
          path="/announcements"
          element={
            <PrivateRoute>
              <AnnouncementsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/announcements/:id"
          element={
            <PrivateRoute>
              <AnnouncementDetailPage />
            </PrivateRoute>
          }
        />

        {/* Admin Announcement Routes */}
        <Route
          path="/admin/announcements"
          element={
            <AdminRoute>
              <AdminAnnouncementsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/announcements/create"
          element={
            <AdminRoute>
              <AnnouncementCreatePage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/announcements/:id/edit"
          element={
            <AdminRoute>
              <AnnouncementEditPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/announcements/:id/analytics"
          element={
            <AdminRoute>
              <AnnouncementAnalyticsPage />
            </AdminRoute>
          }
        />

        {/* Admin Member Management Routes */}
        <Route
          path="/admin/members"
          element={
            <AdminRoute>
              <AdminMemberListPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/members/create"
          element={
            <AdminRoute>
              <AdminCreateMemberPage />
            </AdminRoute>
          }
        />

        {/* Admin Audit Logs */}
        <Route
          path="/admin/audit-logs"
          element={
            <AdminRoute>
              <AdminAuditLogsPage />
            </AdminRoute>
          }
        />

        {/* Admin Data Export */}
        <Route
          path="/admin/export"
          element={
            <AdminRoute>
              <AdminDataExportPage />
            </AdminRoute>
          }
        />

        {/* Member Directory Routes */}
        <Route
          path="/members"
          element={
            <PrivateRoute>
              <MemberDirectoryPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/members/:id"
          element={
            <PrivateRoute>
              <MemberProfilePage />
            </PrivateRoute>
          }
        />

        {/* Messaging Routes */}
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <MessagesListPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages/compose"
          element={
            <PrivateRoute>
              <ComposeMessagePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages/:id"
          element={
            <PrivateRoute>
              <MessageDetailPage />
            </PrivateRoute>
          }
        />

        {/* Profile Settings */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <EditProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <NotificationSettingsPage />
            </PrivateRoute>
          }
        />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
