import { useState, useEffect, useCallback } from 'react';
import { HospitalPayoutService } from '@/services/hospitalPayout.service';
import { HospitalPayoutResponse } from '@/types/hospitalPayout.types';

export const useHospitalPayoutHistory = (hospitalId: string | undefined) => {
    const [payouts, setPayouts] = useState<HospitalPayoutResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const pageSize = 10;

    const fetchPayouts = useCallback(
        async (page: number = 1) => {
            if (!hospitalId) {
                setError('Hospital ID is required');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await HospitalPayoutService.getMyPayouts(
                    hospitalId,
                    page,
                    pageSize
                );
                setPayouts(response.items);
                setCurrentPage(response.pageNumber);
                setTotalPages(response.totalPages);
                setTotalCount(response.totalCount);
            } catch (err: any) {
                setError(err.message || 'Không thể tải lịch sử thanh toán');
                setPayouts([]);
            } finally {
                setLoading(false);
            }
        },
        [hospitalId]
    );

    useEffect(() => {
        if (hospitalId) {
            fetchPayouts(1);
        }
    }, [fetchPayouts, hospitalId]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            fetchPayouts(page);
        }
    };

    return {
        payouts,
        loading,
        error,
        currentPage,
        totalPages,
        totalCount,
        fetchPayouts,
        handlePageChange,
    };
};

export default useHospitalPayoutHistory;
