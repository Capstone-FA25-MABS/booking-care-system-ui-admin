import type { MenuItem } from '@/types/menu.types';
import { buildPath, PATHS } from './paths';

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
            label: 'Quản lý lịch hẹn',
            icon: 'ti ti-calendar-check',
            subItems: [
                {
                    label: 'Danh sách lịch hẹn',
                    link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.APPOINTMENTS.ROOT),
                },
                {
                    label: 'Thêm lịch hẹn',
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
        label: 'Lịch hẹn khám',
        icon: 'ti ti-calendar-check',
        subItems: [
            {
                label: 'Lịch hẹn khám của tôi',
                link: buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.APPOINTMENTS.ROOT),
            },
            {
                label: 'Lịch',
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
 * Create Doctors menu item (Hospital only)
 */
export const createDoctorsMenuItem = (): MenuItem => ({
    label: 'Quản lý bác sĩ',
    icon: 'ti ti-user-plus',
    subItems: [
        {
            label: 'Danh sách bác sĩ',
            link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTORS.ROOT),
        },
        {
            label: 'Thêm bác sĩ',
            link: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.DOCTORS.ROOT,
                PATHS.HOSPITAL.DOCTORS.ADD
            ),
        },
    ],
});

/**
 * Create Subscription Plans menu item (Admin only)
 */
export const createSubscriptionPlansMenuItem = (): MenuItem => ({
    label: 'Gói dịch vụ',
    icon: 'ti ti-package',
    subItems: [
        {
            label: 'Danh sách gói dịch vụ',
            link: buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SUBSCRIPTION_PLANS.ROOT),
        },
        {
            label: 'Thêm gói dịch vụ',
            link: buildPath(
                PATHS.ADMIN.ROOT,
                PATHS.ADMIN.SUBSCRIPTION_PLANS.ROOT,
                PATHS.ADMIN.SUBSCRIPTION_PLANS.ADD
            ),
        },
        {
            label: 'Đăng ký gói của bệnh viện',
            link: buildPath(
                PATHS.ADMIN.ROOT,
                PATHS.ADMIN.SUBSCRIPTION_PLANS.ROOT,
                PATHS.ADMIN.SUBSCRIPTION_PLANS.MANAGE_HOSPITALS
            ),
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
    label: 'Cài đặt tài khoản',
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
