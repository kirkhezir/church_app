import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Eagerly loaded - critical path (public landing pages)
import LandingPage from './pages/public/LandingPage';
import PrivacyPolicyPage from './pages/public/PrivacyPolicyPage';
import VisitPage from './pages/public/VisitPage';
import SermonsPage from './pages/public/SermonsPage';
import AboutPage from './pages/public/AboutPage';
import LoginPage from './pages/auth/LoginPage';

// Lazy-loaded public landing pages
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'));
const MinistriesPage = lazy(() => import('./pages/public/MinistriesPage'));
const MinistryDetailPage = lazy(() => import('./pages/public/MinistryDetailPage'));
const PublicEventsPage = lazy(() => import('./pages/public/EventsPage'));
const PublicEventDetailPage = lazy(() => import('./pages/public/EventDetailPage'));
const PrayerPage = lazy(() => import('./pages/public/PrayerPage'));
const GivePage = lazy(() => import('./pages/public/GivePage'));
const BlogPage = lazy(() => import('./pages/public/BlogPage'));
const ResourcesPage = lazy(() => import('./pages/public/ResourcesPage'));

// Route guards
import { PrivateRoute } from './components/routing/PrivateRoute';
import { AdminRoute } from './components/routing/AdminRoute';
import { PublicRoute } from './components/routing/PublicRoute';
import { ScrollToTop } from './components/common/ScrollToTop';

// Lazy loaded auth pages
const PasswordResetRequestPage = lazy(() => import('./pages/auth/PasswordResetRequestPage'));
const PasswordResetPage = lazy(() => import('./pages/auth/PasswordResetPage'));
const MFAEnrollmentPage = lazy(() => import('./pages/auth/MFAEnrollmentPage'));
const MFAVerificationPage = lazy(() => import('./pages/auth/MFAVerificationPage'));

// ============================================================
// Private App Pages (authenticated church management app)
// All routes under /app/* require authentication
// ============================================================

// Dashboard pages
const MemberDashboard = lazy(() => import('./pages/app/dashboard/MemberDashboard'));
const EditProfilePage = lazy(() => import('./pages/app/dashboard/EditProfilePage'));
const NotificationSettingsPage = lazy(
  () => import('./pages/app/dashboard/NotificationSettingsPage')
);

// Event management pages (private)
const EventsListPage = lazy(() =>
  import('./pages/app/events/EventsListPage').then((m) => ({ default: m.EventsListPage }))
);
const EventDetailPage = lazy(() =>
  import('./pages/app/events/EventDetailPage').then((m) => ({ default: m.EventDetailPage }))
);
const EventCreatePage = lazy(() =>
  import('./pages/app/events/EventCreatePage').then((m) => ({ default: m.EventCreatePage }))
);
const EventEditPage = lazy(() =>
  import('./pages/app/events/EventEditPage').then((m) => ({ default: m.EventEditPage }))
);
const RSVPListPage = lazy(() =>
  import('./pages/app/events/RSVPListPage').then((m) => ({ default: m.RSVPListPage }))
);

// Announcement management pages (private)
const AnnouncementsPage = lazy(() =>
  import('./pages/app/announcements/AnnouncementsPage').then((m) => ({
    default: m.AnnouncementsPage,
  }))
);
const AnnouncementDetailPage = lazy(() =>
  import('./pages/app/announcements/AnnouncementDetailPage').then((m) => ({
    default: m.AnnouncementDetailPage,
  }))
);
const AnnouncementCreatePage = lazy(() =>
  import('./pages/app/announcements/AnnouncementCreatePage').then((m) => ({
    default: m.AnnouncementCreatePage,
  }))
);
const AnnouncementEditPage = lazy(() =>
  import('./pages/app/announcements/AnnouncementEditPage').then((m) => ({
    default: m.AnnouncementEditPage,
  }))
);
const AnnouncementAnalyticsPage = lazy(() =>
  import('./pages/app/announcements/AnnouncementAnalyticsPage').then((m) => ({
    default: m.AnnouncementAnalyticsPage,
  }))
);

// Admin pages (private - admin only)
const AdminAnnouncementsPage = lazy(() =>
  import('./pages/app/admin/AdminAnnouncementsPage').then((m) => ({
    default: m.AdminAnnouncementsPage,
  }))
);
const AdminMemberListPage = lazy(() => import('./pages/app/admin/AdminMemberListPage'));
const AdminCreateMemberPage = lazy(() => import('./pages/app/admin/AdminCreateMemberPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/app/admin/AdminAuditLogsPage'));
const AdminDataExportPage = lazy(() => import('./pages/app/admin/AdminDataExportPage'));
const AdminHealthPage = lazy(() => import('./pages/app/admin/AdminHealthPage'));
const AdminReportsPage = lazy(() => import('./pages/app/admin/AdminReportsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/app/admin/AdminAnalyticsPage'));

// Settings page (private)
const SettingsPage = lazy(() => import('./pages/app/settings/SettingsPage'));

