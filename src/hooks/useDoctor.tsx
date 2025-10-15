import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import { AppDispatch } from '@/store';
import {
    fetchDoctorsByHospital,
    filterDoctors,
    fetchFilterOptions,
    clearError,
    clearFilterOptionsError,
    setCurrentDoctor,
    clearCurrentDoctor,
    resetDoctorState,
} from '@/store/slices/doctorSlice';
import {
    selectDoctors,
    selectCurrentDoctor,
    selectDoctorPagination,
    selectIsDoctorLoading,
    selectIsFilterOptionsLoading,
    selectDoctorError,
    selectFilterOptionsError,
    selectSpecialties,
    selectPositions,
    selectServiceTypes,
    selectLanguages,
    selectSpecialtiesOptions,
    selectPositionsOptions,
    selectServiceTypesOptions,
    selectLanguagesOptions,
    selectDoctorsCount,
    selectTotalDoctorsCount,
    selectHasDoctors,
    selectHasMorePages,
    selectIsFirstPage,
    selectIsLastPage,
    selectActiveDoctors,
    selectInactiveDoctors,
    selectIsAnyLoading,
    selectHasAnyError,
    selectCombinedErrorMessage,
} from '@/store/selectors/doctor.selectors';
import { DoctorSearchParams } from '@/types/doctor.types';

interface UseDoctorReturn {
    // Data
    doctors: ReturnType<typeof selectDoctors>;
    currentDoctor: ReturnType<typeof selectCurrentDoctor>;
    pagination: ReturnType<typeof selectDoctorPagination>;

    // Filter options
    specialties: ReturnType<typeof selectSpecialties>;
    positions: ReturnType<typeof selectPositions>;
    serviceTypes: ReturnType<typeof selectServiceTypes>;
    languages: ReturnType<typeof selectLanguages>;

    // Filter options as dropdown options
    specialtiesOptions: ReturnType<typeof selectSpecialtiesOptions>;
    positionsOptions: ReturnType<typeof selectPositionsOptions>;
    serviceTypesOptions: ReturnType<typeof selectServiceTypesOptions>;
    languagesOptions: ReturnType<typeof selectLanguagesOptions>;

    // Loading states
    isLoading: ReturnType<typeof selectIsDoctorLoading>;
    isFilterOptionsLoading: ReturnType<typeof selectIsFilterOptionsLoading>;
    isAnyLoading: ReturnType<typeof selectIsAnyLoading>;

    // Error states
    error: ReturnType<typeof selectDoctorError>;
    filterOptionsError: ReturnType<typeof selectFilterOptionsError>;
    hasAnyError: ReturnType<typeof selectHasAnyError>;
    combinedErrorMessage: ReturnType<typeof selectCombinedErrorMessage>;

    // Computed values
    doctorsCount: ReturnType<typeof selectDoctorsCount>;
    totalDoctorsCount: ReturnType<typeof selectTotalDoctorsCount>;
    hasDoctors: ReturnType<typeof selectHasDoctors>;
    hasMorePages: ReturnType<typeof selectHasMorePages>;
    isFirstPage: ReturnType<typeof selectIsFirstPage>;
    isLastPage: ReturnType<typeof selectIsLastPage>;
    activeDoctors: ReturnType<typeof selectActiveDoctors>;
    inactiveDoctors: ReturnType<typeof selectInactiveDoctors>;

    // Actions
    fetchDoctorsByHospital: (hospitalId: string, pageNumber?: number, pageSize?: number) => void;
    filterDoctors: (params: DoctorSearchParams) => void;
    fetchFilterOptions: () => void;
    clearError: () => void;
    clearFilterOptionsError: () => void;
    setCurrentDoctor: (doctor: any) => void;
    clearCurrentDoctor: () => void;
    resetDoctorState: () => void;
}

