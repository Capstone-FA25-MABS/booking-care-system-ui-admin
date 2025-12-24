import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selectors
export const selectSpecialtyState = (state: RootState) => state.specialty;

export const selectSpecialties = createSelector(
    [selectSpecialtyState],
    (specialtyState) => specialtyState.specialties
);

export const selectCurrentSpecialty = createSelector(
    [selectSpecialtyState],
    (specialtyState) => specialtyState.currentSpecialty
);

export const selectSpecialtyPagination = createSelector(
    [selectSpecialtyState],
    (specialtyState) => specialtyState.pagination
);

export const selectSpecialtyLoading = createSelector(
    [selectSpecialtyState],
    (specialtyState) => specialtyState.isLoading
);

export const selectSpecialtyError = createSelector(
    [selectSpecialtyState],
    (specialtyState) => specialtyState.error
);

// Computed selectors
export const selectActiveSpecialties = createSelector(
    [selectSpecialties],
    (specialties) => specialties?.filter((specialty) => specialty.status === 'ACTIVE') || []
);

export const selectInactiveSpecialties = createSelector(
    [selectSpecialties],
    (specialties) => specialties?.filter((specialty) => specialty.status === 'INACTIVE') || []
);

export const selectSpecialtyById = createSelector(
    [selectSpecialties, (_state: RootState, id: string) => id],
    (specialties, id) => specialties?.find((specialty) => specialty.id === id)
);

export const selectSpecialtiesCount = createSelector(
    [selectSpecialties],
    (specialties) => specialties?.length || 0
);

export const selectActiveSpecialtiesCount = createSelector(
    [selectActiveSpecialties],
    (activeSpecialties) => activeSpecialties.length
);

export const selectInactiveSpecialtiesCount = createSelector(
    [selectInactiveSpecialties],
    (inactiveSpecialties) => inactiveSpecialties.length
);

// Search and filter selectors
export const selectSpecialtiesBySearchTerm = createSelector(
    [selectSpecialties, (_state: RootState, searchTerm: string) => searchTerm],
    (specialties, searchTerm) => {
        if (!specialties) return [];
        if (!searchTerm.trim()) return specialties;

        const term = searchTerm.toLowerCase();
        return specialties.filter(
            (specialty) =>
                specialty.name.toLowerCase().includes(term) ||
                specialty.id.toLowerCase().includes(term)
        );
    }
);

export const selectSpecialtiesByStatus = createSelector(
    [selectSpecialties, (_state: RootState, status: 'ACTIVE' | 'INACTIVE') => status],
    (specialties, status) => specialties?.filter((specialty) => specialty.status === status) || []
);

// Pagination selectors
export const selectCurrentPage = createSelector(
    [selectSpecialtyPagination],
    (pagination) => pagination?.pageNumber || 1
);

export const selectPageSize = createSelector(
    [selectSpecialtyPagination],
    (pagination) => pagination?.pageSize || 10
);

export const selectTotalPages = createSelector(
    [selectSpecialtyPagination],
    (pagination) => pagination?.totalPages || 0
);

export const selectTotalCount = createSelector(
    [selectSpecialtyPagination],
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
