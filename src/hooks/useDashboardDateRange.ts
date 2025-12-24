import { useCallback, useMemo, useState } from 'react';
import { endOfDay, startOfDay, subDays } from 'date-fns';

interface DateRange {
    start: Date;
    end: Date;
}

interface UseDashboardDateRangeOptions {
    initialDays?: number;
}

export const useDashboardDateRange = (options?: UseDashboardDateRangeOptions) => {
    const initialDays = options?.initialDays ?? 29;
    const [dateRange, setDateRange] = useState<DateRange>(() => {
        const end = new Date();
        return {
            end,
            start: subDays(end, initialDays),
        };
    });

    const isoRange = useMemo(() => {
        const start = dateRange.start ? startOfDay(dateRange.start).toISOString() : undefined;
        const end = dateRange.end ? endOfDay(dateRange.end).toISOString() : undefined;
        return { fromDate: start, toDate: end };
    }, [dateRange]);

    const handleDateChange = useCallback((key: keyof DateRange, value: string) => {
        if (!value) return;
        setDateRange((prev) => ({
            ...prev,
            [key]: new Date(value),
        }));
    }, []);

    return {
        dateRange,
        setDateRange,
        isoRange,
        handleDateChange,
    };
};

export type UseDashboardDateRangeReturn = ReturnType<typeof useDashboardDateRange>;
