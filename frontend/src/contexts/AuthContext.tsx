import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from 'react';
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
 * MFA Login Response for completing the MFA flow
 */
interface MFALoginResponse {
  accessToken: string;
  refreshToken: string;
  member: Member;
}

/**
 * Login result - either complete login or requires MFA
 */
interface LoginResult {
  mfaRequired?: boolean;
  mfaToken?: string;
  email?: string;
}

/**
 * Authentication Context Type
 */
interface AuthContextType {
  user: Member | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult | void>;
  logout: () => Promise<void>;
  completeMFALogin: (response: MFALoginResponse) => void;
}

/**
 * Authentication Context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * useAuth Hook
 * Custom hook to access authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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
      alert('Your session has expired after 24 hours. Please sign in again.');
    }, AUTO_LOGOUT_DURATION);

    setLogoutTimer(timer);
  }, [clearLogoutTimer]);

  /**
   * Login user with email and password
   * Returns MFA token if MFA is required
   */
  const login = async (email: string, password: string): Promise<LoginResult | void> => {
    try {
      const response = await authService.login(email, password);

      // Check if MFA is required
      if ((response as any).mfaRequired) {
        return {
          mfaRequired: true,
          mfaToken: (response as any).mfaToken,
          email,
        };
      }

      const { accessToken, refreshToken, member } = response;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Store user data
      localStorage.setItem('user', JSON.stringify(member));

      // Set user state
      setUser(member);

      // Setup 24-hour auto-logout
      setupLogoutTimer();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  /**
   * Complete MFA login after successful verification
   */
  const completeMFALogin = (response: MFALoginResponse): void => {
    const { accessToken, refreshToken, member } = response;

    // Store tokens in localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    // Store user data
    localStorage.setItem('user', JSON.stringify(member));

    // Set user state
    setUser(member);

    // Setup 24-hour auto-logout
    setupLogoutTimer();
  };

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        // Call logout API
        await authService.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Continue with local cleanup even if API call fails
    } finally {
      // Clear tokens and user data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Clear user state
      setUser(null);

      // Clear logout timer
      clearLogoutTimer();

      // Redirect to login page
      window.location.href = '/login';
    }
  }, [clearLogoutTimer]);

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
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Clear invalid data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
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
    completeMFALogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
