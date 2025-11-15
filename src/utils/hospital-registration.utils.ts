/**
 * Utilities for hospital registration management
 */

/**
 * Sort options for hospital registration tables
 */
export const hospitalRegistrationSortOptions = [
    { value: 'CreatedAt_desc', label: 'Mới nhất', direction: 'desc' as const },
    { value: 'CreatedAt_asc', label: 'Cũ nhất', direction: 'asc' as const },
    { value: 'HospitalName_asc', label: 'Tên bệnh viện A-Z', direction: 'asc' as const },
    { value: 'HospitalName_desc', label: 'Tên bệnh viện Z-A', direction: 'desc' as const },
    { value: 'HospitalEmail_asc', label: 'Email bệnh viện A-Z', direction: 'asc' as const },
    { value: 'HospitalEmail_desc', label: 'Email bệnh viện Z-A', direction: 'desc' as const },
];
