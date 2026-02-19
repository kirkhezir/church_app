import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';

/**
 * Header Component
 * Main navigation header with logo, menu, and user actions
 */
export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-border bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Name */}
          <Link to="/" className="flex items-center space-x-3 transition hover:opacity-80">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-xl font-bold text-white">SB</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-foreground text-balance">Sing Buri Adventist Center</h1>
              <p className="text-xs text-muted-foreground">ศูนย์แอดเวนตีสต์สิงห์บุรี</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            <Link
              to="/"
              className="font-medium text-muted-foreground transition hover:text-primary"
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/app/dashboard"
                  className="font-medium text-muted-foreground transition hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  to="/app/events"
                  className="font-medium text-muted-foreground transition hover:text-primary"
                >
                  Events
                </Link>
                <Link
                  to="/app/announcements"
                  className="font-medium text-muted-foreground transition hover:text-primary"
                >
                  Announcements
                </Link>
                <Link
                  to="/app/messages"
                  className="font-medium text-muted-foreground transition hover:text-primary"
                >
                  Messages
                </Link>
                {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                  <Link
                    to="/app/members"
                    className="font-medium text-muted-foreground transition hover:text-primary"
                  >
                    Members
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs capitalize text-muted-foreground">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                  <Link
                    to="/app/profile"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition hover:bg-muted/80"
                  >
                    <span className="font-semibold text-foreground/80">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </span>
                  </Link>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    size="sm"
                    className="hidden md:block"
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="rounded-lg p-2 transition hover:bg-muted md:hidden"
              aria-label="Menu"
            >
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
