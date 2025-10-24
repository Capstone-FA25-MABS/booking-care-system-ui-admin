import { useCallback } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { RootState } from '@/store';
import {
    fetchServiceTypes,
    fetchServiceTypeById,
    createServiceType,
    updateServiceType,
    deleteServiceType,
    toggleServiceTypeStatus,
    fetchActiveServiceTypes,
    fetchActiveServiceTypesSimple,
    filterServiceTypes,
    clearError,
    setCurrentServiceType,
    clearCurrentServiceType,
    resetServiceTypeState,
} from '@/store/slices/serviceTypeSlice';
import {
    ServiceType,
    ServiceTypeFormData,
    ServiceTypeSearchParams,
} from '@/types/serviceType.types';

// Base selectors
const selectServiceTypes = (state: RootState) => state.serviceType.serviceTypes;
const selectCurrentServiceType = (state: RootState) => state.serviceType.currentServiceType;
const selectServiceTypePagination = (state: RootState) => state.serviceType.pagination;
const selectServiceTypeLoading = (state: RootState) => state.serviceType.isLoading;
const selectServiceTypeError = (state: RootState) => state.serviceType.error;

// Memoized selectors for filtering
const selectActiveServiceTypes = createSelector([selectServiceTypes], (serviceTypes) =>
    serviceTypes.filter((st: ServiceType) => st.status === 'ACTIVE')
);

const selectInactiveServiceTypes = createSelector([selectServiceTypes], (serviceTypes) =>
    serviceTypes.filter((st: ServiceType) => st.status === 'INACTIVE')
);

// Memoized count selectors
const selectServiceTypesCount = createSelector(
    [selectServiceTypes],
    (serviceTypes) => serviceTypes.length
);

const selectActiveServiceTypesCount = createSelector(
    [selectActiveServiceTypes],
    (activeServiceTypes) => activeServiceTypes.length
);

const selectInactiveServiceTypesCount = createSelector(
    [selectInactiveServiceTypes],
    (inactiveServiceTypes) => inactiveServiceTypes.length
);

// Pagination selectors
const selectCurrentPage = (state: RootState) => state.serviceType.pagination.pageNumber;
const selectPageSize = (state: RootState) => state.serviceType.pagination.pageSize;
const selectTotalPages = (state: RootState) => state.serviceType.pagination.totalPages;
const selectTotalCount = (state: RootState) => state.serviceType.pagination.totalCount;
const selectHasNextPage = (state: RootState) =>
    state.serviceType.pagination.pageNumber < state.serviceType.pagination.totalPages;
const selectHasPreviousPage = (state: RootState) => state.serviceType.pagination.pageNumber > 1;

export interface UseServiceTypeReturn {
    // State
    serviceTypes: ServiceType[];
    currentServiceType: ServiceType | null;
    pagination: {
        pageNumber: number;
        pageSize: number;
        totalPages: number;
        totalCount: number;
    };
    isLoading: boolean;
    error: string | null;

    // Filtered data
    activeServiceTypes: ServiceType[];
    inactiveServiceTypes: ServiceType[];

    // Counts
    serviceTypesCount: number;
    activeServiceTypesCount: number;
    inactiveServiceTypesCount: number;

    // Pagination
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;

    // Actions
    fetchServiceTypes: (params?: ServiceTypeSearchParams) => void;
    fetchServiceTypeById: (id: string) => void;
    createServiceType: (data: ServiceTypeFormData) => Promise<any>;
    updateServiceType: (id: string, data: ServiceTypeFormData) => Promise<any>;
    deleteServiceType: (id: string) => Promise<any>;
    toggleServiceTypeStatus: (id: string) => Promise<any>;
    fetchActiveServiceTypes: () => void;
    fetchActiveServiceTypesSimple: () => void;
    filterServiceTypes: (params: ServiceTypeSearchParams) => void;
    clearError: () => void;
    setCurrentServiceType: (serviceType: ServiceType | null) => void;
    clearCurrentServiceType: () => void;
    resetServiceTypeState: () => void;

    // Selectors
    getServiceTypesByStatus: (status: 'ACTIVE' | 'INACTIVE') => ServiceType[];
}

