import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatisticsPeriod } from '@/types/statistics.types';
import {
    AppointmentTrendPoint,
    NewPatientTrendPoint,
    calculateAppointmentTrends,
} from '@/utils/appointmentTrends';
import { calculateAdditionalStatistics as defaultAdditionalStatistics } from '@/utils/dashboardStatistics';
import {
    buildAppointmentTrendPoints,
    buildNewPatientTrendPoints,
    ChartPoint,
} from '@/utils/dashboardChartData';

interface UseAppointmentStatisticsOptions<TStats, TAdditional> {
    period: StatisticsPeriod;
    fetchAppointments: () => Promise<any[] | null | undefined>;
    calculateStatistics: (appointments: any[]) => Promise<TStats> | TStats;
    calculateAdditionalStatistics?: (appointments: any[]) => Promise<TAdditional> | TAdditional;
    onError?: (message: string, error: unknown) => void;
    disabled?: boolean;
}

interface UseAppointmentStatisticsResult<TStats, TAdditional> {
    stats: TStats | null;
    appointmentTrend: AppointmentTrendPoint[];
    newPatientTrend: NewPatientTrendPoint[];
    appointmentTrendPoints: ChartPoint[];
    newPatientTrendPoints: ChartPoint[];
    additionalStats: TAdditional | null;
    isLoading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

export const useAppointmentStatistics = <
    TStats,
    TAdditional = ReturnType<typeof defaultAdditionalStatistics>,
>({
    period,
    fetchAppointments,
    calculateStatistics,
    calculateAdditionalStatistics = defaultAdditionalStatistics as (
        appointments: any[]
    ) => Promise<TAdditional> | TAdditional,
    onError,
    disabled,
}: UseAppointmentStatisticsOptions<TStats, TAdditional>): UseAppointmentStatisticsResult<
    TStats,
    TAdditional
> => {
    const [stats, setStats] = useState<TStats | null>(null);
    const [appointmentTrend, setAppointmentTrend] = useState<AppointmentTrendPoint[]>([]);
    const [newPatientTrend, setNewPatientTrend] = useState<NewPatientTrendPoint[]>([]);
    const [additionalStats, setAdditionalStats] = useState<TAdditional | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadStatistics = useCallback(async () => {
        if (disabled) {
            setStats(null);
            setAppointmentTrend([]);
            setNewPatientTrend([]);
            setAdditionalStats(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const appointments = await fetchAppointments();
            if (!appointments) {
                setStats(null);
                setAppointmentTrend([]);
                setNewPatientTrend([]);
                setAdditionalStats(null);
                setIsLoading(false);
                return;
            }

            const statistics = await calculateStatistics(appointments);
            const trends = calculateAppointmentTrends(appointments, period);
            const additional = await calculateAdditionalStatistics(appointments);

            setStats(statistics);
            setAppointmentTrend(trends.appointmentTrendPoints);
            setNewPatientTrend(trends.newPatientTrendPoints);
            setAdditionalStats(additional);
        } catch (err: any) {
            const message = err?.message || 'Không thể tải dữ liệu thống kê';
            setError(message);
            onError?.(message, err);
        } finally {
            setIsLoading(false);
        }
    }, [
        disabled,
        fetchAppointments,
        calculateStatistics,
        calculateAdditionalStatistics,
        period,
        onError,
    ]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const appointmentTrendPoints = useMemo<ChartPoint[]>(
        () => buildAppointmentTrendPoints(appointmentTrend),
        [appointmentTrend]
    );

    const newPatientTrendPoints = useMemo<ChartPoint[]>(
        () => buildNewPatientTrendPoints(newPatientTrend),
        [newPatientTrend]
    );

    return {
        stats,
        appointmentTrend,
        newPatientTrend,
        appointmentTrendPoints,
        newPatientTrendPoints,
        additionalStats,
        isLoading,
        error,
        reload: loadStatistics,
    };
};
