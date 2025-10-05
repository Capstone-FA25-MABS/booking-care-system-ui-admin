import type { MenuItem } from '@/types/menu.types';
import { buildPath, PATHS } from './paths';

/**
 * Shared menu item factories
 * These functions create reusable menu items with dynamic paths
 */

/**
 * Create Appointments menu item for different roles
 */
export const createAppointmentsMenuItem = (role: 'clinic' | 'doctor'): MenuItem => {
    if (role === 'clinic') {
        return {
            label: 'Appointments',
            icon: 'ti ti-calendar-check',
            subItems: [
                {
                    label: 'Appointments',
                    link: buildPath(PATHS.CLINIC.ROOT, PATHS.CLINIC.APPOINTMENTS.ROOT),
                },
                {
                    label: 'New Appointment',
                    link: buildPath(
                        PATHS.CLINIC.ROOT,
                        PATHS.CLINIC.APPOINTMENTS.ROOT,
                        PATHS.CLINIC.APPOINTMENTS.NEW
                    ),
                },
                {
                    label: 'Calendar',
                    link: buildPath(
                        PATHS.CLINIC.ROOT,
                        PATHS.CLINIC.APPOINTMENTS.ROOT,
                        PATHS.CLINIC.APPOINTMENTS.CALENDAR
                    ),
                },
            ],
        };
    }

    // Doctor role
    return {
        label: 'Appointments',
        icon: 'ti ti-calendar-check',
        subItems: [
            {
                label: 'My Appointments',
                link: buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.APPOINTMENTS.ROOT),
            },
            {
                label: 'Calendar',
                link: buildPath(
                    PATHS.DOCTOR.ROOT,
                    PATHS.DOCTOR.APPOINTMENTS.ROOT,
                    PATHS.DOCTOR.APPOINTMENTS.CALENDAR
                ),
            },
        ],
    };
};

/**
 * Create Messages menu item for different roles
 */
export const createMessagesMenuItem = (role: 'clinic' | 'doctor'): MenuItem => {
    const basePath = role === 'clinic' ? PATHS.CLINIC : PATHS.DOCTOR;

    return {
        label: 'Messages',
        icon: 'ti ti-messages',
        link: buildPath(basePath.ROOT, basePath.MESSAGES),
    };
};

/**
 * Create Doctors menu item (Clinic only)
 */
export const createDoctorsMenuItem = (): MenuItem => ({
    label: 'Doctors',
    icon: 'ti ti-user-plus',
    subItems: [
        {
            label: 'Doctors',
            link: buildPath(PATHS.CLINIC.ROOT, PATHS.CLINIC.DOCTORS.ROOT),
        },
        {
            label: 'Add Doctor',
            link: buildPath(PATHS.CLINIC.ROOT, PATHS.CLINIC.DOCTORS.ROOT, PATHS.CLINIC.DOCTORS.ADD),
        },
    ],
});

/**
 * Create Dashboard menu item for Admin with multiple dashboards
 */
export const createDashboardMenuItem = (): MenuItem => ({
    label: 'Dashboard',
    icon: 'ti ti-layout-dashboard',
    subItems: [
        { label: 'Admin Dashboard', link: '/admin/dashboard' },
        { label: 'Doctor Dashboard', link: '/doctor/dashboard' },
        { label: 'Patient Dashboard', link: '/patient/dashboard' },
    ],
});

/**
 * Create Account Settings menu item (shared across all roles)
 */
export const createAccountSettingsMenuItem = (): MenuItem => ({
    label: 'Account Settings',
    icon: 'ti ti-user-cog',
    subItems: [
        {
            label: 'Profile',
            link: PATHS.COMMON.ACCOUNT_SETTINGS.PROFILE,
        },
        {
            label: 'Security',
            link: PATHS.COMMON.ACCOUNT_SETTINGS.SECURITY,
        },
        {
            label: 'Notifications',
            link: PATHS.COMMON.ACCOUNT_SETTINGS.NOTIFICATIONS,
        },
        {
            label: 'Integrations',
            link: PATHS.COMMON.ACCOUNT_SETTINGS.INTEGRATIONS,
        },
    ],
});

/**
 * Create simple menu items
 */
export const createSimpleMenuItem = (label: string, icon: string, link: string): MenuItem => ({
    label,
    icon,
    link,
});
