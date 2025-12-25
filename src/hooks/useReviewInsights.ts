import { useCallback, useEffect, useState } from 'react';
import { fetchReviewInsights } from '@/utils/reviewStats';

export interface ReviewStatsSummary {
    doctorTotalReviews: number;
    doctorAverageRating: number;
    serviceTotalReviews: number;
    serviceAverageRating: number;
    topDoctors: Array<{ id: string; name: string; rating: number; reviews: number }>;
    topServices: Array<{ id: string; name: string; rating: number; reviews: number }>;
    doctorChartData: Array<{ label: string; value1: number; value2: number }>;
    serviceChartData: Array<{ label: string; value1: number; value2: number }>;
    ratingDistribution?: Array<{ rating: number; count: number; percentage: number }>;
}

interface UseReviewInsightsOptions {
    fetchEntities: () => Promise<{ doctors: any[]; services: any[] }>;
    includeRatingDistribution?: boolean;
    enabled?: boolean;
    onError?: (error: unknown) => void;
    hospitalId?: string;
}

export const useReviewInsights = ({
    fetchEntities,
    includeRatingDistribution = false,
    enabled = true,
    onError,
    hospitalId,
}: UseReviewInsightsOptions) => {
    const [reviewStats, setReviewStats] = useState<ReviewStatsSummary | null>(null);
    const [isLoadingReviewStats, setIsLoadingReviewStats] = useState(false);

    const loadReviewStatistics = useCallback(async () => {
        if (!enabled) {
            setReviewStats(null);
            return;
        }

        setIsLoadingReviewStats(true);
        try {
            const { doctors, services } = await fetchEntities();

            if (!doctors.length && !services.length) {
                setReviewStats(null);
                return;
            }

            const { doctorInsights, serviceInsights, ratingDistribution } =
                await fetchReviewInsights({
                    doctors,
                    services,
                    includeRatingDistribution,
                    hospitalId,
                });

            setReviewStats({
                doctorTotalReviews: doctorInsights.totalReviews,
                doctorAverageRating: doctorInsights.averageRating,
                serviceTotalReviews: serviceInsights.totalReviews,
                serviceAverageRating: serviceInsights.averageRating,
                topDoctors: doctorInsights.topEntities,
                topServices: serviceInsights.topEntities,
                doctorChartData: doctorInsights.chartData,
                serviceChartData: serviceInsights.chartData,
                ratingDistribution: includeRatingDistribution ? ratingDistribution : undefined,
            });
        } catch (err) {
            console.error('Failed to load review statistics:', err);
            setReviewStats(null);
            onError?.(err);
        } finally {
            setIsLoadingReviewStats(false);
        }
    }, [enabled, fetchEntities, includeRatingDistribution, onError, hospitalId]);

    useEffect(() => {
        loadReviewStatistics();
    }, [loadReviewStatistics]);

    return { reviewStats, isLoadingReviewStats, reloadReviewStatistics: loadReviewStatistics };
};
