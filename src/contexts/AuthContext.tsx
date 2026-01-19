import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userApi, UserProfile } from '@/lib/api';

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: UserProfile | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setTokenState(storedToken);

      // Skip user fetch on auth pages
      const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');
      if (isAuthPage) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await userApi.getMe();
        const userProfile = response.data;
        setUserState(userProfile);
        localStorage.setItem('user', JSON.stringify(userProfile));

        // Handle routing based on onboarding status
        if (!userProfile.onboarding_completed) {
          if (location.pathname !== '/onboarding') {
            navigate('/onboarding', { 
              replace: true, 
              state: { step: userProfile.onboarding_step } 
            });
          }
        } else if (location.pathname === '/onboarding') {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Token might be invalid - clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('auth_token', newToken);
    } else {
      localStorage.removeItem('auth_token');
    }
    setTokenState(newToken);
  };

  const setUser = (newUser: UserProfile | null) => {
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser));
    } else {
      localStorage.removeItem('user');
    }
    setUserState(newUser);
  };

  const logout = () => {
    // Clear JWT token and user from state
    setToken(null);
    setUser(null);

    // Explicitly clear all auth-related items from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('pending_auth_email');

    // Navigate to auth page using React Router
    navigate('/auth', { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        setToken,
        setUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
