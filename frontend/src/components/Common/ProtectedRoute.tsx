import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page and keep the path they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const currentRole = user?.activeRole || user?.role;
  if (allowedRoles && user && currentRole && !allowedRoles.includes(currentRole)) {
    // If the user's role is not allowed, redirect to main Dashboard view
    return <Navigate to="/not-found" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
