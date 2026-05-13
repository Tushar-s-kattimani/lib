import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admin skips email verification, student needs it
  if (userData?.role === 'student' && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    console.log("Redirecting: Role mismatch", { allowedRoles, userRole: userData.role });
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
