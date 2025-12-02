import { useCallback, useMemo } from 'react';
import { AppointmentCardData } from '@/types/appointment.types';

/**
 * Shared appointment search/filter utilities
 * Used by both MyAppointments (Doctor) and ListAppointments (Hospital Staff)
 */

// ============================================================================
// Types
// ============================================================================

export interface AppointmentSearchConfig {
    /** Include doctor info in search (for hospital staff view) */
    includeDoctorSearch?: boolean;
    /** Include service info in search (for hospital staff view) */
    includeServiceSearch?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse sort parameter from format "Field_order" to { sortBy, sortDescending }
 */
export const parseSortParam = (sortValue: string): { sortBy: string; sortDescending: boolean } => {
    const [field, order] = sortValue.split('_');
    return {
        sortBy: field,
        sortDescending: order === 'desc',
    };
};

/**
 * Format date to local YYYY-MM-DD (avoid timezone issues)
 */
export const formatLocalDate = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Filter appointments by search term
 * Searches in patient info, relative info, appointment ID, and symptoms
 * Optionally includes doctor and service info for hospital staff view
 */
export const filterAppointmentsBySearch = (
    appointmentList: AppointmentCardData[],
    search: string,
    config: AppointmentSearchConfig = {}
): AppointmentCardData[] => {
    if (!search.trim()) return appointmentList;

    const { includeDoctorSearch = false, includeServiceSearch = false } = config;
    const searchLower = search.toLowerCase().trim();

    return appointmentList.filter((apt) => {
        // Search in patient info (firstName + lastName)
        const patientFirstName = apt.patientInfo?.firstName?.toLowerCase() || '';
        const patientLastName = apt.patientInfo?.lastName?.toLowerCase() || '';
        const patientFullName = `${patientFirstName} ${patientLastName}`.trim();
        const patientPhone = apt.patientInfo?.phone?.toLowerCase() || '';
        const patientEmail = apt.patientInfo?.email?.toLowerCase() || '';

        // Search in relative info (if booking for family member)
        const relativeFirstName = apt.relativeInfo?.firstName?.toLowerCase() || '';
        const relativeLastName = apt.relativeInfo?.lastName?.toLowerCase() || '';
        const relativeFullName =
            apt.relativeInfo?.fullName?.toLowerCase() ||
            `${relativeFirstName} ${relativeLastName}`.trim();
        const relativePhone = apt.relativeInfo?.phone?.toLowerCase() || '';

        // Search in appointment ID
        const appointmentId = apt.appointmentId?.toLowerCase() || '';

        // Search in symptoms
        const symptoms = apt.symptoms?.toLowerCase() || '';

        // Base search criteria
        let matches =
            patientFullName.includes(searchLower) ||
            patientPhone.includes(searchLower) ||
            patientEmail.includes(searchLower) ||
            relativeFullName.includes(searchLower) ||
            relativePhone.includes(searchLower) ||
            appointmentId.includes(searchLower) ||
            symptoms.includes(searchLower);

        // Optional: Search in doctor info (for hospital staff)
        if (includeDoctorSearch && !matches) {
            const doctorFirstName = apt.doctorInfo?.firstName?.toLowerCase() || '';
            const doctorLastName = apt.doctorInfo?.lastName?.toLowerCase() || '';
            const doctorFullName =
                apt.doctorInfo?.fullName?.toLowerCase() ||
                `${doctorFirstName} ${doctorLastName}`.trim();
            const specialtyName = apt.doctorInfo?.specialtyName?.toLowerCase() || '';

            matches = doctorFullName.includes(searchLower) || specialtyName.includes(searchLower);
        }

        // Optional: Search in service info (for hospital staff)
        if (includeServiceSearch && !matches) {
            const serviceName = apt.serviceInfo?.name?.toLowerCase() || '';
            matches = serviceName.includes(searchLower);
        }

        return matches;
    });
};

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook for filtering appointments by search term
 * Returns memoized filter function and filtered appointments
 */
export const useAppointmentSearch = (
    allAppointments: AppointmentCardData[],
    debouncedSearchTerm: string,
    config: AppointmentSearchConfig = {}
) => {
    const filterFn = useCallback(
        (appointmentList: AppointmentCardData[], search: string): AppointmentCardData[] => {
            return filterAppointmentsBySearch(appointmentList, search, config);
        },
        [config.includeDoctorSearch, config.includeServiceSearch]
    );

    const filteredAppointments = useMemo(() => {
        return filterFn(allAppointments, debouncedSearchTerm);
    }, [allAppointments, debouncedSearchTerm, filterFn]);

    return {
        filterAppointmentsBySearch: filterFn,
        filteredAppointments,
    };
};
