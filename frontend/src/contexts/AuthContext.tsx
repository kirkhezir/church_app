import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/endpoints/authService';

/**
 * Member type
 */
interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

/**
 * Authentication Context Type
 */
interface AuthContextType {
  user: Member | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/**
 * Authentication Context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and automatic 24-hour logout
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [logoutTimer, setLogoutTimer] = useState<NodeJS.Timeout | null>(null);

  const AUTO_LOGOUT_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Clear logout timer
   */
  const clearLogoutTimer = useCallback(() => {
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  }, [logoutTimer]);

  /**
   * Setup automatic logout timer
   */
  const setupLogoutTimer = useCallback(() => {
    clearLogoutTimer();

    const timer = setTimeout(() => {
      logout();
      alert('Your session has expired after 24 hours. Please login again.');
    }, AUTO_LOGOUT_DURATION);

    setLogoutTimer(timer);
  }, [clearLogoutTimer]);

  /**
   * Login user
   */
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await apiClient.post<{ data: LoginResponse }>('/auth/login', credentials);
      const { accessToken, refreshToken, user: userData } = response.data;

      // Store tokens
      apiClient.setTokens(accessToken, refreshToken);

      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));

      // Set user state
      setUser(userData as never);

      // Setup 24-hour auto-logout
      setupLogoutTimer();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    // Clear tokens
    apiClient.clearTokens();

    // Clear user state
    setUser(null);

    // Clear logout timer
    clearLogoutTimer();

    // Redirect to login page
    window.location.href = '/login';
  }, [clearLogoutTimer]);

  /**
   * Refresh user data from API
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiClient.get<{ data: Member }>('/auth/me');
      const userData = response.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
    }
  };

  /**
   * Initialize authentication state from localStorage
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const accessToken = localStorage.getItem('accessToken');

        if (storedUser && accessToken) {
          const userData = JSON.parse(storedUser) as Member;
          setUser(userData);
          setupLogoutTimer();

          // Optionally refresh user data from API
          // await refreshUser();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        apiClient.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Cleanup timer on unmount
    return () => {
      clearLogoutTimer();
    };
  }, []);

  /**
   * Reset logout timer on user activity
   */
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      setupLogoutTimer();
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [user, setupLogoutTimer]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
