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
// Columns: Ngày & Giờ | Bệnh Nhân | Bác Sĩ | Hình Thức | Trạng Thái | Actions
export const appointmentTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.special.date, // Ngày & Giờ
    COMMON_COLUMNS.avatar.medium, // Bệnh Nhân
    COMMON_COLUMNS.avatar.large, // Bác Sĩ
    COMMON_COLUMNS.text.small, // Hình Thức
    COMMON_COLUMNS.badge.medium, // Trạng Thái
    COMMON_COLUMNS.actions.single, // Actions
];

// Configuration for Doctor Table Skeleton
// Columns: Tên & Học vị | Chuyên khoa | Kinh nghiệm | Dịch vụ & Giá | Ngôn ngữ | Trạng thái | Actions
export const doctorTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.avatar.medium, // Tên & Học vị
    COMMON_COLUMNS.badge.large, // Chuyên khoa
    COMMON_COLUMNS.badge.small, // Kinh nghiệm
    COMMON_COLUMNS.special.services, // Dịch vụ & Giá
    COMMON_COLUMNS.special.languages, // Ngôn ngữ
    COMMON_COLUMNS.badge.medium, // Trạng thái
    COMMON_COLUMNS.actions.double, // Actions
];

// Configuration for Refund Table Skeleton
// Columns: Mã Hoàn Tiền | Ngày Tạo | Số Tiền | Lý Do | Thông Tin Ngân Hàng | Trạng Thái | Actions
export const refundTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.text.medium, // Mã Hoàn Tiền
    COMMON_COLUMNS.text.large, // Ngày Tạo
    { type: 'text', width: 110, height: 24 }, // Số Tiền (custom size)
    COMMON_COLUMNS.text.xxlarge, // Lý Do
    COMMON_COLUMNS.text.multiline, // Thông Tin Ngân Hàng
    COMMON_COLUMNS.badge.medium, // Trạng Thái
    COMMON_COLUMNS.actions.single, // Actions
];

// Configuration for Position Table Skeleton
// Columns: Tên Chức Vụ | Ngày Tạo | Ngày Cập Nhật | Trạng Thái | Actions
export const positionTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.avatar.medium, // Tên Chức Vụ (with icon)
    COMMON_COLUMNS.text.large, // Ngày Tạo
    COMMON_COLUMNS.text.large, // Ngày Cập Nhật
    COMMON_COLUMNS.badge.medium, // Trạng Thái
    COMMON_COLUMNS.actions.single, // Actions
];

// Configuration for Language Table Skeleton
// Columns: Tên Ngôn Ngữ | Ngày Tạo | Ngày Cập Nhật | Trạng Thái | Actions
export const languageTableColumns: SkeletonColumn[] = [
    COMMON_COLUMNS.avatar.medium, // Tên Ngôn Ngữ (with flag)
    COMMON_COLUMNS.text.large, // Ngày Tạo
    COMMON_COLUMNS.text.large, // Ngày Cập Nhật
    COMMON_COLUMNS.badge.medium, // Trạng Thái
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
