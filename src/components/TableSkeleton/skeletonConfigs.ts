import { SkeletonColumn } from './TableSkeleton';

// Common column configurations for reusability
const COMMON_COLUMNS = {
    // Avatar columns with different widths
    avatar: {
        small: { type: 'avatar' as const, width: 100 },
        medium: { type: 'avatar' as const, width: 120 },
        large: { type: 'avatar' as const, width: 130 },
    },

    // Text columns with different sizes
    text: {
        small: { type: 'text' as const, width: 80, height: 16 },
        medium: { type: 'text' as const, width: 100, height: 16 },
        large: { type: 'text' as const, width: 120, height: 16 },
        xlarge: { type: 'text' as const, width: 160, height: 18 },
        xxlarge: { type: 'text' as const, width: 200, height: 20 },
        multiline: { type: 'text' as const, width: 160, height: 18, lines: 2 },
    },

    // Badge columns with different sizes
    badge: {
        small: { type: 'badge' as const, width: 80, height: 24 },
        medium: { type: 'badge' as const, width: 90, height: 24 },
        large: { type: 'badge' as const, width: 100, height: 24 },
    },

    // Action columns with different item counts
    actions: {
        single: { type: 'actions' as const, items: 1 },
        double: { type: 'actions' as const, items: 2 },
        triple: { type: 'actions' as const, items: 3 },
    },

    // Special columns
    special: {
        date: { type: 'date' as const, width: 100 },
        services: { type: 'services' as const },
        languages: { type: 'languages' as const },
    },
} as const;

// Configuration for Appointment Table Skeleton
// Columns: Ngày & giờ | Bệnh nhân | Người đại diện | Bác sĩ / Dịch vụ | Hình thức | Trạng thái | Actions
export const appointmentTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.special.date, // Ngày & giờ
    COMMON_COLUMNS.avatar.medium, // Bệnh nhân
    COMMON_COLUMNS.avatar.medium, // Người đại diện
    COMMON_COLUMNS.avatar.large, // Bác sĩ / Dịch vụ
    COMMON_COLUMNS.text.small, // Hình thức
    COMMON_COLUMNS.badge.medium, // Trạng thái
    COMMON_COLUMNS.actions.single, // Actions
];

// Configuration for Doctor Table Skeleton
// Columns: Tên & học vị | Chuyên khoa | Kinh nghiệm | Dịch vụ & giá | Ngôn ngữ | Trạng thái | Actions
export const doctorTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.avatar.medium, // Tên & học vị
    COMMON_COLUMNS.badge.large, // Chuyên khoa
    COMMON_COLUMNS.badge.small, // Kinh nghiệm
    COMMON_COLUMNS.special.services, // Dịch vụ & giá
    COMMON_COLUMNS.special.languages, // Ngôn ngữ
    COMMON_COLUMNS.badge.medium, // Trạng thái
    COMMON_COLUMNS.actions.double, // Actions
];

// Configuration for Refund Table Skeleton
// Columns: Mã hoàn tiền | Ngày tạo | Số tiền | Lý do | Thông tin ngân hàng | Trạng thái | Actions
export const refundTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.text.medium, // Mã hoàn tiền
    COMMON_COLUMNS.text.large, // Ngày tạo
    { type: 'text', width: 110, height: 24 }, // Số tiền (custom size)
    COMMON_COLUMNS.text.xxlarge, // Lý do
    COMMON_COLUMNS.text.multiline, // Thông tin ngân hàng
    COMMON_COLUMNS.badge.medium, // Trạng thái
    COMMON_COLUMNS.actions.single, // Actions
];

// Configuration for Position Table Skeleton
// Columns: Tên chức vụ | Ngày tạo | Ngày cập nhật | Trạng thái | Actions
export const positionTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.avatar.medium, // Tên chức vụ (with icon)
    COMMON_COLUMNS.text.large, // Ngày tạo
    COMMON_COLUMNS.text.large, // Ngày cập nhật
    COMMON_COLUMNS.badge.medium, // Trạng thái
    COMMON_COLUMNS.actions.single, // Actions
];

// Configuration for Language Table Skeleton
// Columns: Tên ngôn ngữ | Ngày tạo | Ngày cập nhật | Trạng thái | Actions
export const languageTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.avatar.medium, // Tên ngôn ngữ (with flag)
    COMMON_COLUMNS.text.large, // Ngày tạo
    COMMON_COLUMNS.text.large, // Ngày cập nhật
    COMMON_COLUMNS.badge.medium, // Trạng thái
    COMMON_COLUMNS.actions.single, // Actions
];

// Configuration for Payment Methods Table Skeleton
// Columns: STT | Tên | Mô tả | Hình ảnh | Trạng thái | Thao tác
export const paymentMethodTableColumns: SkeletonColumn[] = [
    { type: 'text', width: 50, height: 16 }, // STT
    COMMON_COLUMNS.text.medium, // Tên
    COMMON_COLUMNS.text.large, // Mô tả
    { type: 'avatar', width: 40, height: 40 }, // Hình ảnh
    COMMON_COLUMNS.badge.medium, // Trạng thái
    COMMON_COLUMNS.actions.single, // Thao tác
];

// Export common columns for custom configurations
export { COMMON_COLUMNS };
