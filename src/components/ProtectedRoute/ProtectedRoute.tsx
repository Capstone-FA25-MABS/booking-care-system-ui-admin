import { useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '@/store';
import { Role } from '@/enums/common.enums';
import { PATHS } from '@/routes/paths';
import { getSecuritySettingsPath } from '@/utils/navigation';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: Role[];
}

/**
 * Check if current path is security settings page
 */
const isSecuritySettingsPath = (pathname: string): boolean => {
    const securityPaths = [
        `${PATHS.ADMIN.ROOT}/${PATHS.ADMIN.SETTINGS.ROOT}/${PATHS.ADMIN.SETTINGS.SECURITY}`,
        `${PATHS.HOSPITAL.ROOT}/${PATHS.HOSPITAL.SETTINGS.ROOT}/${PATHS.HOSPITAL.SETTINGS.SECURITY}`,
        `${PATHS.DOCTOR.ROOT}/${PATHS.DOCTOR.SETTINGS.ROOT}/${PATHS.DOCTOR.SETTINGS.SECURITY}`,
    ];
    return securityPaths.some((path) => pathname.includes(path));
};

/**
 * Protected Route Component
 * Checks if user has required role to access the route
 * Also enforces password change requirement
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const location = useLocation();
    const { roles, isAuthenticated, mustChangePassword } = useSelector(
        (state: RootState) => state.auth
    );

    // Track if toast has been shown to prevent duplicate toasts
    // IMPORTANT: All hooks must be called before any early returns
    const toastShownRef = useRef(false);

    // Calculate conditions for redirect
    const hasAccess = roles.some((role) => allowedRoles.includes(role.toUpperCase() as Role));
    const shouldRedirectToSecurity =
        isAuthenticated &&
        hasAccess &&
        mustChangePassword &&
        !isSecuritySettingsPath(location.pathname);

    // Show toast warning when user tries to access other routes while must change password
    useEffect(() => {
        if (shouldRedirectToSecurity && !toastShownRef.current) {
            toast.warning('Vui lòng đổi mật khẩu trước khi truy cập các tính năng khác.');
            toastShownRef.current = true;
        }

        // Reset toast flag when user completes password change
        if (!mustChangePassword) {
            toastShownRef.current = false;
        }
    }, [shouldRedirectToSecurity, mustChangePassword]);

    // Not authenticated -> redirect to login
    if (!isAuthenticated) {
        return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
    }

    // No access -> redirect to appropriate dashboard or unauthorized page
    if (!hasAccess) {
        if (roles.includes('ADMIN')) {
            return <Navigate to={PATHS.ADMIN.ROOT} replace />;
        }
        if (roles.includes('DOCTOR')) {
            return <Navigate to={PATHS.DOCTOR.ROOT} replace />;
        }
        if (roles.includes('STAFF')) {
            return <Navigate to={PATHS.HOSPITAL.ROOT} replace />;
        }
        return <Navigate to={PATHS.LOGIN} replace />;
    }

    // Must change password -> redirect to security settings
    if (shouldRedirectToSecurity) {
        const securityPath = getSecuritySettingsPath(roles);
        return <Navigate to={securityPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
