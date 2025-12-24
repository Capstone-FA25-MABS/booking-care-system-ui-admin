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
                    label: 'Lịch',
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
        label: 'Tin nhắn',
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
 * Create Hospital Subscription Plans menu item (Hospital/Staff only)
 */
export const createHospitalSubscriptionPlansMenuItem = (): MenuItem => ({
    label: 'Quản lí gói dịch vụ',
    icon: 'ti ti-package',
    subItems: [
        {
            label: 'Thông tin gói đăng ký',
            link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SUBSCRIPTION_INFO),
        },
        {
            label: 'Gói dịch vụ',
            link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SUBSCRIPTION_PLAN),
        },
    ],
});

/**
 * Create Dashboard menu item (single entry)
 */
export const createDashboardMenuItem = (): MenuItem => ({
    label: 'Bảng điều khiển',
    icon: 'ti ti-layout-dashboard',
    link: buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.DASHBOARD),
});

/**
 * Create Account Settings menu item for Admin (with all tabs)
 */
export const createAccountSettingsMenuItem = (): MenuItem => ({
    label: 'Cài đặt tài khoản',
    icon: 'ti ti-user-cog',
    subItems: [
        {
            label: 'Thông tin tài khoản',
            link: buildPath(
                PATHS.ADMIN.ROOT,
                PATHS.ADMIN.SETTINGS.ROOT,
                PATHS.ADMIN.SETTINGS.PROFILE
            ),
        },
        {
            label: 'Bảo mật',
            link: buildPath(
                PATHS.ADMIN.ROOT,
                PATHS.ADMIN.SETTINGS.ROOT,
                PATHS.ADMIN.SETTINGS.SECURITY
            ),
        },
        {
            label: 'Xác thực 2 yếu tố',
            link: buildPath(
                PATHS.ADMIN.ROOT,
                PATHS.ADMIN.SETTINGS.ROOT,
                PATHS.ADMIN.SETTINGS.TWO_FACTOR
            ),
        },
    ],
});

/**
 * Create Account Settings menu item for Doctor (only Profile tab)
 */
export const createDoctorAccountSettingsMenuItem = (): MenuItem => ({
    label: 'Cài đặt tài khoản',
    icon: 'ti ti-user-cog',
    subItems: [
        {
            label: 'Thông tin tài khoản',
            link: buildPath(
                PATHS.DOCTOR.ROOT,
                PATHS.DOCTOR.SETTINGS.ROOT,
                PATHS.DOCTOR.SETTINGS.PROFILE
            ),
        },
        {
            label: 'Bảo mật',
            link: buildPath(
                PATHS.DOCTOR.ROOT,
                PATHS.DOCTOR.SETTINGS.ROOT,
                PATHS.DOCTOR.SETTINGS.SECURITY
            ),
        },
        {
            label: 'Xác thực 2 yếu tố',
            link: buildPath(
                PATHS.DOCTOR.ROOT,
                PATHS.DOCTOR.SETTINGS.ROOT,
                PATHS.DOCTOR.SETTINGS.TWO_FACTOR
            ),
        },
    ],
});

/**
 * Create Account Settings menu item for Staff/Hospital (only Profile tab)
 */
export const createHospitalAccountSettingsMenuItem = (): MenuItem => ({
    label: 'Cài đặt tài khoản',
    icon: 'ti ti-user-cog',
    subItems: [
        {
            label: 'Thông tin tài khoản',
            link: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.SETTINGS.ROOT,
                PATHS.HOSPITAL.SETTINGS.PROFILE
            ),
        },
        {
            label: 'Bảo mật',
            link: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.SETTINGS.ROOT,
                PATHS.HOSPITAL.SETTINGS.SECURITY
            ),
        },
        {
            label: 'Xác thực 2 yếu tố',
            link: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.SETTINGS.ROOT,
                PATHS.HOSPITAL.SETTINGS.TWO_FACTOR
            ),
        },
    ],
});

/**
 * Create Admin Signature menu item (Admin only)
 */
export const createAdminSignatureMenuItem = (): MenuItem => ({
    label: 'Quản lý chữ ký',
    icon: 'ti ti-writing-sign',
    link: buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.ADMIN_SIGNATURE.ROOT),
});

/**
 * Create Hospital Payouts menu item for admin
 */
export const createHospitalPayoutsMenuItem = (): MenuItem => ({
    label: 'Thanh toán bệnh viện',
    icon: 'ti ti-cash',
    link: buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.HOSPITAL_PAYOUTS.ROOT),
});

/**
 * Create Notifications menu item for different roles
 */
export const createNotificationsMenuItem = (role: 'admin' | 'staff' | 'doctor'): MenuItem => {
    let basePath: string;

    switch (role) {
        case 'admin':
            basePath = buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.NOTIFICATIONS.ROOT);
            break;
        case 'staff':
            basePath = buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.NOTIFICATIONS.ROOT);
            break;
        case 'doctor':
            basePath = buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.NOTIFICATIONS.ROOT);
            break;
    }

    return {
        label: 'Thông báo',
        icon: 'ti ti-bell',
        link: basePath,
    };
};

/**
 * Create Schedules menu item for Hospital Staff
 */
export const createHospitalSchedulesMenuItem = (): MenuItem => ({
    label: 'Quản lý lịch làm việc',
    icon: 'ti ti-calendar-time',
    subItems: [
        {
            label: 'Lịch bác sĩ',
            link: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.SCHEDULES.ROOT,
                PATHS.HOSPITAL.SCHEDULES.DOCTORS
            ),
        },
        {
            label: 'Lịch dịch vụ',
            link: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.SCHEDULES.ROOT,
                PATHS.HOSPITAL.SCHEDULES.SERVICES
            ),
        },
        {
            label: 'Yêu cầu nghỉ/thay đổi',
            link: buildPath(
                PATHS.HOSPITAL.ROOT,
                PATHS.HOSPITAL.SCHEDULES.ROOT,
                PATHS.HOSPITAL.SCHEDULES.EXCEPTIONS
            ),
        },
    ],
});

/**
 * Create Schedules menu item for Doctor
 */
export const createDoctorSchedulesMenuItem = (): MenuItem => ({
    label: 'Lịch làm việc',
    icon: 'ti ti-calendar-user',
    subItems: [
        {
            label: 'Lịch của tôi',
            link: buildPath(
                PATHS.DOCTOR.ROOT,
                PATHS.DOCTOR.SCHEDULE.ROOT,
                PATHS.DOCTOR.SCHEDULE.MY_SCHEDULES
            ),
        },
        {
            label: 'Yêu cầu nghỉ',
            link: buildPath(
                PATHS.DOCTOR.ROOT,
                PATHS.DOCTOR.SCHEDULE.ROOT,
                PATHS.DOCTOR.SCHEDULE.REQUEST_OFF
            ),
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
