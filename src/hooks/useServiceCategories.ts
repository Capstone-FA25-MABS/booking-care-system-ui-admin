import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getAllServiceCategories } from '@/services/serviceCategory.service';
import { ServiceCategory } from '@/types/serviceCategory.types';

interface UseServiceCategoriesReturn {
    serviceCategories: ServiceCategory[];
    isLoading: boolean;
    fetchServiceCategories: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage service categories
 * @param shouldFetchOnMount - Whether to fetch categories when component mounts
 * @returns Service categories, loading state, and fetch function
 */
export const useServiceCategories = (
    shouldFetchOnMount: boolean = false
): UseServiceCategoriesReturn => {
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchServiceCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getAllServiceCategories();
            if (response.success && response.data) {
                setServiceCategories(response.data);
            }
        } catch (error) {
            console.error('Error fetching service categories:', error);
            toast.error('Không thể tải danh sách loại dịch vụ');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (shouldFetchOnMount) {
            fetchServiceCategories();
        }
    }, [shouldFetchOnMount, fetchServiceCategories]);

    return {
        serviceCategories,
        isLoading,
        fetchServiceCategories,
    };
};
