
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../hooks/useStore';
import { Role } from '../../types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user } = useStore();

    if (!user || !allowedRoles.includes(user.role)) {
        // User not authenticated or not authorized, redirect to a safe page
        return <Navigate to="/billing" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
