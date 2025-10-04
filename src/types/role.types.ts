/**
 * User roles in the system
 */
export enum UserRole {
    ADMIN = 'ADMIN',
    DOCTOR = 'DOCTOR',
    STAFF = 'STAFF',
}

/**
 * Role configuration for layout and routes
 */
export interface RoleConfig {
    role: UserRole;
    defaultPath: string;
    layoutType: 'admin' | 'doctor' | 'staff';
}

/**
 * Role configurations mapping
 */
export const ROLE_CONFIGS: Record<UserRole, RoleConfig> = {
    [UserRole.ADMIN]: {
        role: UserRole.ADMIN,
        defaultPath: '/admin/dashboard',
        layoutType: 'admin',
    },
    [UserRole.DOCTOR]: {
        role: UserRole.DOCTOR,
        defaultPath: '/doctor/dashboard',
        layoutType: 'doctor',
    },
    [UserRole.STAFF]: {
        role: UserRole.STAFF,
        defaultPath: '/clinic/dashboard',
        layoutType: 'staff',
    },
};

/**
 * Get role config by role name
 */
export const getRoleConfig = (role: string): RoleConfig | undefined => {
    const upperRole = role.toUpperCase() as UserRole;
    return ROLE_CONFIGS[upperRole];
};

/**
 * Get primary role from multiple roles
 * Priority: ADMIN > DOCTOR > STAFF
 */
export const getPrimaryRole = (roles: string[]): UserRole | null => {
    const upperRoles = new Set(roles.map((r) => r.toUpperCase()));

    if (upperRoles.has(UserRole.ADMIN)) return UserRole.ADMIN;
    if (upperRoles.has(UserRole.DOCTOR)) return UserRole.DOCTOR;
    if (upperRoles.has(UserRole.STAFF)) return UserRole.STAFF;

    return null;
};
