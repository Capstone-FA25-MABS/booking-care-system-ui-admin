import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchPositions,
    fetchPositionById,
    createPosition,
    updatePosition,
    deletePosition,
    filterPositions,
    clearError,
    clearCurrentPosition,
    resetPositionState,
} from '@/store/slices/positionSlice';
import {
    selectPositions,
    selectCurrentPosition,
    selectPositionPagination,
    selectPositionLoading,
    selectPositionError,
    selectActivePositions,
    selectInactivePositions,
    selectPositionsBySearchTerm,
    selectPositionsByStatus,
    selectPositionsCount,
    selectActivePositionsCount,
    selectInactivePositionsCount,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectTotalCount,
    selectHasNextPage,
    selectHasPreviousPage,
} from '@/store/selectors/position.selectors';
import { PositionFormData, PositionSearchParams } from '@/types/position.types';

interface UsePositionReturn {
    // Data
    positions: ReturnType<typeof selectPositions>;
    currentPosition: ReturnType<typeof selectCurrentPosition>;
    pagination: ReturnType<typeof selectPositionPagination>;

    // Loading and error states
    isLoading: ReturnType<typeof selectPositionLoading>;
    error: ReturnType<typeof selectPositionError>;

    // Computed data
    activePositions: ReturnType<typeof selectActivePositions>;
    inactivePositions: ReturnType<typeof selectInactivePositions>;
    positionsCount: ReturnType<typeof selectPositionsCount>;
    activePositionsCount: ReturnType<typeof selectActivePositionsCount>;
    inactivePositionsCount: ReturnType<typeof selectInactivePositionsCount>;

    // Pagination helpers
    currentPage: ReturnType<typeof selectCurrentPage>;
    pageSize: ReturnType<typeof selectPageSize>;
    totalPages: ReturnType<typeof selectTotalPages>;
    totalCount: ReturnType<typeof selectTotalCount>;
    hasNextPage: ReturnType<typeof selectHasNextPage>;
    hasPreviousPage: ReturnType<typeof selectHasPreviousPage>;

    // Actions
    fetchPositions: (
        pageNumber?: number,
        pageSize?: number,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ) => void;
    fetchPositionById: (id: string) => void;
    createPosition: (positionData: PositionFormData) => Promise<any>;
    updatePosition: (id: string, positionData: PositionFormData) => Promise<any>;
    deletePosition: (id: string) => Promise<any>;
    filterPositions: (params: PositionSearchParams) => void;
    clearError: () => void;
    clearCurrentPosition: () => void;
    resetPositionState: () => void;

    // Helper functions
    getPositionsBySearchTerm: (
        searchTerm: string
    ) => ReturnType<typeof selectPositionsBySearchTerm>;
    getPositionsByStatus: (
        status: 'ACTIVE' | 'INACTIVE'
    ) => ReturnType<typeof selectPositionsByStatus>;
}

export const usePosition = (): UsePositionReturn => {
    const dispatch = useAppDispatch();

    // Selectors
    const positions = useAppSelector(selectPositions);
    const currentPosition = useAppSelector(selectCurrentPosition);
    const pagination = useAppSelector(selectPositionPagination);
    const isLoading = useAppSelector(selectPositionLoading);
    const error = useAppSelector(selectPositionError);
    const activePositions = useAppSelector(selectActivePositions);
    const inactivePositions = useAppSelector(selectInactivePositions);
    const positionsCount = useAppSelector(selectPositionsCount);
    const activePositionsCount = useAppSelector(selectActivePositionsCount);
    const inactivePositionsCount = useAppSelector(selectInactivePositionsCount);
    const currentPage = useAppSelector(selectCurrentPage);
    const pageSize = useAppSelector(selectPageSize);
    const totalPages = useAppSelector(selectTotalPages);
    const totalCount = useAppSelector(selectTotalCount);
    const hasNextPage = useAppSelector(selectHasNextPage);
    const hasPreviousPage = useAppSelector(selectHasPreviousPage);

    // Action creators
    const handleFetchPositions = useCallback(
        (pageNumber?: number, pageSize?: number, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
            dispatch(fetchPositions({ pageNumber, pageSize, sortBy, sortOrder }));
        },
        [dispatch]
    );

    const handleFetchPositionById = useCallback(
        (id: string) => {
            dispatch(fetchPositionById(id));
        },
        [dispatch]
    );

    const handleCreatePosition = useCallback(
        (positionData: PositionFormData) => {
            return dispatch(createPosition(positionData));
        },
        [dispatch]
    );

    const handleUpdatePosition = useCallback(
        (id: string, positionData: PositionFormData) => {
            return dispatch(updatePosition({ id, positionData }));
        },
        [dispatch]
    );

    const handleDeletePosition = useCallback(
        (id: string) => {
            return dispatch(deletePosition(id));
        },
        [dispatch]
    );

    const handleFilterPositions = useCallback(
        (params: PositionSearchParams) => {
            dispatch(filterPositions(params));
        },
        [dispatch]
    );

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearCurrentPosition = useCallback(() => {
        dispatch(clearCurrentPosition());
    }, [dispatch]);

    const handleResetPositionState = useCallback(() => {
        dispatch(resetPositionState());
    }, [dispatch]);

    // Helper functions
    const getPositionsBySearchTerm = useCallback(
        (searchTerm: string) => {
            if (!positions) return [];
            if (!searchTerm.trim()) return positions;

            const term = searchTerm.toLowerCase();
            return positions.filter(
                (position) =>
                    position.name.toLowerCase().includes(term) ||
                    position.id.toLowerCase().includes(term)
            );
        },
        [positions]
    );

    const getPositionsByStatus = useCallback(
        (status: 'ACTIVE' | 'INACTIVE') => {
            return positions?.filter((position) => position.status === status) || [];
        },
        [positions]
    );

    return {
        // Data
        positions,
        currentPosition,
        pagination,

        // Loading and error states
        isLoading,
        error,

        // Computed data
        activePositions,
        inactivePositions,
        positionsCount,
        activePositionsCount,
        inactivePositionsCount,

        // Pagination helpers
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,

        // Actions
        fetchPositions: handleFetchPositions,
        fetchPositionById: handleFetchPositionById,
        createPosition: handleCreatePosition,
        updatePosition: handleUpdatePosition,
        deletePosition: handleDeletePosition,
        filterPositions: handleFilterPositions,
        clearError: handleClearError,
        clearCurrentPosition: handleClearCurrentPosition,
        resetPositionState: handleResetPositionState,

        // Helper functions
        getPositionsBySearchTerm,
        getPositionsByStatus,
    };
};

export default usePosition;
