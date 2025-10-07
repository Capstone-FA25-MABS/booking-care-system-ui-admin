import type { MenuItem } from '@/types/menu.types';
import { buildPath, PATHS } from './paths';
import { DASHBOARD_MENU_CONFIG } from '@/constants/menu.constants';

/**
 * Shared menu item factories
 * These functions create reusable menu items with dynamic paths
 */

/**
 * Create Appointments menu item for different roles
 */
export const createAppointmentsMenuItem = (role: 'staff' | 'doctor'): MenuItem => {
    if (role === 'staff') {
        return {
            label: 'Appointments',
            icon: 'ti ti-calendar-check',
            subItems: [
                {
                    label: 'Appointments',
                    link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.APPOINTMENTS.ROOT),
                },
                {
                    label: 'New Appointment',
                    link: buildPath(
                        PATHS.HOSPITAL.ROOT,
                        PATHS.HOSPITAL.APPOINTMENTS.ROOT,
                        PATHS.HOSPITAL.APPOINTMENTS.NEW
                    ),
                },
                {
                    label: 'Calendar',
                    link: buildPath(
                        PATHS.HOSPITAL.ROOT,
                        PATHS.HOSPITAL.APPOINTMENTS.ROOT,
                        PATHS.HOSPITAL.APPOINTMENTS.CALENDAR
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
export const createMessagesMenuItem = (role: 'staff' | 'doctor'): MenuItem => {
    const basePath = role === 'staff' ? PATHS.HOSPITAL : PATHS.DOCTOR;

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
            link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTORS.ROOT),
        },
        {
            label: 'Add Doctor',
            link: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.DOCTORS.ROOT,
                PATHS.HOSPITAL.DOCTORS.ADD
            ),
        },
    ],
});

/**
 * Create Dashboard menu item for Admin with multiple dashboards
 */
export const createDashboardMenuItem = (): MenuItem => DASHBOARD_MENU_CONFIG;

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
