import type { MenuConfig } from '@/types/menu.types';
import { buildPath, PATHS } from './paths';
import {
    createAccountSettingsMenuItem,
    createAppointmentsMenuItem,
    createDashboardMenuItem,
    createDoctorsMenuItem,
    createMessagesMenuItem,
    createSimpleMenuItem,
    createSubscriptionPlansMenuItem,
} from './menu.items';

export const listGroupMenuItemHospital: MenuConfig = [
    {
        title: 'Hospital',
        items: [
            createDoctorsMenuItem(),
            createSimpleMenuItem(
                'Quản lý tài khoản',
                'ti ti-users-group',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTOR_MANAGEMENT.ROOT)
            ),
            createAppointmentsMenuItem('staff'),
            createSimpleMenuItem(
                'Hoàn tiền',
                'ti ti-receipt-refund',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.REFUNDS.ROOT)
            ),
            createSimpleMenuItem('Locations', 'ti ti-map-pin', '/hospital/locations'),
            createSimpleMenuItem('Services', 'ti ti-user-cog', '/hospital/services'),
            createSimpleMenuItem(
                'Specializations',
                'ti ti-user-shield',
                '/hospital/specializations'
            ),
            createSimpleMenuItem('Assets', 'ti ti-asset', '/hospital/assets'),
            createSimpleMenuItem('Activities', 'ti ti-activity', '/hospital/activities'),
            createSimpleMenuItem(
                'Gói dịch vụ',
                'ti ti-package',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SUBSCRIPTION_PLAN)
            ),
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
            createDashboardMenuItem(),
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
        title: 'Management',
        items: [
            {
                label: 'Quản lý tài khoản',
                icon: 'ti ti-users',
                subItems: [
                    {
                        label: 'Bệnh nhân',
                        link:
                            buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.ACCOUNT_MANAGEMENT.ROOT) +
                            '?role=Patient',
                    },
                    {
                        label: 'Bác sĩ',
                        link:
                            buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.ACCOUNT_MANAGEMENT.ROOT) +
                            '?role=Doctor',
                    },
                    {
                        label: 'Bệnh viện',
                        link:
                            buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.ACCOUNT_MANAGEMENT.ROOT) +
                            '?role=Staff',
                    },
                ],
            },
            createSimpleMenuItem(
                'Đăng ký bệnh viện',
                'ti ti-building-hospital',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.HOSPITAL_REGISTRATIONS.ROOT)
            ),
            createSimpleMenuItem(
                'Học vị',
                'ti ti-certificate',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.POSITIONS.ROOT)
            ),
            createSimpleMenuItem(
                'Ngôn ngữ',
                'ti ti-language',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.LANGUAGES.ROOT)
            ),
            createSimpleMenuItem(
                'Chuyên khoa',
                'ti ti-stethoscope',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SPECIALTIES.ROOT)
            ),
            createSimpleMenuItem(
                'Loại dịch vụ cho bác sĩ',
                'ti ti-medical-cross',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SERVICE_TYPES.ROOT)
            ),
            createSimpleMenuItem(
                'Phương thức thanh toán',
                'ti ti-credit-card',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.PAYMENT_METHODS.ROOT)
            ),
            createSubscriptionPlansMenuItem(),
        ],
    },
    {
        title: 'Settings',
        items: [createAccountSettingsMenuItem()],
    },
];
