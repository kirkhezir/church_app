import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 *
 * @throws Error if used outside of AuthProvider
 * @returns AuthContext value
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (isAuthenticated) {
 *   return <div>Welcome, {user?.firstName}!</div>;
 * }
 * ```
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
