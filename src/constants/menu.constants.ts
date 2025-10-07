import { buildPath, PATHS } from '@/routes/paths';

/**
 * Shared menu item configurations to avoid duplication
 */

export const DOCTORS_MENU_CONFIG = {
    label: 'Bác sĩ',
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
};

export const APPOINTMENTS_MENU_CONFIG = {
    label: 'Lịch hẹn',
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

export const DASHBOARD_MENU_CONFIG = {
    label: 'Dashboard',
    icon: 'ti ti-layout-dashboard',
    subItems: [
        { label: 'Admin Dashboard', link: '/admin/dashboard' },
        { label: 'Doctor Dashboard', link: '/doctor/dashboard' },
        { label: 'Patient Dashboard', link: '/patient/dashboard' },
    ],
};
