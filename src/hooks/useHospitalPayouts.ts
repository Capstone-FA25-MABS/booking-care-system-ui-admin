import { useState, useCallback } from 'react';
import HospitalPayoutService from '../services/hospitalPayout.service';
import type {
    HospitalPayoutResponse,
    GeneratePayoutsRequest,
    PayoutQueryRequest,
    PayoutStatistics,
    PendingHospitalInfo,
} from '../types/hospitalPayout.types';

export const useHospitalPayouts = () => {
    const [payouts, setPayouts] = useState<HospitalPayoutResponse[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPayouts = useCallback(async (params?: PayoutQueryRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await HospitalPayoutService.getPayouts(params);
            setPayouts(response.items || []);
            setTotalCount(response.totalCount);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch payouts';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchPayoutById = useCallback(async (payoutId: string) => {
        setLoading(true);
        setError(null);
        try {
            const payout = await HospitalPayoutService.getPayoutById(payoutId);
            return payout;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to fetch payout details';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const generatePayouts = useCallback(async (request: GeneratePayoutsRequest) => {
        setLoading(true);
        setError(null);
        try {
            const result = await HospitalPayoutService.generatePayouts(request);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate payouts';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const markPayoutCompleted = useCallback(async (payoutId: string) => {
        setLoading(true);
        setError(null);
        try {
            const updatedPayout = await HospitalPayoutService.markPayoutCompleted({ payoutId });
            // Update local state
            setPayouts((prev) =>
                prev.map((payout) => (payout.id === payoutId ? updatedPayout : payout))
            );
            return updatedPayout;
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to mark payout as completed';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        payouts,
        totalCount,
        loading,
        error,
        fetchPayouts,
        fetchPayoutById,
        generatePayouts,
        markPayoutCompleted,
    };
};

export const usePayoutStatistics = () => {
    const [statistics, setStatistics] = useState<PayoutStatistics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStatistics = useCallback(
        async (periodStartDate?: string, periodEndDate?: string) => {
            setLoading(true);
            setError(null);
            try {
                const stats = await HospitalPayoutService.getStatistics(
                    periodStartDate,
                    periodEndDate
                );
                setStatistics(stats);
                return stats;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to fetch statistics';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        statistics,
        loading,
        error,
        fetchStatistics,
    };
};

export const usePendingHospitals = () => {
    const [pendingHospitals, setPendingHospitals] = useState<PendingHospitalInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPendingHospitals = useCallback(
        async (periodStartDate: string, periodEndDate: string) => {
            setLoading(true);
            setError(null);
            try {
                const hospitals = await HospitalPayoutService.getPendingHospitals(
                    periodStartDate,
                    periodEndDate
                );
                setPendingHospitals(hospitals);
                return hospitals;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'Failed to fetch pending hospitals';
                setError(errorMessage);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    return {
        pendingHospitals,
        loading,
        error,
        fetchPendingHospitals,
    };
};
