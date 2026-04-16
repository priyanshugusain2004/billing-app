import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component for admin pages
 * Checks for admin token in localStorage
 */
const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!adminToken || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
