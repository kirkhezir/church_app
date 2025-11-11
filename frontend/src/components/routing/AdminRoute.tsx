import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
  allowStaff?: boolean; // If true, allows both ADMIN and STAFF roles
}

/**
 * AdminRoute Component
 * Protects routes that require ADMIN (or optionally STAFF) role
 * Redirects to dashboard if user doesn't have required role
 */
export function AdminRoute({ children, allowStaff = true }: AdminRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = user.role === 'ADMIN' || (allowStaff && user.role === 'STAFF');

  if (!isAuthorized) {
    // User is logged in but doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
