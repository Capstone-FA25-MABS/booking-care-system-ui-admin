import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Role } from '@/enums/common.enums';
import { PATHS } from '@/routes/paths';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

/**
 * Protected Route Component
 * Checks if user has required role to access the route
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const location = useLocation();
    const { roles, isAuthenticated } = useSelector((state: RootState) => state.auth);

    // Not authenticated -> redirect to login
    if (!isAuthenticated) {
        return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
    }

    // Check if user has any of the allowed roles
    const hasAccess = roles.some((role) => allowedRoles.includes(role.toUpperCase() as Role));

    // No access -> redirect to appropriate dashboard or unauthorized page
    if (!hasAccess) {
        // If user has ADMIN role, redirect to admin dashboard
        if (roles.includes('ADMIN')) {
            return <Navigate to={PATHS.ADMIN.ROOT} replace />;
        }
        // If user has DOCTOR role, redirect to doctor dashboard
        if (roles.includes('DOCTOR')) {
            return <Navigate to={PATHS.DOCTOR.ROOT} replace />;
        }
        // If user has STAFF role, redirect to clinic dashboard
        if (roles.includes('STAFF')) {
            return <Navigate to={PATHS.CLINIC.ROOT} replace />;
        }
        // Fallback: redirect to login
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
