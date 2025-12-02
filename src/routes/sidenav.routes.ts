import type { MenuConfig } from '@/types/menu.types';
import { buildPath, PATHS } from './paths';
import {
    createAccountSettingsMenuItem,
    createAdminSignatureMenuItem,
    createHospitalPayoutsMenuItem,
    createAppointmentsMenuItem,
    createDashboardMenuItem,
    createDoctorsMenuItem,
    createDoctorAccountSettingsMenuItem,
    createHospitalAccountSettingsMenuItem,
    createHospitalSubscriptionPlansMenuItem,
    createMessagesMenuItem,
    createNotificationsMenuItem,
    createSimpleMenuItem,
    createSubscriptionPlansMenuItem,
} from './menu.items';
import { Role } from '@/enums/common.enums';

export const listGroupMenuItemHospital: MenuConfig = [
    {
        title: 'Danh mục chính',
        items: [
            createSimpleMenuItem(
                'Bảng điều khiển',
                'ti ti-layout-dashboard',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DASHBOARD)
            ),
            createSimpleMenuItem(
                'Quản lí chuyên khoa',
                'ti ti-stethoscope',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SPECIALTIES.ROOT)
            ),
            createSimpleMenuItem(
                'Quản lý dịch vụ bác sĩ',
                'ti ti-medical-cross',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SERVICE_TYPES.ROOT)
            ),
            createDoctorsMenuItem(),
            createSimpleMenuItem(
                'Quản lý dịch vụ bệnh viện',
                'ti ti-building-hospital',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SERVICE_MEDICALS.ROOT)
            ),
            createSimpleMenuItem(
                'Quản lí dịch vụ y tế',
                'ti ti-briefcase',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SERVICES.ROOT)
            ),
            createAppointmentsMenuItem('staff'),
            createSimpleMenuItem(
                'Quản lý tài khoản',
                'ti ti-users-group',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTOR_MANAGEMENT.ROOT)
            ),
            createHospitalSubscriptionPlansMenuItem(),
            createMessagesMenuItem('staff'),
            createSimpleMenuItem(
                'Hoàn tiền',
                'ti ti-receipt-refund',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.REFUNDS.ROOT)
            ),
            createSimpleMenuItem(
                'Tài khoản ngân hàng',
                'ti ti-credit-card',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.WALLET.ROOT)
            ),
            createNotificationsMenuItem('staff'),
        ],
    },
    {
        title: 'Cài đặt',
        items: [createHospitalAccountSettingsMenuItem()],
    },
];

/**
 * Doctor menu configuration
 */
export const listGroupMenuItemDoctor: MenuConfig = [
    {
        title: 'Danh mục chính',
        items: [
            createSimpleMenuItem(
                'Bảng điều khiển',
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
            createNotificationsMenuItem('doctor'),
        ],
    },
    {
        title: 'Cài đặt',
        items: [createDoctorAccountSettingsMenuItem()],
    },
];

/**
 * Admin menu configuration
 */
export const listGroupMenuItemAdmin: MenuConfig = [
    {
        title: 'Danh mục chính',
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
        title: 'Quản lý',
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
                'Danh mục dịch vụ',
                'ti ti-folder',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SERVICE_CATEGORIES.ROOT)
            ),
            createSimpleMenuItem(
                'Dịch vụ',
                'ti ti-briefcase',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SERVICES.ROOT)
            ),
            createSimpleMenuItem(
                'Phương thức thanh toán',
                'ti ti-credit-card',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.PAYMENT_METHODS.ROOT)
            ),
            createSubscriptionPlansMenuItem(),
            createHospitalPayoutsMenuItem(),
            createAdminSignatureMenuItem(),
            createNotificationsMenuItem('admin'),
        ],
    },
    {
        title: 'Cài đặt',
        items: [createAccountSettingsMenuItem()],
    },
];

/**
 * Get menu items based on user role
 * @param role - User's role (ADMIN, DOCTOR, or STAFF)
 * @returns Menu configuration for the specified role
 */
export const getMenuItemsByRole = (role: Role | null): MenuConfig => {
    switch (role) {
        case Role.ADMIN:
            return listGroupMenuItemAdmin;
        case Role.DOCTOR:
            return listGroupMenuItemDoctor;
        case Role.STAFF:
            return listGroupMenuItemHospital;
        default:
            // Fallback to admin menu if role is not determined
            return listGroupMenuItemAdmin;
    }
};
