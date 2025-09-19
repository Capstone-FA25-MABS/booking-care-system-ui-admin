/**
 * Path constants for the application
 */
import { ROUTE_PATHS } from '@/constants/validation';

export const PATHS = {
    // General paths
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: ROUTE_PATHS.FORGOT_PASSWORD,
    RESET_PASSWORD: ROUTE_PATHS.RESET_PASSWORD,
    DASHBOARD: '/dashboard',

    // Admin paths
    ADMIN: {
        ROOT: '/admin',
        DASHBOARD: 'dashboard',
        USERS: 'users',
        SETTINGS: 'settings',
    },

    // Clinic paths
    CLINIC: {
        ROOT: '/clinic',
        DASHBOARD: 'dashboard',
        DOCTORS: {
            ROOT: 'doctors',
            ADD: 'add',
            EDIT: 'edit/:id',
        },
        APPOINTMENTS: {
            ROOT: 'appointments',
            NEW: 'new',
            CALENDAR: 'calendar',
        },
    },

    // Not Found path
    NOT_FOUND: '*',
} as const;

/**
 * Utility function to get relative path
 * @param parts
 * @returns
 */
export function buildPath(...parts: string[]): string {
    return parts
        .filter(Boolean)
        .map((p, i) => (i === 0 ? p.replace(/\/+$/, '') : p.replace(/^\/+|\/+$/g, '')))
        .join('/')
        .replace(/\/{2,}/g, '/');
}