export const useDoctor = (): UseDoctorReturn => {
    const dispatch = useDispatch<AppDispatch>();

    // Selectors - Data
    const doctors = useSelector(selectDoctors);
    const currentDoctor = useSelector(selectCurrentDoctor);
    const pagination = useSelector(selectDoctorPagination);

    // Selectors - Filter options
    const specialties = useSelector(selectSpecialties);
    const positions = useSelector(selectPositions);
    const serviceTypes = useSelector(selectServiceTypes);
    const languages = useSelector(selectLanguages);

    // Selectors - Filter options as dropdown options
    const specialtiesOptions = useSelector(selectSpecialtiesOptions);
    const positionsOptions = useSelector(selectPositionsOptions);
    const serviceTypesOptions = useSelector(selectServiceTypesOptions);
    const languagesOptions = useSelector(selectLanguagesOptions);

    // Selectors - Loading states
    const isLoading = useSelector(selectIsDoctorLoading);
    const isFilterOptionsLoading = useSelector(selectIsFilterOptionsLoading);
    const isAnyLoading = useSelector(selectIsAnyLoading);

    // Selectors - Error states
    const error = useSelector(selectDoctorError);
    const filterOptionsError = useSelector(selectFilterOptionsError);
    const hasAnyError = useSelector(selectHasAnyError);
    const combinedErrorMessage = useSelector(selectCombinedErrorMessage);

    // Selectors - Computed values
    const doctorsCount = useSelector(selectDoctorsCount);
    const totalDoctorsCount = useSelector(selectTotalDoctorsCount);
    const hasDoctors = useSelector(selectHasDoctors);
    const hasMorePages = useSelector(selectHasMorePages);
    const isFirstPage = useSelector(selectIsFirstPage);
    const isLastPage = useSelector(selectIsLastPage);
    const activeDoctors = useSelector(selectActiveDoctors);
    const inactiveDoctors = useSelector(selectInactiveDoctors);

    // Actions - using useCallback to prevent unnecessary re-renders
    const handleFetchDoctorsByHospital = useCallback(
        (hospitalId: string, pageNumber: number = 1, pageSize: number = 10) => {
            dispatch(fetchDoctorsByHospital({ hospitalId, pageNumber, pageSize }));
        },
        [dispatch]
    );

    const handleFilterDoctors = useCallback(
        (params: DoctorSearchParams) => {
            dispatch(filterDoctors(params));
        },
        [dispatch]
    );

    const handleFetchFilterOptions = useCallback(() => {
        dispatch(fetchFilterOptions());
    }, [dispatch]);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearFilterOptionsError = useCallback(() => {
        dispatch(clearFilterOptionsError());
    }, [dispatch]);

    const handleSetCurrentDoctor = useCallback(
        (doctor: any) => {
            dispatch(setCurrentDoctor(doctor));
        },
        [dispatch]
    );

    const handleClearCurrentDoctor = useCallback(() => {
        dispatch(clearCurrentDoctor());
    }, [dispatch]);

    const handleResetDoctorState = useCallback(() => {
        dispatch(resetDoctorState());
    }, [dispatch]);

    return {
        // Data
        doctors,
        currentDoctor,
        pagination,

        // Filter options
        specialties,
        positions,
        serviceTypes,
        languages,

        // Filter options as dropdown options
        specialtiesOptions,
        positionsOptions,
        serviceTypesOptions,
        languagesOptions,

        // Loading states
        isLoading,
        isFilterOptionsLoading,
        isAnyLoading,

        // Error states
        error,
        filterOptionsError,
        hasAnyError,
        combinedErrorMessage,

        // Computed values
        doctorsCount,
        totalDoctorsCount,
        hasDoctors,
        hasMorePages,
        isFirstPage,
        isLastPage,
        activeDoctors,
        inactiveDoctors,

        // Actions
        fetchDoctorsByHospital: handleFetchDoctorsByHospital,
        filterDoctors: handleFilterDoctors,
        fetchFilterOptions: handleFetchFilterOptions,
        clearError: handleClearError,
        clearFilterOptionsError: handleClearFilterOptionsError,
        setCurrentDoctor: handleSetCurrentDoctor,
        clearCurrentDoctor: handleClearCurrentDoctor,
        resetDoctorState: handleResetDoctorState,
    };
};
