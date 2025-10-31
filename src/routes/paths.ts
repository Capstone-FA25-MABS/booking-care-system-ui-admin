/**
 * Path constants for the application
 */
export const PATHS = {
    // General paths
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/dashboard',

    // Common paths (shared across roles)
    COMMON: {
        ACCOUNT_SETTINGS: {
            ROOT: '/settings',
            PROFILE: '/settings/profile',
            SECURITY: '/settings/security',
            NOTIFICATIONS: '/settings/notifications',
            INTEGRATIONS: '/settings/integrations',
        },
    },

    // Admin paths
    ADMIN: {
        ROOT: '/admin',
        DASHBOARD: 'dashboard',
        USERS: 'users',
        SETTINGS: 'settings',
        POSITIONS: {
            ROOT: 'positions',
        },
        LANGUAGES: {
            ROOT: 'languages',
        },
        SPECIALTIES: {
            ROOT: 'specialties',
        },
        PAYMENT_METHODS: {
            ROOT: 'payment-methods',
        },
        ACCOUNT_MANAGEMENT: {
            ROOT: 'accounts',
        },
        SERVICE_TYPES: {
            ROOT: 'service-types',
        },
    },

    // Hospital paths
    HOSPITAL: {
        ROOT: '/hospitals',
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
        REFUNDS: {
            ROOT: 'refunds',
        },
        MESSAGES: 'messages',
        SUBSCRIPTION_PLAN: 'subscription-plan',
    },

    // Doctor paths
    DOCTOR: {
        ROOT: '/doctors',
        DASHBOARD: 'dashboard',
        APPOINTMENTS: {
            ROOT: 'appointments',
            CALENDAR: 'calendar',
        },
        SCHEDULE: 'schedule',
        PATIENTS: 'patients',
        MESSAGES: 'messages',
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
