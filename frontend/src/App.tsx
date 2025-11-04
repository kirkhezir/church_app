import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import PasswordResetRequestPage from './pages/auth/PasswordResetRequestPage';
import PasswordResetPage from './pages/auth/PasswordResetPage';
import MemberDashboard from './pages/dashboard/MemberDashboard';
import { PrivateRoute } from './components/routing/PrivateRoute';
import { PublicRoute } from './components/routing/PublicRoute';

// Placeholder components (to be implemented in Phase 4)

const RegisterPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Register</h1>
      <p className="text-gray-600">Register page will be implemented in Phase 4</p>
    </div>
  </div>
);

const EventsPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Events</h1>
      <p className="text-gray-600">Events page will be implemented in Phase 4</p>
    </div>
  </div>
);

const AnnouncementsPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Announcements</h1>
      <p className="text-gray-600">Announcements page will be implemented in Phase 4</p>
    </div>
  </div>
);

const MessagesPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Messages</h1>
      <p className="text-gray-600">Messages page will be implemented in Phase 4</p>
    </div>
  </div>
);

const MembersPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Members</h1>
      <p className="text-gray-600">Members page will be implemented in Phase 4</p>
    </div>
  </div>
);

const ProfilePage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gray-100">
    <div className="rounded-lg bg-white p-8 shadow-md">
      <h1 className="mb-4 text-2xl font-bold">Profile</h1>
      <p className="text-gray-600">Profile page will be implemented in Phase 4</p>
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

      {/* Private Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <MemberDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/events"
        element={
          <PrivateRoute>
            <EventsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/announcements"
        element={
          <PrivateRoute>
            <AnnouncementsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <MessagesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/members"
        element={
          <PrivateRoute>
            <MembersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        }
      />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
