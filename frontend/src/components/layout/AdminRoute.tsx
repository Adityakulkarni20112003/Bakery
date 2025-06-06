import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  
  console.log('AdminRoute - isLoading:', isLoading);
  console.log('AdminRoute - isAuthenticated:', isAuthenticated);
  console.log('AdminRoute - isAdmin:', isAdmin);
  console.log('AdminRoute - isAdmin from localStorage:', localStorage.getItem('isAdmin'));
  
  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  // Only redirect after auth check is complete
  if (!isAuthenticated) {
    console.log('AdminRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    console.log('AdminRoute - Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('AdminRoute - Admin confirmed, rendering children');
  return <>{children}</>;
};

export default AdminRoute;
