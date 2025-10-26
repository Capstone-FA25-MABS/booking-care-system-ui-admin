import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchSpecialties,
    fetchSpecialtyById,
    createSpecialty,
    createSpecialtyWithImage,
    updateSpecialty,
    updateSpecialtyWithImage,
    deleteSpecialty,
    filterSpecialties,
    clearError,
    clearCurrentSpecialty,
    resetSpecialtyState,
} from '@/store/slices/specialtySlice';
import {
    selectSpecialties,
    selectCurrentSpecialty,
    selectSpecialtyPagination,
    selectSpecialtyLoading,
    selectSpecialtyError,
    selectActiveSpecialties,
    selectInactiveSpecialties,
    selectSpecialtiesBySearchTerm,
    selectSpecialtiesByStatus,
    selectSpecialtiesCount,
    selectActiveSpecialtiesCount,
    selectInactiveSpecialtiesCount,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectTotalCount,
    selectHasNextPage,
    selectHasPreviousPage,
} from '@/store/selectors/specialty.selectors';
import { SpecialtyFormData, SpecialtySearchParams } from '@/types/specialty.types';

interface UseSpecialtyReturn {
    // Data
    specialties: ReturnType<typeof selectSpecialties>;
    currentSpecialty: ReturnType<typeof selectCurrentSpecialty>;
    pagination: ReturnType<typeof selectSpecialtyPagination>;

    // Loading and error states
    isLoading: ReturnType<typeof selectSpecialtyLoading>;
    error: ReturnType<typeof selectSpecialtyError>;

    // Computed data
    activeSpecialties: ReturnType<typeof selectActiveSpecialties>;
    inactiveSpecialties: ReturnType<typeof selectInactiveSpecialties>;
    specialtiesCount: ReturnType<typeof selectSpecialtiesCount>;
    activeSpecialtiesCount: ReturnType<typeof selectActiveSpecialtiesCount>;
    inactiveSpecialtiesCount: ReturnType<typeof selectInactiveSpecialtiesCount>;

    // Pagination helpers
    currentPage: ReturnType<typeof selectCurrentPage>;
    pageSize: ReturnType<typeof selectPageSize>;
    totalPages: ReturnType<typeof selectTotalPages>;
    totalCount: ReturnType<typeof selectTotalCount>;
    hasNextPage: ReturnType<typeof selectHasNextPage>;
    hasPreviousPage: ReturnType<typeof selectHasPreviousPage>;

    // Actions
    fetchSpecialties: (
        pageNumber?: number,
        pageSize?: number,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ) => void;
    fetchSpecialtyById: (id: string) => void;
    createSpecialty: (specialtyData: SpecialtyFormData) => Promise<any>;
    createSpecialtyWithImage: (
        specialtyData: SpecialtyFormData & { imageFile: File }
    ) => Promise<any>;
    updateSpecialty: (id: string, specialtyData: SpecialtyFormData) => Promise<any>;
    updateSpecialtyWithImage: (
        id: string,
        specialtyData: SpecialtyFormData & { imageFile: File }
    ) => Promise<any>;
    deleteSpecialty: (id: string) => Promise<any>;
    filterSpecialties: (params: SpecialtySearchParams) => void;
    clearError: () => void;
    clearCurrentSpecialty: () => void;
    resetSpecialtyState: () => void;

    // Helper functions
    getSpecialtiesBySearchTerm: (
        searchTerm: string
    ) => ReturnType<typeof selectSpecialtiesBySearchTerm>;
    getSpecialtiesByStatus: (
        status: 'ACTIVE' | 'INACTIVE'
    ) => ReturnType<typeof selectSpecialtiesByStatus>;
}

