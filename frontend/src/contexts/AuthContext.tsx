import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppDispatch } from '../redux/hooks';
import { setCredentials, logout as logoutAction } from '../redux/slices/authSlice';
import { authService } from '../services/auth.service';
import type { User } from '../redux/slices/authSlice';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, refreshToken: string, user: User, rememberMe?: boolean) => void;
  logout: () => void;
  hasRole: (roles: Array<'admin' | 'analyst' | 'viewer'>) => boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check for existing session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedRefresh = localStorage.getItem('refreshToken');
        const rememberMe = localStorage.getItem('rememberMe') === 'true';

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as User;
          
          // In real production we might validate or refresh token on startup
          if (rememberMe && storedRefresh) {
            try {
              const res = await authService.refreshToken(storedRefresh);
              localStorage.setItem('token', res.token);
              setToken(res.token);
              setUser(parsedUser);
              dispatch(setCredentials({ token: res.token, user: parsedUser }));
            } catch {
              // Refresh failed, logout
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              localStorage.removeItem('refreshToken');
            }
          } else {
            setToken(storedToken);
            setUser(parsedUser);
            dispatch(setCredentials({ token: storedToken, user: parsedUser }));
          }
        }
      } catch (err) {
        console.error('Session restoration failed:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Handle automatic silent refresh every 10 minutes if user is authenticated
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      const storedRefresh = localStorage.getItem('refreshToken');
      if (storedRefresh) {
        try {
          const res = await authService.refreshToken(storedRefresh);
          localStorage.setItem('token', res.token);
          setToken(res.token);
        } catch (err) {
          console.error('Silent token refresh failed:', err);
        }
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [token]);

  const login = (newToken: string, newRefreshToken: string, newUser: User, rememberMe = false) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('rememberMe', String(rememberMe));
    
    setToken(newToken);
    setUser(newUser);
    dispatch(setCredentials({ token: newToken, user: newUser }));
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('API logout warning:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('rememberMe');
      setToken(null);
      setUser(null);
      dispatch(logoutAction());
    }
  };

  const hasRole = (allowedRoles: Array<'admin' | 'analyst' | 'viewer'>): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  const refreshSession = async () => {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) return;
    const res = await authService.refreshToken(storedRefresh);
    localStorage.setItem('token', res.token);
    setToken(res.token);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
