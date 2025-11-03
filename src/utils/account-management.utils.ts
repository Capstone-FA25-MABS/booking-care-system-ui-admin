/**
 * Shared utilities for account management features
 * Used by AccountManagement and DoctorManagement components
 */

/**
 * Sort options for account management tables
 */
export const sortOptions = [
    { value: 'CreatedAt_desc', label: 'Mới nhất', direction: 'desc' as const },
    { value: 'CreatedAt_asc', label: 'Cũ nhất', direction: 'asc' as const },
    { value: 'FullName_asc', label: 'Tên A-Z', direction: 'asc' as const },
    { value: 'FullName_desc', label: 'Tên Z-A', direction: 'desc' as const },
    { value: 'Email_asc', label: 'Email A-Z', direction: 'asc' as const },
    { value: 'Email_desc', label: 'Email Z-A', direction: 'desc' as const },
];

/**
 * Get title for toggle active/inactive button
 * @param isLocked - Whether the account is locked
 * @param status - Current status of the account (ACTIVE/INACTIVE)
 * @returns Title text for the toggle button
 */
export const getToggleActiveTitle = (isLocked: boolean, status: string): string => {
    if (isLocked) {
        return 'Không thể thay đổi trạng thái khi tài khoản đang bị khóa';
    }
    return status === 'ACTIVE'
        ? 'Bật (Hoạt động) - Click để tắt'
        : 'Tắt (Không hoạt động) - Click để bật';
};

/**
 * Get title for lock button
 * @returns Title text for lock button
 */
export const getLockTitle = (): string => 'Đang mở - Click để khóa tài khoản';

/**
 * Get title for unlock button
 * @returns Title text for unlock button
 */
export const getUnlockTitle = (): string => 'Đang khóa - Click để mở khóa';

/**
 * Get status badge CSS class based on status
 * @param status - Account status (ACTIVE/INACTIVE)
 * @returns CSS class for badge
 */
export const getStatusBadgeClass = (status: string): string => {
    return status === 'ACTIVE'
        ? 'badge badge-soft-success border border-success'
        : 'badge badge-soft-danger border border-danger';
};

/**
 * Get status label in Vietnamese
 * @param status - Account status (ACTIVE/INACTIVE)
 * @returns Vietnamese label for status
 */
export const getStatusLabel = (status: string): string => {
    return status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động';
};