export const useSpecialty = (): UseSpecialtyReturn => {
    const dispatch = useAppDispatch();

    // Selectors
    const specialties = useAppSelector(selectSpecialties);
    const currentSpecialty = useAppSelector(selectCurrentSpecialty);
    const pagination = useAppSelector(selectSpecialtyPagination);
    const isLoading = useAppSelector(selectSpecialtyLoading);
    const error = useAppSelector(selectSpecialtyError);
    const activeSpecialties = useAppSelector(selectActiveSpecialties);
    const inactiveSpecialties = useAppSelector(selectInactiveSpecialties);
    const specialtiesCount = useAppSelector(selectSpecialtiesCount);
    const activeSpecialtiesCount = useAppSelector(selectActiveSpecialtiesCount);
    const inactiveSpecialtiesCount = useAppSelector(selectInactiveSpecialtiesCount);
    const currentPage = useAppSelector(selectCurrentPage);
    const pageSize = useAppSelector(selectPageSize);
    const totalPages = useAppSelector(selectTotalPages);
    const totalCount = useAppSelector(selectTotalCount);
    const hasNextPage = useAppSelector(selectHasNextPage);
    const hasPreviousPage = useAppSelector(selectHasPreviousPage);

    // Action creators
    const handleFetchSpecialties = useCallback(
        (pageNumber?: number, pageSize?: number, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
            dispatch(fetchSpecialties({ pageNumber, pageSize, sortBy, sortOrder }));
        },
        [dispatch]
    );

    const handleFetchSpecialtyById = useCallback(
        (id: string) => {
            dispatch(fetchSpecialtyById(id));
        },
        [dispatch]
    );

    const handleCreateSpecialty = useCallback(
        (specialtyData: SpecialtyFormData) => {
            return dispatch(createSpecialty(specialtyData));
        },
        [dispatch]
    );

    const handleCreateSpecialtyWithImage = useCallback(
        (specialtyData: SpecialtyFormData & { imageFile: File }) => {
            return dispatch(createSpecialtyWithImage(specialtyData));
        },
        [dispatch]
    );

    const handleUpdateSpecialty = useCallback(
        (id: string, specialtyData: SpecialtyFormData) => {
            return dispatch(updateSpecialty({ id, specialtyData }));
        },
        [dispatch]
    );

    const handleUpdateSpecialtyWithImage = useCallback(
        (id: string, specialtyData: SpecialtyFormData & { imageFile: File }) => {
            return dispatch(updateSpecialtyWithImage({ id, specialtyData }));
        },
        [dispatch]
    );

    const handleDeleteSpecialty = useCallback(
        (id: string) => {
            return dispatch(deleteSpecialty(id));
        },
        [dispatch]
    );

    const handleFilterSpecialties = useCallback(
        (params: SpecialtySearchParams) => {
            dispatch(filterSpecialties(params));
        },
        [dispatch]
    );

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearCurrentSpecialty = useCallback(() => {
        dispatch(clearCurrentSpecialty());
    }, [dispatch]);

    const handleResetSpecialtyState = useCallback(() => {
        dispatch(resetSpecialtyState());
    }, [dispatch]);

    // Helper functions
    const getSpecialtiesBySearchTerm = useCallback(
        (searchTerm: string) => {
            if (!specialties) return [];
            if (!searchTerm.trim()) return specialties;

            const term = searchTerm.toLowerCase();
            return specialties.filter(
                (specialty) =>
                    specialty.name.toLowerCase().includes(term) ||
                    specialty.id.toLowerCase().includes(term)
            );
        },
        [specialties]
    );

    const getSpecialtiesByStatus = useCallback(
        (status: 'ACTIVE' | 'INACTIVE') => {
            return specialties?.filter((specialty) => specialty.status === status) || [];
        },
        [specialties]
    );

    return {
        // Data
        specialties,
        currentSpecialty,
        pagination,

        // Loading and error states
        isLoading,
        error,

        // Computed data
        activeSpecialties,
        inactiveSpecialties,
        specialtiesCount,
        activeSpecialtiesCount,
        inactiveSpecialtiesCount,

        // Pagination helpers
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,

        // Actions
        fetchSpecialties: handleFetchSpecialties,
        fetchSpecialtyById: handleFetchSpecialtyById,
        createSpecialty: handleCreateSpecialty,
        createSpecialtyWithImage: handleCreateSpecialtyWithImage,
        updateSpecialty: handleUpdateSpecialty,
        updateSpecialtyWithImage: handleUpdateSpecialtyWithImage,
        deleteSpecialty: handleDeleteSpecialty,
        filterSpecialties: handleFilterSpecialties,
        clearError: handleClearError,
        clearCurrentSpecialty: handleClearCurrentSpecialty,
        resetSpecialtyState: handleResetSpecialtyState,

        // Helper functions
        getSpecialtiesBySearchTerm,
        getSpecialtiesByStatus,
    };
};

export default useSpecialty;
