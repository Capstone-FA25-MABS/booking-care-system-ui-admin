/**
 * Utility functions for sorting parameters
 */

export interface SortParams {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

/**
 * Maps frontend sort options to backend parameters
 */
export const getSortParams = (sortOption: string): SortParams => {
    switch (sortOption) {
        case 'Tên A-Z':
            return { sortBy: 'name', sortOrder: 'asc' as const };
        case 'Tên Z-A':
            return { sortBy: 'name', sortOrder: 'desc' as const };
        case 'Ngày Tạo (Mới Nhất)':
            return { sortBy: 'createdat', sortOrder: 'desc' as const };
        case 'Ngày Tạo (Cũ Nhất)':
            return { sortBy: 'createdat', sortOrder: 'asc' as const };
        case 'Ngày Sửa (Mới Nhất)':
            return { sortBy: 'updatedat', sortOrder: 'desc' as const };
        case 'Ngày Sửa (Cũ Nhất)':
            return { sortBy: 'updatedat', sortOrder: 'asc' as const };
        case 'Mới Thêm Gần Đây':
        default:
            return { sortBy: 'createdat', sortOrder: 'desc' as const };
    }
};

/**
 * Common sort options for dropdowns
 */
export const SORT_OPTIONS = [
    { value: 'Mới Thêm Gần Đây', label: 'Mới Thêm Gần Đây' },
    { value: 'Tên A-Z', label: 'Tên A-Z' },
    { value: 'Tên Z-A', label: 'Tên Z-A' },
    { value: 'Ngày Tạo (Mới Nhất)', label: 'Ngày Tạo (Mới Nhất)' },
    { value: 'Ngày Tạo (Cũ Nhất)', label: 'Ngày Tạo (Cũ Nhất)' },
    { value: 'Ngày Sửa (Mới Nhất)', label: 'Ngày Sửa (Mới Nhất)' },
    { value: 'Ngày Sửa (Cũ Nhất)', label: 'Ngày Sửa (Cũ Nhất)' },
];
