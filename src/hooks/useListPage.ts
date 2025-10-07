import { useState, useMemo, useCallback } from 'react';

export interface UseListPageProps<T> {
    data: T[];
    itemsPerPage?: number;
    searchFields?: (keyof T)[];
}

// Helper functions to reduce nesting levels
const isStringMatch = (value: string, searchTerm: string): boolean => {
    return value.toLowerCase().includes(searchTerm.toLowerCase());
};

const isObjectMatch = (value: any, searchTerm: string): boolean => {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    return Object.values(value).some(
        (val) => typeof val === 'string' && isStringMatch(val, searchTerm)
    );
};

const isFieldMatch = (item: any, field: string, searchTerm: string): boolean => {
    const value = item[field];
    if (typeof value === 'string') {
        return isStringMatch(value, searchTerm);
    }
    return isObjectMatch(value, searchTerm);
};

const isSearchMatch = (item: any, searchFields: string[], searchTerm: string): boolean => {
    return searchFields.some((field) => isFieldMatch(item, field, searchTerm));
};

const isFilterMatch = (item: any, key: string, value: any): boolean => {
    const itemValue = item[key];
    if (typeof itemValue === 'string') {
        return isStringMatch(itemValue, value);
    }
    return itemValue === value;
};

const applySearchFilter = <T>(data: T[], searchTerm: string, searchFields: (keyof T)[]): T[] => {
    if (!searchTerm || searchFields.length === 0) {
        return data;
    }
    return data.filter((item) => isSearchMatch(item, searchFields as string[], searchTerm));
};

const applyCustomFilters = <T>(data: T[], filters: Record<string, any>): T[] => {
    return data.filter((item) => {
        return Object.entries(filters).every(([key, value]) => {
            if (value === '' || value === null || value === undefined) {
                return true;
            }
            return isFilterMatch(item, key, value);
        });
    });
};

export const useListPage = <T extends Record<string, any>>({
    data,
    itemsPerPage = 10,
    searchFields = [],
}: UseListPageProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [deleteItemId, setDeleteItemId] = useState<string>('');
    const [deleteItemName, setDeleteItemName] = useState<string>('');
    const [filters, setFilters] = useState<Record<string, any>>({});

    // Filter and search data
    const filteredData = useMemo(() => {
        let filtered = [...data];
        filtered = applySearchFilter(filtered, searchTerm, searchFields);
        filtered = applyCustomFilters(filtered, filters);
        return filtered;
    }, [data, searchTerm, searchFields, filters]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortBy) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortBy, sortOrder]);

    // Paginate data
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedData.slice(startIndex, endIndex);
    }, [sortedData, currentPage, itemsPerPage]);

    // Calculate pagination info
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const totalItems = sortedData.length;

    // Handlers
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleSearchChange = useCallback((term: string) => {
        setSearchTerm(term);
        setCurrentPage(1); // Reset to first page when searching
    }, []);

    const handleSortChange = useCallback((field: string, order: 'asc' | 'desc') => {
        setSortBy(field);
        setSortOrder(order);
    }, []);

    const handleDeleteClick = useCallback((id: string, name: string) => {
        setDeleteItemId(id);
        setDeleteItemName(name);
        setShowDeleteModal(true);
    }, []);

    const handleFilterClick = useCallback(() => {
        setShowFilterModal(true);
    }, []);

    const handleCloseFilter = useCallback(() => {
        setShowFilterModal(false);
    }, []);

    const handleApplyFilter = useCallback((newFilters: Record<string, any>) => {
        setFilters(newFilters);
        setCurrentPage(1); // Reset to first page when filtering
        setShowFilterModal(false);
    }, []);

    const handleCancelDelete = useCallback(() => {
        setShowDeleteModal(false);
        setDeleteItemId('');
        setDeleteItemName('');
    }, []);

    const handleConfirmDelete = useCallback(
        (onDelete: (id: string) => void) => {
            onDelete(deleteItemId);
            setShowDeleteModal(false);
            setDeleteItemId('');
            setDeleteItemName('');
        },
        [deleteItemId]
    );

    return {
        // Data
        paginatedData,
        filteredData,
        sortedData,

        // Pagination
        currentPage,
        totalPages,
        totalItems,
        itemsPerPage,

        // Search & Sort
        searchTerm,
        sortBy,
        sortOrder,

        // Modals
        showDeleteModal,
        showFilterModal,
        deleteItemName,

        // Handlers
        handlePageChange,
        handleSearchChange,
        handleSortChange,
        handleDeleteClick,
        handleFilterClick,
        handleCloseFilter,
        handleApplyFilter,
        handleCancelDelete,
        handleConfirmDelete,
    };
};
