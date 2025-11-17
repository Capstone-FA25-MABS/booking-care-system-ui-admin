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

    // Admin paths
    ADMIN: {
        ROOT: '/admin',
        DASHBOARD: 'dashboard',
        USERS: 'users',
        SETTINGS: {
            ROOT: 'settings',
            PROFILE: 'profile',
            SECURITY: 'security',
            NOTIFICATIONS: 'notifications',
            INTEGRATIONS: 'integrations',
            TWO_FACTOR: 'two-factor-authentication',
        },
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
        SERVICE_CATEGORIES: {
            ROOT: 'service-categories',
            ADD: 'add',
            EDIT: 'edit/:id',
        },
        SERVICES: {
            ROOT: 'services',
        },
        SUBSCRIPTION_PLANS: {
            ROOT: 'subscription-plans',
            ADD: 'add',
            EDIT: 'edit/:id',
            MANAGE_HOSPITALS: 'manage-hospital-subscriptions',
        },
        HOSPITAL_REGISTRATIONS: {
            ROOT: 'hospital-registrations',
        },
        NOTIFICATIONS: {
            ROOT: 'notifications',
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
        DOCTOR_MANAGEMENT: {
            ROOT: 'doctor-management',
        },
        APPOINTMENTS: {
            ROOT: 'appointments',
            NEW: 'new',
            CALENDAR: 'calendar',
        },
        SERVICES: {
            ROOT: 'services',
            ADD: 'add',
            EDIT: 'edit/:id',
        },
        SPECIALTIES: {
            ROOT: 'specialties',
        },
        SERVICE_TYPES: {
            ROOT: 'service-types',
        },
        SERVICE_MEDICALS: {
            ROOT: 'service-medicals',
        },
        REFUNDS: {
            ROOT: 'refunds',
        },
        MESSAGES: 'messages',
        SUBSCRIPTION_PLAN: 'subscription-plan',
        SUBSCRIPTION_INFO: 'subscription-info',
        PROFILE_SETTINGS: 'profile-settings',
        NOTIFICATIONS: {
            ROOT: 'notifications',
        },
        SETTINGS: {
            ROOT: 'settings',
            PROFILE: 'profile',
            TWO_FACTOR: 'two-factor-authentication',
        },
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
        NOTIFICATIONS: {
            ROOT: 'notifications',
        },
        SETTINGS: {
            ROOT: 'settings',
            PROFILE: 'profile',
            TWO_FACTOR: 'two-factor-authentication',
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