// Member and Message pages (private)
const MemberDirectoryPage = lazy(() =>
  import('./pages/app/members').then((m) => ({ default: m.MemberDirectoryPage }))
);
const MemberProfilePage = lazy(() =>
  import('./pages/app/members').then((m) => ({ default: m.MemberProfilePage }))
);
const MessagesListPage = lazy(() =>
  import('./pages/app/messages').then((m) => ({ default: m.MessagesListPage }))
);
const MessageDetailPage = lazy(() =>
  import('./pages/app/messages').then((m) => ({ default: m.MessageDetailPage }))
);
const ComposeMessagePage = lazy(() =>
  import('./pages/app/messages').then((m) => ({ default: m.ComposeMessagePage }))
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
      <p className="text-gray-600">The page you&apos;re looking for doesn&apos;t exist.</p>
    </div>
  </div>
);

/**
 * Main App Component with Routing
 *
 * Route architecture:
 * - Public landing pages: / (root paths) — no authentication required
 * - Auth pages: /login, /register, etc. — redirect to /app/dashboard if already logged in
 * - Private app pages: /app/* — all require authentication, use SidebarLayout
 * - Admin pages: /app/admin/* — require ADMIN role
 */
const App: React.FC = () => {
  return (
    <>
      {/* Scroll to top on route changes */}
      <ScrollToTop />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ============================================================ */}
          {/* PUBLIC LANDING PAGES (no authentication required)            */}
          {/* These use PublicLayout with church branding                   */}
          {/* ============================================================ */}

          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/visit" element={<VisitPage />} />
          <Route path="/sermons" element={<SermonsPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/ministries" element={<MinistriesPage />} />
          <Route path="/ministries/:slug" element={<MinistryDetailPage />} />
          <Route path="/events" element={<PublicEventsPage />} />
          <Route path="/events/:id" element={<PublicEventDetailPage />} />
          <Route path="/prayer" element={<PrayerPage />} />
          <Route path="/give" element={<GivePage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/news" element={<BlogPage />} />
          <Route path="/resources" element={<ResourcesPage />} />

          {/* ============================================================ */}
          {/* AUTH PAGES (redirect to app if already authenticated)         */}
          {/* ============================================================ */}

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

          {/* ============================================================ */}
          {/* PRIVATE APP PAGES (all under /app/*, require authentication) */}
          {/* These use SidebarLayout with app navigation                   */}
          {/* ============================================================ */}

          {/* Dashboard */}
          <Route
            path="/app/dashboard"
            element={
              <PrivateRoute>
                <MemberDashboard />
              </PrivateRoute>
            }
          />

          {/* Event Management */}
          <Route
            path="/app/events"
            element={
              <PrivateRoute>
                <EventsListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/events/create"
            element={
              <AdminRoute>
                <EventCreatePage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/events/:id"
            element={
              <PrivateRoute>
                <EventDetailPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/events/:id/edit"
            element={
              <AdminRoute>
                <EventEditPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/events/:id/rsvps"
            element={
              <AdminRoute>
                <RSVPListPage />
              </AdminRoute>
            }
          />

          {/* Announcements */}
          <Route
            path="/app/announcements"
            element={
              <PrivateRoute>
                <AnnouncementsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/announcements/:id"
            element={
              <PrivateRoute>
                <AnnouncementDetailPage />
              </PrivateRoute>
            }
          />

          {/* Member Directory */}
          <Route
            path="/app/members"
            element={
              <PrivateRoute>
                <MemberDirectoryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/members/:id"
            element={
              <PrivateRoute>
                <MemberProfilePage />
              </PrivateRoute>
            }
          />

          {/* Messaging */}
          <Route
            path="/app/messages"
            element={
              <PrivateRoute>
                <MessagesListPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/messages/compose"
            element={
              <PrivateRoute>
                <ComposeMessagePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/messages/:id"
            element={
              <PrivateRoute>
                <MessageDetailPage />
              </PrivateRoute>
            }
          />

          {/* Profile & Settings */}
          <Route
            path="/app/profile"
            element={
              <PrivateRoute>
                <EditProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/notifications"
            element={
              <PrivateRoute>
                <NotificationSettingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/app/settings"
            element={
              <PrivateRoute>
                <SettingsPage />
              </PrivateRoute>
            }
          />

          {/* ============================================================ */}
          {/* ADMIN PAGES (under /app/admin/*, require ADMIN role)          */}
          {/* ============================================================ */}

          <Route
            path="/app/admin/announcements"
            element={
              <AdminRoute>
                <AdminAnnouncementsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/announcements/create"
            element={
              <AdminRoute>
                <AnnouncementCreatePage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/announcements/:id/edit"
            element={
              <AdminRoute>
                <AnnouncementEditPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/announcements/:id/analytics"
            element={
              <AdminRoute>
                <AnnouncementAnalyticsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/members"
            element={
              <AdminRoute>
                <AdminMemberListPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/members/create"
            element={
              <AdminRoute>
                <AdminCreateMemberPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/audit-logs"
            element={
              <AdminRoute>
                <AdminAuditLogsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/export"
            element={
              <AdminRoute>
                <AdminDataExportPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/health"
            element={
              <AdminRoute>
                <AdminHealthPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/reports"
            element={
              <AdminRoute>
                <AdminReportsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/app/admin/analytics"
            element={
              <AdminRoute>
                <AdminAnalyticsPage />
              </AdminRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
