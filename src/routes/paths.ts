/**
 * Path constants for the application
 */
export const PATHS = {
    // General paths
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',

    // Admin paths
    ADMIN: {
        ROOT: '/admin',
        DASHBOARD: 'dashboard',
        USERS: 'users',
        SETTINGS: 'settings',
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
