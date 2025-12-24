import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selectors
export const selectPositionState = (state: RootState) => state.position;

export const selectPositions = createSelector(
    [selectPositionState],
    (positionState) => positionState.positions
);

export const selectCurrentPosition = createSelector(
    [selectPositionState],
    (positionState) => positionState.currentPosition
);

export const selectPositionPagination = createSelector(
    [selectPositionState],
    (positionState) => positionState.pagination
);

export const selectPositionLoading = createSelector(
    [selectPositionState],
    (positionState) => positionState.isLoading
);

export const selectPositionError = createSelector(
    [selectPositionState],
    (positionState) => positionState.error
);

// Computed selectors
export const selectActivePositions = createSelector(
    [selectPositions],
    (positions) => positions?.filter((position) => position.status === 'ACTIVE') || []
);

export const selectInactivePositions = createSelector(
    [selectPositions],
    (positions) => positions?.filter((position) => position.status === 'INACTIVE') || []
);

export const selectPositionById = createSelector(
    [selectPositions, (_state: RootState, id: string) => id],
    (positions, id) => positions?.find((position) => position.id === id)
);

export const selectPositionsCount = createSelector(
    [selectPositions],
    (positions) => positions?.length || 0
);

export const selectActivePositionsCount = createSelector(
    [selectActivePositions],
    (activePositions) => activePositions.length
);

export const selectInactivePositionsCount = createSelector(
    [selectInactivePositions],
    (inactivePositions) => inactivePositions.length
);

// Search and filter selectors
export const selectPositionsBySearchTerm = createSelector(
    [selectPositions, (_state: RootState, searchTerm: string) => searchTerm],
    (positions, searchTerm) => {
        if (!positions) return [];
        if (!searchTerm.trim()) return positions;

        const term = searchTerm.toLowerCase();
        return positions.filter(
            (position) =>
                position.name.toLowerCase().includes(term) ||
                position.id.toLowerCase().includes(term)
        );
    }
);

export const selectPositionsByStatus = createSelector(
    [selectPositions, (_state: RootState, status: 'ACTIVE' | 'INACTIVE') => status],
    (positions, status) => positions?.filter((position) => position.status === status) || []
);

// Pagination selectors
export const selectCurrentPage = createSelector(
    [selectPositionPagination],
    (pagination) => pagination?.pageNumber || 1
);

export const selectPageSize = createSelector(
    [selectPositionPagination],
    (pagination) => pagination?.pageSize || 10
);

export const selectTotalPages = createSelector(
    [selectPositionPagination],
    (pagination) => pagination?.totalPages || 0
);

export const selectTotalCount = createSelector(
    [selectPositionPagination],
    (pagination) => pagination?.totalCount || 0
);

export const selectHasNextPage = createSelector(
    [selectCurrentPage, selectTotalPages],
    (currentPage, totalPages) => currentPage < totalPages
);

export const selectHasPreviousPage = createSelector(
    [selectCurrentPage],
    (currentPage) => currentPage > 1
);
