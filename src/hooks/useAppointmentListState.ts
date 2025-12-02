import { useState } from 'react';
import { AppointmentType } from '@/enums/appointment.enums';

// ============================================================================
// Types
// ============================================================================

export interface DateRange {
    start: Date | null;
    end: Date | null;
}

export interface DoctorTabCounts {
    [key: string]: number;
    upcoming: number;
    cancelled: number;
    completed: number;
}

export interface HospitalTabCounts {
    [key: string]: number;
    waiting: number;
    upcoming: number;
    cancelled: number;
    completed: number;
}

export interface AppointmentFilterState {
    selectedTypes: AppointmentType[];
    setSelectedTypes: React.Dispatch<React.SetStateAction<AppointmentType[]>>;
    selectedDateRange: DateRange;
    setSelectedDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}

export interface AppointmentPaginationState {
    currentPage: number;
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    itemsPerPage: number;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook for managing appointment filter state
 * Used by both MyAppointments (Doctor) and ListAppointments (Hospital Staff)
 */
export const useAppointmentFilterState = (): AppointmentFilterState => {
    const [selectedTypes, setSelectedTypes] = useState<AppointmentType[]>([]);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
        start: null,
        end: null,
    });

    return {
        selectedTypes,
        setSelectedTypes,
        selectedDateRange,
        setSelectedDateRange,
    };
};

/**
 * Hook for managing appointment pagination state
 * Used by both MyAppointments (Doctor) and ListAppointments (Hospital Staff)
 */
export const useAppointmentPaginationState = (
    pageSize: number = 10
): AppointmentPaginationState => {
    const [currentPage, setCurrentPage] = useState(1);

    return {
        currentPage,
        setCurrentPage,
        itemsPerPage: pageSize,
    };
};

/**
 * Hook for managing doctor appointment tab counts
 */
export const useDoctorTabCounts = () => {
    const [tabCounts, setTabCounts] = useState<DoctorTabCounts>({
        upcoming: 0,
        cancelled: 0,
        completed: 0,
    });

    return { tabCounts, setTabCounts };
};

/**
 * Hook for managing hospital appointment tab counts
 */
export const useHospitalTabCounts = () => {
    const [tabCounts, setTabCounts] = useState<HospitalTabCounts>({
        waiting: 0,
        upcoming: 0,
        cancelled: 0,
        completed: 0,
    });

    return { tabCounts, setTabCounts };
};
