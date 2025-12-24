import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store';
import { fetchFilterOptions } from '@/store/slices/doctorSlice';
import {
    selectSpecialties,
    selectPositions,
    selectServiceTypes,
    selectLanguages,
    selectIsFilterOptionsLoading,
    selectFilterOptionsError,
} from '@/store/selectors/doctor.selectors';

interface FilterOption {
    id: string;
    name: string;
    imageUrl?: string;
    doctorCount?: number;
}

interface UseFilterOptionsState {
    specialties: FilterOption[];
    positions: FilterOption[];
    serviceTypes: FilterOption[];
    languages: FilterOption[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export const useDoctorFilterOptions = (): UseFilterOptionsState => {
    const dispatch = useDispatch<AppDispatch>();

    // Selectors
    const specialties = useSelector(selectSpecialties);
    const positions = useSelector(selectPositions);
    const serviceTypes = useSelector(selectServiceTypes);
    const languages = useSelector(selectLanguages);
    const isLoading = useSelector(selectIsFilterOptionsLoading);
    const error = useSelector(selectFilterOptionsError);

    // Actions
    const refetch = () => {
        dispatch(fetchFilterOptions());
    };

    // Auto-fetch on mount
    useEffect(() => {
        // Only fetch if we don't have data yet
        if (
            specialties.length === 0 &&
            positions.length === 0 &&
            serviceTypes.length === 0 &&
            languages.length === 0
        ) {
            dispatch(fetchFilterOptions());
        }
    }, [specialties.length, positions.length, serviceTypes.length, languages.length]); // Removed dispatch from dependencies

    return {
        specialties,
        positions,
        serviceTypes,
        languages,
        isLoading,
        error,
        refetch,
    };
};
