import React from 'react';
import styles from './RevenueFilterButtons.module.scss';

export type RevenueViewPeriod = '7days' | '4weeks' | '6months' | '4quarters';

interface RevenueFilterButtonsProps {
    selectedPeriod: RevenueViewPeriod;
    onPeriodChange: (period: RevenueViewPeriod) => void;
    isLoading?: boolean;
}

const periodOptions: Array<{ value: RevenueViewPeriod; label: string; icon: string }> = [
    { value: '7days', label: '7 ngày', icon: 'ti ti-calendar-week' },
    { value: '4weeks', label: '4 tuần', icon: 'ti ti-calendar-month' },
    { value: '6months', label: '6 tháng', icon: 'ti ti-calendar-stats' },
    { value: '4quarters', label: '4 quý', icon: 'ti ti-chart-line' },
];

export const RevenueFilterButtons: React.FC<RevenueFilterButtonsProps> = ({
    selectedPeriod,
    onPeriodChange,
    isLoading = false,
}) => {
    return (
        <div className={styles.filterButtons}>
            {periodOptions.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className={`${styles.filterButton} ${
                        selectedPeriod === option.value ? styles.active : ''
                    }`}
                    onClick={() => onPeriodChange(option.value)}
                    disabled={isLoading}
                >
                    <i className={option.icon} />
                    <span>{option.label}</span>
                </button>
            ))}
        </div>
    );
};
