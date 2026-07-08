import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'analyst' | 'viewer'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-blue border-t-transparent" />
      </div>
    );
  }

  // If not authenticated, redirect to /login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role restriction exists and user lacks permissions, redirect to 403
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};