export const useServiceType = (): UseServiceTypeReturn => {
    const dispatch = useAppDispatch();

    // Selectors
    const serviceTypes = useAppSelector(selectServiceTypes);
    const currentServiceType = useAppSelector(selectCurrentServiceType);
    const pagination = useAppSelector(selectServiceTypePagination);
    const isLoading = useAppSelector(selectServiceTypeLoading);
    const error = useAppSelector(selectServiceTypeError);
    const activeServiceTypes = useAppSelector(selectActiveServiceTypes);
    const inactiveServiceTypes = useAppSelector(selectInactiveServiceTypes);
    const serviceTypesCount = useAppSelector(selectServiceTypesCount);
    const activeServiceTypesCount = useAppSelector(selectActiveServiceTypesCount);
    const inactiveServiceTypesCount = useAppSelector(selectInactiveServiceTypesCount);
    const currentPage = useAppSelector(selectCurrentPage);
    const pageSize = useAppSelector(selectPageSize);
    const totalPages = useAppSelector(selectTotalPages);
    const totalCount = useAppSelector(selectTotalCount);
    const hasNextPage = useAppSelector(selectHasNextPage);
    const hasPreviousPage = useAppSelector(selectHasPreviousPage);

    // Action creators
    const handleFetchServiceTypes = useCallback(
        (params: ServiceTypeSearchParams = {}) => {
            dispatch(fetchServiceTypes(params));
        },
        [dispatch]
    );

    const handleFetchServiceTypeById = useCallback(
        (id: string) => {
            dispatch(fetchServiceTypeById(id));
        },
        [dispatch]
    );

    const handleCreateServiceType = useCallback(
        (data: ServiceTypeFormData) => {
            return dispatch(createServiceType(data));
        },
        [dispatch]
    );

    const handleUpdateServiceType = useCallback(
        (id: string, data: ServiceTypeFormData) => {
            return dispatch(updateServiceType({ id, data }));
        },
        [dispatch]
    );

    const handleDeleteServiceType = useCallback(
        (id: string) => {
            return dispatch(deleteServiceType(id));
        },
        [dispatch]
    );

    const handleToggleServiceTypeStatus = useCallback(
        (id: string) => {
            return dispatch(toggleServiceTypeStatus(id));
        },
        [dispatch]
    );

    const handleFetchActiveServiceTypes = useCallback(() => {
        dispatch(fetchActiveServiceTypes());
    }, [dispatch]);

    const handleFetchActiveServiceTypesSimple = useCallback(() => {
        dispatch(fetchActiveServiceTypesSimple());
    }, [dispatch]);

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleSetCurrentServiceType = useCallback(
        (serviceType: ServiceType | null) => {
            dispatch(setCurrentServiceType(serviceType));
        },
        [dispatch]
    );

    const handleClearCurrentServiceType = useCallback(() => {
        dispatch(clearCurrentServiceType());
    }, [dispatch]);

    const handleFilterServiceTypes = useCallback(
        (params: ServiceTypeSearchParams) => {
            dispatch(filterServiceTypes(params));
        },
        [dispatch]
    );

    const handleResetServiceTypeState = useCallback(() => {
        dispatch(resetServiceTypeState());
    }, [dispatch]);

    const getServiceTypesByStatus = useCallback(
        (status: 'ACTIVE' | 'INACTIVE') => {
            return serviceTypes.filter((st: ServiceType) => st.status === status);
        },
        [serviceTypes]
    );

    return {
        // State
        serviceTypes,
        currentServiceType,
        pagination,
        isLoading,
        error,

        // Filtered data
        activeServiceTypes,
        inactiveServiceTypes,

        // Counts
        serviceTypesCount,
        activeServiceTypesCount,
        inactiveServiceTypesCount,

        // Pagination
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,

        // Actions
        fetchServiceTypes: handleFetchServiceTypes,
        fetchServiceTypeById: handleFetchServiceTypeById,
        createServiceType: handleCreateServiceType,
        updateServiceType: handleUpdateServiceType,
        deleteServiceType: handleDeleteServiceType,
        toggleServiceTypeStatus: handleToggleServiceTypeStatus,
        fetchActiveServiceTypes: handleFetchActiveServiceTypes,
        fetchActiveServiceTypesSimple: handleFetchActiveServiceTypesSimple,
        filterServiceTypes: handleFilterServiceTypes,
        clearError: handleClearError,
        setCurrentServiceType: handleSetCurrentServiceType,
        clearCurrentServiceType: handleClearCurrentServiceType,
        resetServiceTypeState: handleResetServiceTypeState,

        // Selectors
        getServiceTypesByStatus,
    };
};
