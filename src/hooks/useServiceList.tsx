import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Service, ServiceSearchParams } from '@/types/service.types';
import {
    getAllServices,
    filterServices,
    deleteService,
    getFilterOptions,
} from '@/services/service.service';

interface UseServiceListConfig {
    hospitalId?: string; // For staff role - filter by specific hospital
    showHospitalColumn?: boolean; // Control whether to show hospital column
    showHospitalFilter?: boolean; // Control whether to show hospital filter
}

export const useServiceList = (config: UseServiceListConfig = {}) => {
    const { hospitalId, showHospitalColumn = true, showHospitalFilter = true } = config;

    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
    });

    // Filter options
    const [serviceCategories, setServiceCategories] = useState<Array<{ id: string; name: string }>>(
        []
    );
    const [hospitals, setHospitals] = useState<Array<{ id: string; name: string }>>([]);

    // Filter states (for modal)
    const [tempSelectedServiceTypes, setTempSelectedServiceTypes] = useState<string[]>([]);
    const [tempSelectedHospitals, setTempSelectedHospitals] = useState<string[]>([]);
    const [tempSelectedStatuses, setTempSelectedStatuses] = useState<string[]>([]);
    const [tempSelectedPrices, setTempSelectedPrices] = useState<string[]>([]);

    // Applied filter states (for actual filtering)
    const [appliedSelectedServiceTypes, setAppliedSelectedServiceTypes] = useState<string[]>([]);
    const [appliedSelectedHospitals, setAppliedSelectedHospitals] = useState<string[]>([]);
    const [appliedSelectedStatuses, setAppliedSelectedStatuses] = useState<string[]>([]);
    const [appliedSelectedPrices, setAppliedSelectedPrices] = useState<string[]>([]);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('Tên A-Z');

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Map sort option to API format
    const mapSortToApi = (
        sortOption: string
    ): { sortBy: string; sortDirection: 'asc' | 'desc' } => {
        switch (sortOption) {
            case 'Tên A-Z':
                return { sortBy: 'Name', sortDirection: 'asc' };
            case 'Tên Z-A':
                return { sortBy: 'Name', sortDirection: 'desc' };
            case 'Giá (Cao-Thấp)':
                return { sortBy: 'Price', sortDirection: 'desc' };
            case 'Giá (Thấp-Cao)':
                return { sortBy: 'Price', sortDirection: 'asc' };
            default:
                return { sortBy: 'Name', sortDirection: 'asc' };
        }
    };

    // Fetch filter options
    const fetchFilterOptions = async () => {
        try {
            const response = await getFilterOptions();
            if (response.success && response.data) {
                setHospitals(response.data.hospitals || []);
                setServiceCategories(response.data.serviceCategories || []);
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
            toast.error('Không thể tải danh sách tùy chọn lọc');
        }
    };

    // Build filter parameters
    const buildFilterParams = (
        page: number,
        overrideFilters?: {
            serviceTypes?: string[];
            hospitals?: string[];
            statuses?: string[];
            prices?: string[];
            search?: string;
        }
    ): ServiceSearchParams => {
        const filterParams: ServiceSearchParams = {
            page: page,
            pageSize: itemsPerPage,
        };

        // Use override filters if provided, otherwise use applied filters
        const activeServiceTypes = overrideFilters?.serviceTypes ?? appliedSelectedServiceTypes;
        const activeHospitals = overrideFilters?.hospitals ?? appliedSelectedHospitals;
        const activeStatuses = overrideFilters?.statuses ?? appliedSelectedStatuses;
        const activePrices = overrideFilters?.prices ?? appliedSelectedPrices;
        const activeSearchTerm = overrideFilters?.search ?? searchTerm;

        if (activeSearchTerm.trim()) {
            filterParams.searchTerm = activeSearchTerm.trim();
        }

        if (activeServiceTypes.length > 0) {
            filterParams.serviceCategoryId = activeServiceTypes[0];
        }

        // If hospitalId is provided (staff role), always filter by it
        if (hospitalId) {
            filterParams.hospitalId = hospitalId;
        } else if (activeHospitals.length > 0) {
            filterParams.hospitalId = activeHospitals[0];
        }

        if (activeStatuses.length > 0) {
            filterParams.status = activeStatuses[0] as 'ACTIVE' | 'INACTIVE';
        }

        // Handle price range filter
        if (activePrices.length > 0) {
            const priceRange = activePrices[0];
            const priceRanges: Record<string, { min?: number; max?: number }> = {
                'p-1': { max: 200000 },
                'p-2': { min: 200000, max: 400000 },
                'p-3': { min: 400000, max: 600000 },
                'p-4': { min: 600000, max: 800000 },
                'p-5': { min: 800000, max: 1000000 },
                'p-6': { min: 1000000, max: 1500000 },
                'p-7': { min: 1500000 },
            };
            const range = priceRanges[priceRange];
            if (range) {
                if (range.min) filterParams.minPrice = range.min;
                if (range.max) filterParams.maxPrice = range.max;
            }
        }

        // Map sort option to API format
        const sortMapping = mapSortToApi(sortBy);
        filterParams.sortBy = sortMapping.sortBy;
        filterParams.sortDirection = sortMapping.sortDirection;

        return filterParams;
    };

    // Fetch services
    const fetchServices = async (page: number = 1, pageSize: number = 10) => {
        setIsLoading(true);
        setError(null);
        try {
            const sortMapping = mapSortToApi(sortBy);
            const response = await getAllServices(
                page,
                pageSize,
                sortMapping.sortBy,
                sortMapping.sortDirection
            );
            if (response.success && response.data) {
                setServices(response.data.items || []);
                setPagination({
                    totalCount: response.data.totalCount || 0,
                    pageNumber: response.data.pageNumber || page,
                    pageSize: response.data.pageSize || pageSize,
                    totalPages: response.data.totalPages || 0,
                });
            }
        } catch (err: any) {
            setError(err.message || 'Không thể tải danh sách dịch vụ');
            toast.error(err.message || 'Không thể tải danh sách dịch vụ');
        } finally {
            setIsLoading(false);
        }
    };

    // Check if any filters are applied
    const hasActiveFilters = () => {
        return (
            appliedSelectedServiceTypes.length > 0 ||
            appliedSelectedHospitals.length > 0 ||
            appliedSelectedStatuses.length > 0 ||
            appliedSelectedPrices.length > 0 ||
            searchTerm.trim() !== '' ||
            !!hospitalId // If hospitalId is provided, always consider it as a filter
        );
    };

    // Filter services
    const handleFilterServices = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filterParams = buildFilterParams(1);
            const response = await filterServices(filterParams);
            if (response.success && response.data) {
                setServices(response.data.items || []);
                setPagination({
                    totalCount: response.data.totalCount || 0,
                    pageNumber: response.data.pageNumber || 1,
                    pageSize: response.data.pageSize || itemsPerPage,
                    totalPages: response.data.totalPages || 0,
                });
                setCurrentPage(1);
            }
        } catch (err: any) {
            setError(err.message || 'Không thể lọc dịch vụ');
            toast.error(err.message || 'Không thể lọc dịch vụ');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        const filterParams = buildFilterParams(page);
        filterServices(filterParams)
            .then((response) => {
                if (response.success && response.data) {
                    setServices(response.data.items || []);
                    setPagination({
                        totalCount: response.data.totalCount || 0,
                        pageNumber: response.data.pageNumber || page,
                        pageSize: response.data.pageSize || itemsPerPage,
                        totalPages: response.data.totalPages || 0,
                    });
                }
            })
            .catch((err: any) => {
                setError(err.message || 'Không thể tải danh sách dịch vụ');
                toast.error(err.message || 'Không thể tải danh sách dịch vụ');
            });
    };

    // Handle delete service
    const handleDeleteService = async (serviceId: string): Promise<boolean> => {
        try {
            setIsLoading(true);
            const response = await deleteService(serviceId);
            if (response.success) {
                toast.success('Xóa dịch vụ thành công');

                // Refresh the list based on current state
                if (hasActiveFilters()) {
                    const filterParams = buildFilterParams(currentPage);
                    const refreshResponse = await filterServices(filterParams);
                    if (refreshResponse.success && refreshResponse.data) {
                        setServices(refreshResponse.data.items || []);
                        setPagination({
                            totalCount: refreshResponse.data.totalCount || 0,
                            pageNumber: refreshResponse.data.pageNumber || currentPage,
                            pageSize: refreshResponse.data.pageSize || itemsPerPage,
                            totalPages: refreshResponse.data.totalPages || 0,
                        });
                    }
                } else {
                    await fetchServices(currentPage, itemsPerPage);
                }
                return true;
            }
            return false;
        } catch (err: any) {
            toast.error(err.message || 'Không thể xóa dịch vụ');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Handle filter submit
    const handleFilterSubmit = async () => {
        setAppliedSelectedServiceTypes(tempSelectedServiceTypes);
        setAppliedSelectedHospitals(tempSelectedHospitals);
        setAppliedSelectedStatuses(tempSelectedStatuses);
        setAppliedSelectedPrices(tempSelectedPrices);
        setCurrentPage(1);

        setIsLoading(true);
        setError(null);
        try {
            const filterParams = buildFilterParams(1, {
                serviceTypes: tempSelectedServiceTypes,
                hospitals: tempSelectedHospitals,
                statuses: tempSelectedStatuses,
                prices: tempSelectedPrices,
                search: searchTerm,
            });
            const response = await filterServices(filterParams);
            if (response.success && response.data) {
                setServices(response.data.items || []);
                setPagination({
                    totalCount: response.data.totalCount || 0,
                    pageNumber: response.data.pageNumber || 1,
                    pageSize: response.data.pageSize || itemsPerPage,
                    totalPages: response.data.totalPages || 0,
                });
            }
        } catch (err: any) {
            setError(err.message || 'Không thể lọc dịch vụ');
            toast.error(err.message || 'Không thể lọc dịch vụ');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setTempSelectedServiceTypes([]);
        setTempSelectedHospitals([]);
        setTempSelectedStatuses([]);
        setTempSelectedPrices([]);
        setAppliedSelectedServiceTypes([]);
        setAppliedSelectedHospitals([]);
        setAppliedSelectedStatuses([]);
        setAppliedSelectedPrices([]);
        setSearchTerm('');
        setCurrentPage(1);

        // If hospitalId is provided, still filter by it
        if (hospitalId) {
            handleFilterServices();
        } else {
            fetchServices(1, itemsPerPage);
        }
    };

    // Fetch filter options on mount only (once)
    useEffect(() => {
        fetchFilterOptions();
    }, []);

    // Fetch services on component mount and when dependencies change
    // This effect handles: currentPage, sortBy, searchTerm, and hospitalId changes
    useEffect(() => {
        const timeoutId = setTimeout(
            () => {
                if (hasActiveFilters()) {
                    handleFilterServices();
                } else {
                    fetchServices(currentPage, itemsPerPage);
                }
            },
            searchTerm ? 500 : 0
        ); // Only debounce if searchTerm is not empty

        return () => clearTimeout(timeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortBy, searchTerm, hospitalId]); // Include hospitalId to handle changes

    const sortedServices = useMemo(() => {
        return services;
    }, [services]);

    const shouldHidePagination = useMemo(() => {
        if (sortedServices.length === 0) return true;
        return pagination.totalPages <= 1;
    }, [sortedServices.length, pagination.totalPages]);

    // Refresh/refetch current data
    const refetchServices = () => {
        if (hasActiveFilters()) {
            handleFilterServices();
        } else {
            fetchServices(currentPage, itemsPerPage);
        }
    };

    return {
        // Data
        services: sortedServices,
        isLoading,
        error,
        pagination,

        // Filter options
        serviceCategories,
        hospitals,

        // Filter states
        tempSelectedServiceTypes,
        setTempSelectedServiceTypes,
        tempSelectedHospitals,
        setTempSelectedHospitals,
        tempSelectedStatuses,
        setTempSelectedStatuses,
        tempSelectedPrices,
        setTempSelectedPrices,

        appliedSelectedServiceTypes,
        appliedSelectedHospitals,
        appliedSelectedStatuses,
        appliedSelectedPrices,

        // Search and sort
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,

        // Pagination
        currentPage,
        shouldHidePagination,

        // Actions
        handlePageChange,
        handleDeleteService,
        handleFilterSubmit,
        handleClearFilters,
        setError,
        refetchServices,

        // Config
        showHospitalColumn,
        showHospitalFilter,
    };
};
