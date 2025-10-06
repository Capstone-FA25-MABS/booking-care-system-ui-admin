import { buildPath, PATHS } from './paths';
import type { MenuConfig } from '@/types/menu.types';
import {
    createAccountSettingsMenuItem,
    createAppointmentsMenuItem,
    createDoctorsMenuItem,
    createMessagesMenuItem,
    createSimpleMenuItem,
} from './menu.items';

export const listGroupMenuItemHospital: Array<{
    title: string;
    items: Array<{
        label: string;
        link?: string;
        icon: string;
        subItems?: Array<{ label: string; link: string }>;
    }>;
}> = [
    {
        title: 'Hospital',
        items: [
            {
                label: 'Bác sĩ',
                icon: 'ti ti-user-plus',
                subItems: [
                    {
                        label: 'Danh sách bác sĩ',
                        link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTORS.ROOT),
                    },
                    // { label: 'Doctor Details', link: buildPath(PATHS.CLINIC.ROOT, PATHS.CLINIC.DOCTORS.DETAILS) },
                    {
                        label: 'Thêm bác sĩ',
                        link: buildPath(
                            PATHS.HOSPITAL.ROOT,
                            PATHS.HOSPITAL.DOCTORS.ROOT,
                            PATHS.HOSPITAL.DOCTORS.ADD
                        ),
                    },
                    // { label: 'Doctor Schedule', link: buildPath(PATHS.CLINIC.ROOT, PATHS.CLINIC.DOCTORS.SCHEDULE) },
                ],
            },
            {
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
            },
            {
                label: 'Locations',
                icon: 'ti ti-map-pin',
                link: '/hospital/locations',
            },
            {
                label: 'Services',
                icon: 'ti ti-user-cog',
                link: '/hospital/services',
            },
            {
                label: 'Specializations',
                icon: 'ti ti-user-shield',
                link: '/hospital/specializations',
            },
            {
                label: 'Assets',
                icon: 'ti ti-asset',
                link: '/hospital/assets',
            },
            {
                label: 'Activities',
                icon: 'ti ti-activity',
                link: '/hospital/activities',
            },
            {
                label: 'Messages',
                icon: 'ti ti-messages',
                link: buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.MESSAGES),
            },
            createDoctorsMenuItem(),
            createAppointmentsMenuItem('staff'),
            createSimpleMenuItem('Locations', 'ti ti-map-pin', '/hospital/locations'),
            createSimpleMenuItem('Services', 'ti ti-user-cog', '/hospital/services'),
            createSimpleMenuItem(
                'Specializations',
                'ti ti-user-shield',
                '/hospital/specializations'
            ),
            createSimpleMenuItem('Assets', 'ti ti-asset', '/hospital/assets'),
            createSimpleMenuItem('Activities', 'ti ti-activity', '/hospital/activities'),
            createMessagesMenuItem('staff'),
        ],
    },
    {
        title: 'Settings',
        items: [createAccountSettingsMenuItem()],
    },
];

/**
 * Doctor menu configuration
 */
export const listGroupMenuItemDoctor: MenuConfig = [
    {
        title: 'Main Menu',
        items: [
            createSimpleMenuItem(
                'Dashboard',
                'ti ti-layout-dashboard',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.DASHBOARD)
            ),
            createAppointmentsMenuItem('doctor'),
            createSimpleMenuItem(
                'Schedule',
                'ti ti-calendar-time',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.SCHEDULE)
            ),
            createSimpleMenuItem(
                'Patients',
                'ti ti-user-heart',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.PATIENTS)
            ),
            createMessagesMenuItem('doctor'),
        ],
    },
    {
        title: 'Settings',
        items: [createAccountSettingsMenuItem()],
    },
];

/**
 * Admin menu configuration
 */
export const listGroupMenuItemAdmin: MenuConfig = [
    {
        title: 'Main Menu',
        items: [
            {
                label: 'Dashboard',
                icon: 'ti ti-layout-dashboard',
                subItems: [
                    { label: 'Admin Dashboard', link: '/admin/dashboard' },
                    { label: 'Doctor Dashboard', link: '/doctor/dashboard' },
                    { label: 'Patient Dashboard', link: '/patient/dashboard' },
                ],
            },
            {
                label: 'Applications',
                icon: 'ti ti-apps',
                subItems: [
                    { label: 'Chat', link: '/apps/chat' },
                    { label: 'Email', link: '/apps/email' },
                    { label: 'Calendar', link: '/apps/calendar' },
                    { label: 'Contacts', link: '/apps/contacts' },
                    { label: 'Invoices', link: '/apps/invoices' },
                ],
            },
        ],
    },
    {
        title: 'Settings',
        items: [createAccountSettingsMenuItem()],
    },
];
