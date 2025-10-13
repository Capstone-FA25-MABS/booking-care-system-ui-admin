import { Role } from '../enums/common.enums';
import { PATHS } from '@/routes/paths';
/**
 * Re-export Role for backward compatibility
 * @deprecated Use Role from common.enums instead
 */
export { Role as UserRole } from '../enums/common.enums';

/**
 * Role configuration for layout and routes
 */
export interface RoleConfig {
    role: Role;
    defaultPath: string;
    layoutType: 'admin' | 'doctor' | 'staff';
}

/**
 * Role configurations mapping
 * Note: Only management roles (ADMIN, DOCTOR, STAFF) are configured here
 */
export const ROLE_CONFIGS: Record<Exclude<Role, Role.PATIENT>, RoleConfig> = {
    [Role.ADMIN]: {
        role: Role.ADMIN,
        defaultPath: PATHS.ADMIN.ROOT,
        layoutType: 'admin',
    },
    [Role.DOCTOR]: {
        role: Role.DOCTOR,
        defaultPath: PATHS.DOCTOR.ROOT,
        layoutType: 'doctor',
    },
    [Role.STAFF]: {
        role: Role.STAFF,
        defaultPath: PATHS.HOSPITAL.ROOT,
        layoutType: 'staff',
    },
};

/**
 * Get role config by role name
 */
export const getRoleConfig = (role: string): RoleConfig | undefined => {
    const upperRole = role.toUpperCase() as Role;
    return ROLE_CONFIGS[upperRole as Exclude<Role, Role.PATIENT>];
};

/**
 * Get primary role from multiple roles
 * Priority: ADMIN > DOCTOR > STAFF
 */
export const getPrimaryRole = (roles: string[]): Role | null => {
    const upperRoles = new Set(roles.map((r) => r.toUpperCase()));

    if (upperRoles.has(Role.ADMIN)) return Role.ADMIN;
    if (upperRoles.has(Role.DOCTOR)) return Role.DOCTOR;
    if (upperRoles.has(Role.STAFF)) return Role.STAFF;

    return null;
};
