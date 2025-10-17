import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchLanguages,
    fetchLanguageById,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    filterLanguages,
    clearError,
    clearCurrentLanguage,
    resetLanguageState,
} from '@/store/slices/languageSlice';
import {
    selectLanguages,
    selectCurrentLanguage,
    selectLanguagePagination,
    selectLanguageLoading,
    selectLanguageError,
    selectActiveLanguages,
    selectInactiveLanguages,
    selectLanguagesBySearchTerm,
    selectLanguagesByStatus,
    selectLanguagesCount,
    selectActiveLanguagesCount,
    selectInactiveLanguagesCount,
    selectCurrentPage,
    selectPageSize,
    selectTotalPages,
    selectTotalCount,
    selectHasNextPage,
    selectHasPreviousPage,
} from '@/store/selectors/language.selectors';
import { LanguageFormData, LanguageSearchParams } from '@/types/language.types';

interface UseLanguageReturn {
    // Data
    languages: ReturnType<typeof selectLanguages>;
    currentLanguage: ReturnType<typeof selectCurrentLanguage>;
    pagination: ReturnType<typeof selectLanguagePagination>;

    // Loading and error states
    isLoading: ReturnType<typeof selectLanguageLoading>;
    error: ReturnType<typeof selectLanguageError>;

    // Computed data
    activeLanguages: ReturnType<typeof selectActiveLanguages>;
    inactiveLanguages: ReturnType<typeof selectInactiveLanguages>;
    languagesCount: ReturnType<typeof selectLanguagesCount>;
    activeLanguagesCount: ReturnType<typeof selectActiveLanguagesCount>;
    inactiveLanguagesCount: ReturnType<typeof selectInactiveLanguagesCount>;

    // Pagination helpers
    currentPage: ReturnType<typeof selectCurrentPage>;
    pageSize: ReturnType<typeof selectPageSize>;
    totalPages: ReturnType<typeof selectTotalPages>;
    totalCount: ReturnType<typeof selectTotalCount>;
    hasNextPage: ReturnType<typeof selectHasNextPage>;
    hasPreviousPage: ReturnType<typeof selectHasPreviousPage>;

    // Actions
    fetchLanguages: (
        pageNumber?: number,
        pageSize?: number,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ) => void;
    fetchLanguageById: (id: string) => void;
    createLanguage: (languageData: LanguageFormData) => Promise<any>;
    updateLanguage: (id: string, languageData: LanguageFormData) => Promise<any>;
    deleteLanguage: (id: string) => Promise<any>;
    filterLanguages: (params: LanguageSearchParams) => void;
    clearError: () => void;
    clearCurrentLanguage: () => void;
    resetLanguageState: () => void;

    // Helper functions
    getLanguagesBySearchTerm: (
        searchTerm: string
    ) => ReturnType<typeof selectLanguagesBySearchTerm>;
    getLanguagesByStatus: (
        status: 'ACTIVE' | 'INACTIVE'
    ) => ReturnType<typeof selectLanguagesByStatus>;
}

export const useLanguage = (): UseLanguageReturn => {
    const dispatch = useAppDispatch();

    // Selectors
    const languages = useAppSelector(selectLanguages);
    const currentLanguage = useAppSelector(selectCurrentLanguage);
    const pagination = useAppSelector(selectLanguagePagination);
    const isLoading = useAppSelector(selectLanguageLoading);
    const error = useAppSelector(selectLanguageError);
    const activeLanguages = useAppSelector(selectActiveLanguages);
    const inactiveLanguages = useAppSelector(selectInactiveLanguages);
    const languagesCount = useAppSelector(selectLanguagesCount);
    const activeLanguagesCount = useAppSelector(selectActiveLanguagesCount);
    const inactiveLanguagesCount = useAppSelector(selectInactiveLanguagesCount);
    const currentPage = useAppSelector(selectCurrentPage);
    const pageSize = useAppSelector(selectPageSize);
    const totalPages = useAppSelector(selectTotalPages);
    const totalCount = useAppSelector(selectTotalCount);
    const hasNextPage = useAppSelector(selectHasNextPage);
    const hasPreviousPage = useAppSelector(selectHasPreviousPage);

    // Action creators
    const handleFetchLanguages = useCallback(
        (pageNumber?: number, pageSize?: number, sortBy?: string, sortOrder?: 'asc' | 'desc') => {
            dispatch(fetchLanguages({ pageNumber, pageSize, sortBy, sortOrder }));
        },
        [dispatch]
    );

    const handleFetchLanguageById = useCallback(
        (id: string) => {
            dispatch(fetchLanguageById(id));
        },
        [dispatch]
    );

    const handleCreateLanguage = useCallback(
        (languageData: LanguageFormData) => {
            return dispatch(createLanguage(languageData));
        },
        [dispatch]
    );

    const handleUpdateLanguage = useCallback(
        (id: string, languageData: LanguageFormData) => {
            return dispatch(updateLanguage({ id, languageData }));
        },
        [dispatch]
    );

    const handleDeleteLanguage = useCallback(
        (id: string) => {
            return dispatch(deleteLanguage(id));
        },
        [dispatch]
    );

    const handleFilterLanguages = useCallback(
        (params: LanguageSearchParams) => {
            dispatch(filterLanguages(params));
        },
        [dispatch]
    );

    const handleClearError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    const handleClearCurrentLanguage = useCallback(() => {
        dispatch(clearCurrentLanguage());
    }, [dispatch]);

    const handleResetLanguageState = useCallback(() => {
        dispatch(resetLanguageState());
    }, [dispatch]);

    // Helper functions
    const getLanguagesBySearchTerm = useCallback(
        (searchTerm: string) => {
            if (!languages) return [];
            if (!searchTerm.trim()) return languages;

            const term = searchTerm.toLowerCase();
            return languages.filter(
                (language) =>
                    language.name.toLowerCase().includes(term) ||
                    language.flag.toLowerCase().includes(term) ||
                    language.id.toLowerCase().includes(term)
            );
        },
        [languages]
    );

    const getLanguagesByStatus = useCallback(
        (status: 'ACTIVE' | 'INACTIVE') => {
            return languages?.filter((language) => language.status === status) || [];
        },
        [languages]
    );

    return {
        // Data
        languages,
        currentLanguage,
        pagination,

        // Loading and error states
        isLoading,
        error,

        // Computed data
        activeLanguages,
        inactiveLanguages,
        languagesCount,
        activeLanguagesCount,
        inactiveLanguagesCount,

        // Pagination helpers
        currentPage,
        pageSize,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,

        // Actions
        fetchLanguages: handleFetchLanguages,
        fetchLanguageById: handleFetchLanguageById,
        createLanguage: handleCreateLanguage,
        updateLanguage: handleUpdateLanguage,
        deleteLanguage: handleDeleteLanguage,
        filterLanguages: handleFilterLanguages,
        clearError: handleClearError,
        clearCurrentLanguage: handleClearCurrentLanguage,
        resetLanguageState: handleResetLanguageState,

        // Helper functions
        getLanguagesBySearchTerm,
        getLanguagesByStatus,
    };
};

export default useLanguage;
