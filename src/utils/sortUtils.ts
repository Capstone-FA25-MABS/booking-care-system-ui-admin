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
        case 'Ngày tạo (mới nhất)':
            return { sortBy: 'createdat', sortOrder: 'desc' as const };
        case 'Ngày tạo (cũ nhất)':
            return { sortBy: 'createdat', sortOrder: 'asc' as const };
        case 'Ngày sửa (mới nhất)':
            return { sortBy: 'updatedat', sortOrder: 'desc' as const };
        case 'Ngày sửa (cũ nhất)':
            return { sortBy: 'updatedat', sortOrder: 'asc' as const };
        case 'Mới thêm gần đây':
        default:
            return { sortBy: 'createdat', sortOrder: 'desc' as const };
    }
};

/**
 * Common sort options for dropdowns
 */
export const SORT_OPTIONS = [
    { value: 'Mới thêm gần đây', label: 'Mới thêm gần đây' },
    { value: 'Tên A-Z', label: 'Tên A-Z' },
    { value: 'Tên Z-A', label: 'Tên Z-A' },
    { value: 'Ngày tạo (mới nhất)', label: 'Ngày tạo (mới nhất)' },
    { value: 'Ngày tạo (cũ nhất)', label: 'Ngày tạo (cũ nhất)' },
    { value: 'Ngày sửa (mới nhất)', label: 'Ngày sửa (mới nhất)' },
    { value: 'Ngày sửa (cũ nhất)', label: 'Ngày sửa (cũ nhất)' },
];
