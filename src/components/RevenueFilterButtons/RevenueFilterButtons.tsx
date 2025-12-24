import React, { useState, useRef } from 'react';
import styles from './RevenueFilterButtons.module.scss';
import DateRangePicker from '@/components/DateRangePicker/DateRangePicker';

export type RevenueViewPeriod = '7days' | '4weeks' | '6months' | '4quarters' | 'custom';

export interface CustomDateRange {
    start: Date | null;
    end: Date | null;
}

interface RevenueFilterButtonsProps {
    selectedPeriod: RevenueViewPeriod;
    onPeriodChange: (period: RevenueViewPeriod) => void;
    isLoading?: boolean;
    customDateRange?: CustomDateRange;
    onCustomDateRangeChange?: (range: CustomDateRange) => void;
}

const periodOptions: Array<{ value: RevenueViewPeriod; label: string; icon: string }> = [
    { value: '7days', label: '7 ngày', icon: 'ti ti-calendar-week' },
    { value: '4weeks', label: '4 tuần', icon: 'ti ti-calendar-month' },
    { value: '6months', label: '6 tháng', icon: 'ti ti-calendar-stats' },
    { value: '4quarters', label: '4 quý', icon: 'ti ti-chart-line' },
    { value: 'custom', label: 'Tùy chỉnh', icon: 'ti ti-calendar-search' },
];

export const RevenueFilterButtons: React.FC<RevenueFilterButtonsProps> = ({
    selectedPeriod,
    onPeriodChange,
    isLoading = false,
    customDateRange,
    onCustomDateRangeChange,
}) => {
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const datePickerButtonRef = useRef<HTMLButtonElement>(null);

    const handleDateRangeChange = (range: { start: Date | null; end: Date | null }) => {
        if (onCustomDateRangeChange) {
            onCustomDateRangeChange(range);
        }
    };

    const handleCloseDatePicker = () => {
        setIsDatePickerOpen(false);
    };

    const handleCustomClick = () => {
        onPeriodChange('custom');
        setIsDatePickerOpen(true);
    };

    const formatDateRange = () => {
        if (!customDateRange?.start || !customDateRange?.end) {
            return 'Chọn ngày';
        }
        const formatDate = (date: Date) => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };
        return `${formatDate(customDateRange.start)} - ${formatDate(customDateRange.end)}`;
    };

    return (
        <div className={styles.filterContainer}>
            <div className={styles.filterButtons}>
                {periodOptions.map((option) => (
                    <button
                        key={option.value}
                        ref={option.value === 'custom' ? datePickerButtonRef : undefined}
                        type="button"
                        className={`${styles.filterButton} ${
                            selectedPeriod === option.value ? styles.active : ''
                        }`}
                        onClick={() => {
                            if (option.value === 'custom') {
                                handleCustomClick();
                            } else {
                                onPeriodChange(option.value);
                            }
                        }}
                        disabled={isLoading}
                    >
                        <i className={option.icon} />
                        <span>
                            {option.value === 'custom' && selectedPeriod === 'custom'
                                ? formatDateRange()
                                : option.label}
                        </span>
                    </button>
                ))}
            </div>
            <DateRangePicker
                value={{
                    start: customDateRange?.start ?? null,
                    end: customDateRange?.end ?? null,
                }}
                onChange={handleDateRangeChange}
                anchorEl={datePickerButtonRef.current}
                open={isDatePickerOpen}
                onClose={handleCloseDatePicker}
            />
        </div>
    );
};
