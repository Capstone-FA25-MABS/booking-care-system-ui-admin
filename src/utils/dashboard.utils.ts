import { format, subDays } from 'date-fns';
import { StatisticsPeriod } from '@/types/statistics.types';

/**
 * Period options for dashboard statistics
 */
export const periodOptions: Array<{ value: StatisticsPeriod; label: string }> = [
    { value: StatisticsPeriod.Daily, label: 'Theo ngày' },
    { value: StatisticsPeriod.Weekly, label: 'Theo tuần' },
    { value: StatisticsPeriod.Monthly, label: 'Theo tháng' },
    { value: StatisticsPeriod.Quarterly, label: 'Theo quý' },
    { value: StatisticsPeriod.Yearly, label: 'Theo năm' },
];

/**
 * Number formatter for Vietnamese locale
 */
export const numberFormatter = new Intl.NumberFormat('vi-VN');

/**
 * Format percentage value
 */
export const formatPercent = (value: number) =>
    Number.isFinite(value) ? `${value.toFixed(2)}%` : '0%';

/**
 * Format date for display
 */
export const formatDateDisplay = (value?: string | Date) => {
    if (!value) return '--';
    try {
        const date = typeof value === 'string' ? new Date(value) : value;
        if (isNaN(date.getTime())) return '--';
        return format(date, 'dd/MM/yyyy');
    } catch {
        return '--';
    }
};

/**
 * Format trend label based on period
 */
export const formatTrendLabel = (periodStart: string, periodEnd: string): string => {
    try {
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return periodStart;
        }

        // If same date, return single date
        if (format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')) {
            return format(startDate, 'dd/MM/yyyy');
        }

        // Check if it's a period format (e.g., "2024-Q1", "2024-01", "2024")
        if (periodStart.includes('-Q')) {
            return periodStart;
        }
        if (periodStart.match(/^\d{4}$/)) {
            return periodStart;
        }
        if (periodStart.match(/^\d{4}-\d{2}$/)) {
            return format(startDate, 'MM/yyyy');
        }

        // Default: date range
        return `${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM/yyyy')}`;
    } catch {
        return periodStart;
    }
};

/**
 * Get period key for grouping statistics
 */
export const getPeriodKey = (date: Date, period: StatisticsPeriod): string => {
    if (isNaN(date.getTime())) {
        return format(new Date(), 'yyyy-MM-dd');
    }

    let key: string;

    switch (period) {
        case StatisticsPeriod.Daily:
            key = format(date, 'yyyy-MM-dd');
            break;
        case StatisticsPeriod.Weekly: {
            // Get start of week
            const weekStart = subDays(date, date.getDay());
            key = format(weekStart, 'yyyy-MM-dd');
            break;
        }
        case StatisticsPeriod.Monthly:
            key = format(date, 'yyyy-MM');
            break;
        case StatisticsPeriod.Quarterly: {
            const quarter = Math.floor(date.getMonth() / 3);
            key = `${date.getFullYear()}-Q${quarter + 1}`;
            break;
        }
        case StatisticsPeriod.Yearly:
            key = format(date, 'yyyy');
            break;
        default:
            key = format(date, 'yyyy-MM-dd');
    }

    return key;
};
