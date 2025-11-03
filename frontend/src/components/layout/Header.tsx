import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Name */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">SB</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900">Sing Buri Adventist Center</h1>
              <p className="text-xs text-gray-500">ศูนย์แอดเวนตีสต์สิงห์บุรี</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-blue-600 font-medium transition"
            >
              Home
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/events"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Events
                </Link>
                <Link
                  to="/announcements"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Announcements
                </Link>
                <Link
                  to="/messages"
                  className="text-gray-600 hover:text-blue-600 font-medium transition"
                >
                  Messages
                </Link>
                {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                  <Link
                    to="/members"
                    className="text-gray-600 hover:text-blue-600 font-medium transition"
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
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
                  >
                    <span className="text-gray-700 font-semibold">
                      {user.firstName[0]}{user.lastName[0]}
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
                  <Button size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6 text-gray-600"
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
