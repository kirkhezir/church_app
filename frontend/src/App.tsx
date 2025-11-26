import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import PasswordResetRequestPage from './pages/auth/PasswordResetRequestPage';
import PasswordResetPage from './pages/auth/PasswordResetPage';
import MFAEnrollmentPage from './pages/auth/MFAEnrollmentPage';
import MFAVerificationPage from './pages/auth/MFAVerificationPage';
import MemberDashboard from './pages/dashboard/MemberDashboard';
import EditProfilePage from './pages/dashboard/EditProfilePage';
import NotificationSettingsPage from './pages/dashboard/NotificationSettingsPage';
import { EventsListPage } from './pages/events/EventsListPage';
import { EventDetailPage } from './pages/events/EventDetailPage';
import { EventCreatePage } from './pages/events/EventCreatePage';
import { EventEditPage } from './pages/events/EventEditPage';
import { RSVPListPage } from './pages/events/RSVPListPage';
import { AnnouncementsPage } from './pages/announcements/AnnouncementsPage';
import { AnnouncementDetailPage } from './pages/announcements/AnnouncementDetailPage';
import { AnnouncementCreatePage } from './pages/announcements/AnnouncementCreatePage';
import { AnnouncementEditPage } from './pages/announcements/AnnouncementEditPage';
import { AnnouncementAnalyticsPage } from './pages/announcements/AnnouncementAnalyticsPage';
import { AdminAnnouncementsPage } from './pages/admin/AdminAnnouncementsPage';
import AdminMemberListPage from './pages/admin/AdminMemberListPage';
import AdminCreateMemberPage from './pages/admin/AdminCreateMemberPage';
import AdminAuditLogsPage from './pages/admin/AdminAuditLogsPage';
import AdminDataExportPage from './pages/admin/AdminDataExportPage';
import { MemberDirectoryPage, MemberProfilePage } from './pages/members';
import { MessagesListPage, MessageDetailPage, ComposeMessagePage } from './pages/messages';
import { PrivateRoute } from './components/routing/PrivateRoute';
import { AdminRoute } from './components/routing/AdminRoute';
import { PublicRoute } from './components/routing/PublicRoute';

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
 */
const App: React.FC = () => {
  return (
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
  );
};

export default App;
