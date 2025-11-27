/**
 * Admin Navigation Component
 *
 * Secondary navigation for admin pages:
 * - Member Management
 * - Audit Logs
 * - Data Export
 */

import { Link, useLocation } from 'react-router-dom';

interface AdminNavItem {
  label: string;
  path: string;
  icon: JSX.Element;
}

export const AdminNavigation: React.FC = () => {
  const location = useLocation();

  const adminNavItems: AdminNavItem[] = [
    {
      label: 'Members',
      path: '/admin/members',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      label: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      label: 'Data Export',
      path: '/admin/export',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
  ];

  const isActive = (path: string): boolean => {
    if (path === '/admin/members') {
      return (
        location.pathname === '/admin/members' || location.pathname === '/admin/members/create'
      );
    }
    return location.pathname === path;
  };

  return (
    <div className="mb-6 border-b border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-1">
          <span className="mr-4 py-2 text-sm font-semibold text-gray-700">Admin:</span>
          {adminNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center space-x-1.5 px-3 py-2 text-sm transition
                ${
                  isActive(item.path)
                    ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNavigation;
