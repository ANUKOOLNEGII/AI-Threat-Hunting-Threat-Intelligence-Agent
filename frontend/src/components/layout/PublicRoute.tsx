import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-blue border-t-transparent" />
      </div>
    );
  }

  // If already logged in, redirect to the previous location or dashboard
  if (token) {
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
