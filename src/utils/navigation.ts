import { getPrimaryRole, getRoleConfig } from '@/types/role.types';
import { PATHS } from '@/routes/paths';

/**
 * Get redirect path based on user roles
 * @param roles - Array of user roles
 * @returns Path to redirect user to
 */
export const getRedirectPathByRole = (roles: string[]): string => {
    if (!roles || roles.length === 0) {
        return PATHS.LOGIN;
    }

    const primaryRole = getPrimaryRole(roles);

    if (!primaryRole) {
        return PATHS.LOGIN;
    }

    const roleConfig = getRoleConfig(primaryRole);

    return roleConfig?.defaultPath || PATHS.LOGIN;
};

/**
 * Check if user has specific role
 * @param userRoles - Array of user roles
 * @param requiredRole - Role to check
 * @returns true if user has the role
 */
export const hasRole = (userRoles: string[], requiredRole: string): boolean => {
    return userRoles.some((role) => role.toUpperCase() === requiredRole.toUpperCase());
};

/**
 * Check if user has any of the required roles
 * @param userRoles - Array of user roles
 * @param requiredRoles - Array of roles to check
 * @returns true if user has at least one of the roles
 */
export const hasAnyRole = (userRoles: string[], requiredRoles: string[]): boolean => {
    return requiredRoles.some((requiredRole) =>
        userRoles.some((userRole) => userRole.toUpperCase() === requiredRole.toUpperCase())
    );
};

/**
 * Get security settings path based on user roles
 * @param roles - Array of user roles
 * @returns Path to security settings page
 */
export const getSecuritySettingsPath = (roles: string[]): string => {
    const primaryRole = getPrimaryRole(roles);

    if (!primaryRole) {
        return PATHS.LOGIN;
    }

    const roleUpper = primaryRole.toUpperCase();

    switch (roleUpper) {
        case 'ADMIN':
            return `${PATHS.ADMIN.ROOT}/${PATHS.ADMIN.SETTINGS.ROOT}/${PATHS.ADMIN.SETTINGS.SECURITY}`;
        case 'STAFF':
            return `${PATHS.HOSPITAL.ROOT}/${PATHS.HOSPITAL.SETTINGS.ROOT}/${PATHS.HOSPITAL.SETTINGS.SECURITY}`;
        case 'DOCTOR':
            return `${PATHS.DOCTOR.ROOT}/${PATHS.DOCTOR.SETTINGS.ROOT}/${PATHS.DOCTOR.SETTINGS.SECURITY}`;
        default:
            return PATHS.LOGIN;
    }
};
