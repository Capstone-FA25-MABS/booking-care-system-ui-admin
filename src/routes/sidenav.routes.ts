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
    createHospitalSchedulesMenuItem,
    createDoctorSchedulesMenuItem,
} from './menu.items';
import { Role } from '@/enums/common.enums';

/**
 * Hospital/Staff menu configuration
 * Organized by business logic and UX priority
 */
export const listGroupMenuItemHospital: MenuConfig = [
    {
        title: 'Tổng quan',
        items: [
            createSimpleMenuItem(
                'Bảng điều khiển',
                'ti ti-layout-dashboard',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DASHBOARD)
            ),
            createNotificationsMenuItem('staff'),
            createMessagesMenuItem('staff'),
        ],
    },
    {
        title: 'Lịch khám & Bệnh nhân',
        items: [
            createAppointmentsMenuItem('staff'),
            createHospitalSchedulesMenuItem(),
            createSimpleMenuItem(
                'Quản lý đánh giá',
                'ti ti-star',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.REVIEWS.ROOT)
            ),
        ],
    },
    {
        title: 'Nhân sự & Chuyên môn',
        items: [
            createDoctorsMenuItem(),
            createSimpleMenuItem(
                'Quản lý tài khoản',
                'ti ti-users-group',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DOCTOR_MANAGEMENT.ROOT)
            ),
            createSimpleMenuItem(
                'Quản lý chuyên khoa',
                'ti ti-stethoscope',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SPECIALTIES.ROOT)
            ),
        ],
    },
    {
        title: 'Dịch vụ',
        items: [
            createSimpleMenuItem(
                'Dịch vụ bệnh viện',
                'ti ti-briefcase',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SERVICES.ROOT)
            ),
            createSimpleMenuItem(
                'Loại dịch vụ bác sĩ',
                'ti ti-medical-cross',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.SERVICE_TYPES.ROOT)
            ),
        ],
    },
    {
        title: 'Tài chính',
        items: [
            createSimpleMenuItem(
                'Tài khoản ngân hàng',
                'ti ti-credit-card',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.WALLET.ROOT)
            ),
            createSimpleMenuItem(
                'Hoàn tiền',
                'ti ti-receipt-refund',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.REFUNDS.ROOT)
            ),
            createSimpleMenuItem(
                'Mã giảm giá',
                'ti ti-discount-2',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.DISCOUNTS.ROOT)
            ),
            createHospitalSubscriptionPlansMenuItem(),
        ],
    },
    {
        title: 'Nội dung',
        items: [
            createSimpleMenuItem(
                'Bài viết',
                'ti ti-file-text',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.BLOGS.ROOT)
            ),
            createSimpleMenuItem(
                'Câu hỏi thường gặp',
                'ti ti-help-circle',
                buildPath(PATHS.HOSPITAL.ROOT, PATHS.HOSPITAL.HOSPITAL_FAQS.ROOT)
            ),
        ],
    },
    {
        title: 'Cài đặt',
        items: [createHospitalAccountSettingsMenuItem()],
    },
];

/**
 * Doctor menu configuration
 * Organized by business logic and UX priority
 */
export const listGroupMenuItemDoctor: MenuConfig = [
    {
        title: 'Tổng quan',
        items: [
            createSimpleMenuItem(
                'Bảng điều khiển',
                'ti ti-layout-dashboard',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.DASHBOARD)
            ),
            createNotificationsMenuItem('doctor'),
            createMessagesMenuItem('doctor'),
        ],
    },
    {
        title: 'Công việc',
        items: [
            createAppointmentsMenuItem('doctor'),
            createDoctorSchedulesMenuItem(),
            createSimpleMenuItem(
                'Đánh giá',
                'ti ti-star',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.REVIEWS.ROOT)
            ),
        ],
    },
    {
        title: 'Nội dung',
        items: [
            createSimpleMenuItem(
                'Bài viết',
                'ti ti-file-text',
                buildPath(PATHS.DOCTOR.ROOT, PATHS.DOCTOR.BLOGS.ROOT)
            ),
        ],
    },
    {
        title: 'Cài đặt',
        items: [createDoctorAccountSettingsMenuItem()],
    },
];

/**
 * Admin menu configuration
 * Organized by business logic and UX priority
 */
export const listGroupMenuItemAdmin: MenuConfig = [
    {
        title: 'Tổng quan',
        items: [createDashboardMenuItem(), createNotificationsMenuItem('admin')],
    },
    {
        title: 'Quản lý tài khoản',
        items: [
            {
                label: 'Tài khoản người dùng',
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
        ],
    },
    {
        title: 'Danh mục hệ thống',
        items: [
            createSimpleMenuItem(
                'Chuyên khoa',
                'ti ti-stethoscope',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SPECIALTIES.ROOT)
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
        ],
    },
    {
        title: 'Quản lý dịch vụ',
        items: [
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
                'Loại dịch vụ bác sĩ',
                'ti ti-medical-cross',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.SERVICE_TYPES.ROOT)
            ),
        ],
    },
    {
        title: 'Tài chính',
        items: [
            createSimpleMenuItem(
                'Phương thức thanh toán',
                'ti ti-credit-card',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.PAYMENT_METHODS.ROOT)
            ),
            createHospitalPayoutsMenuItem(),
            createSubscriptionPlansMenuItem(),
        ],
    },
    {
        title: 'Nội dung',
        items: [
            createSimpleMenuItem(
                'Duyệt bài viết',
                'ti ti-checkup-list',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.BLOGS.ROOT)
            ),
            createSimpleMenuItem(
                'Danh mục bài viết',
                'ti ti-folders',
                buildPath(PATHS.ADMIN.ROOT, PATHS.ADMIN.BLOG_CATEGORIES.ROOT)
            ),
        ],
    },
    {
        title: 'Cài đặt',
        items: [createAccountSettingsMenuItem(), createAdminSignatureMenuItem()],
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
            return listGroupMenuItemAdmin;
    }
};
