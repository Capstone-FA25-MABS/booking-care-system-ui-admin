import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selectors
export const selectLanguageState = (state: RootState) => state.language;

export const selectLanguages = createSelector(
    [selectLanguageState],
    (languageState) => languageState.languages
);

export const selectCurrentLanguage = createSelector(
    [selectLanguageState],
    (languageState) => languageState.currentLanguage
);

export const selectLanguagePagination = createSelector(
    [selectLanguageState],
    (languageState) => languageState.pagination
);

export const selectLanguageLoading = createSelector(
    [selectLanguageState],
    (languageState) => languageState.isLoading
);

export const selectLanguageError = createSelector(
    [selectLanguageState],
    (languageState) => languageState.error
);

// Computed selectors
export const selectActiveLanguages = createSelector(
    [selectLanguages],
    (languages) => languages?.filter((language) => language.status === 'ACTIVE') || []
);

export const selectInactiveLanguages = createSelector(
    [selectLanguages],
    (languages) => languages?.filter((language) => language.status === 'INACTIVE') || []
);

export const selectLanguageById = createSelector(
    [selectLanguages, (_state: RootState, id: string) => id],
    (languages, id) => languages?.find((language) => language.id === id)
);

export const selectLanguagesCount = createSelector(
    [selectLanguages],
    (languages) => languages?.length || 0
);

export const selectActiveLanguagesCount = createSelector(
    [selectActiveLanguages],
    (activeLanguages) => activeLanguages.length
);

export const selectInactiveLanguagesCount = createSelector(
    [selectInactiveLanguages],
    (inactiveLanguages) => inactiveLanguages.length
);

// Search and filter selectors
export const selectLanguagesBySearchTerm = createSelector(
    [selectLanguages, (_state: RootState, searchTerm: string) => searchTerm],
    (languages, searchTerm) => {
        if (!languages) return [];
        if (!searchTerm.trim()) return languages;

        const term = searchTerm.toLowerCase();
        return languages.filter(
            (language) =>
                language.name.toLowerCase().includes(term) ||
                language.flag.toLowerCase().includes(term) ||
                language.id.toLowerCase().includes(term)
        );
    }
);

export const selectLanguagesByStatus = createSelector(
    [selectLanguages, (_state: RootState, status: 'ACTIVE' | 'INACTIVE') => status],
    (languages, status) => languages?.filter((language) => language.status === status) || []
);

// Pagination selectors
export const selectCurrentPage = createSelector(
    [selectLanguagePagination],
    (pagination) => pagination?.pageNumber || 1
);

export const selectPageSize = createSelector(
    [selectLanguagePagination],
    (pagination) => pagination?.pageSize || 10
);

export const selectTotalPages = createSelector(
    [selectLanguagePagination],
    (pagination) => pagination?.totalPages || 0
);

export const selectTotalCount = createSelector(
    [selectLanguagePagination],
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
