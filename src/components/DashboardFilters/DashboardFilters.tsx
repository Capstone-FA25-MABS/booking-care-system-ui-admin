import React, { useMemo } from 'react';
import Select from 'react-select';
import { format } from 'date-fns';
import FilterDatePicker from '@/components/FilterDatePicker';
import ActionDropdown from '@/components/ActionDropdown';
import { selectCustomStyles } from '@/constants/select.styles';
import { StatisticsPeriod } from '@/types/statistics.types';
import { periodOptions } from '@/utils/dashboard.utils';
import styles from './DashboardFilters.module.scss';

interface DashboardFiltersProps {
    dateRange: {
        start: Date | null;
        end: Date | null;
    };
    period: StatisticsPeriod;
    isLoading: boolean;
    error?: string | null;
    onDateChange: (key: 'start' | 'end', value: string) => void;
    onPeriodChange: (period: StatisticsPeriod) => void;
    onExport?: (format: string) => void;
}

const DashboardFiltersComponent: React.FC<DashboardFiltersProps> = ({
    dateRange,
    period,
    isLoading,
    error,
    onDateChange,
    onPeriodChange,
    onExport,
}) => {
    console.log('[DashboardFilters] render', { dateRange, period });

    const selectOptions = useMemo(
        () =>
            periodOptions.map((opt) => ({
                value: opt.value,
                label: opt.label,
            })),
        []
    );

    const selectedPeriod = useMemo(
        () => selectOptions.find((opt) => opt.value === period),
        [selectOptions, period]
    );

    return (
        <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
            <div className="card-body">
                <div className={styles.filtersHeader}>
                    <div className={styles.filtersRow}>
                        <div className={styles.filterControl}>
                            <label htmlFor="dateFrom">Từ ngày</label>
                            <FilterDatePicker
                                id="dateFrom"
                                value={dateRange.start}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        onDateChange('start', format(newValue, 'yyyy-MM-dd'));
                                    }
                                }}
                                maxDate={dateRange.end || undefined}
                                disabled={isLoading}
                            />
                        </div>
                        <div className={styles.filterControl}>
                            <label htmlFor="dateTo">Đến ngày</label>
                            <FilterDatePicker
                                id="dateTo"
                                value={dateRange.end}
                                onChange={(newValue) => {
                                    if (newValue) {
                                        onDateChange('end', format(newValue, 'yyyy-MM-dd'));
                                    }
                                }}
                                minDate={dateRange.start || undefined}
                                maxDate={new Date()}
                                disabled={isLoading}
                            />
                        </div>
                        <div className={styles.filterControl}>
                            <label htmlFor="periodSelect">Chu kỳ thống kê</label>
                            <Select
                                inputId="periodSelect"
                                options={selectOptions}
                                value={selectedPeriod}
                                onChange={(selectedOption) => {
                                    if (selectedOption) {
                                        onPeriodChange(selectedOption.value as StatisticsPeriod);
                                    }
                                }}
                                placeholder="Chọn chu kỳ thống kê"
                                classNamePrefix="select2"
                                styles={{
                                    ...selectCustomStyles,
                                    control: (provided: any) => ({
                                        ...selectCustomStyles.control(provided),
                                        minHeight: '40px',
                                        height: '40px',
                                        padding: '5px',
                                    }),
                                    valueContainer: (provided: any) => ({
                                        ...selectCustomStyles.valueContainer(provided),
                                        padding: '0 8px',
                                        height: '30px',
                                    }),
                                    indicatorsContainer: (provided: any) => ({
                                        ...provided,
                                        height: '30px',
                                    }),
                                    indicatorSeparator: () => ({
                                        display: 'none',
                                    }),
                                    dropdownIndicator: (provided: any) => ({
                                        ...provided,
                                        padding: '4px 8px',
                                    }),
                                }}
                                menuPortalTarget={document.body}
                                isDisabled={isLoading}
                                isSearchable={false}
                            />
                        </div>
                    </div>
                    <div className={styles.exportAction}>
                        <ActionDropdown
                            type="export"
                            options={[
                                { value: 'pdf', label: 'Tải xuống dạng PDF', format: 'pdf' },
                                {
                                    value: 'excel',
                                    label: 'Tải xuống dạng Excel',
                                    format: 'excel',
                                },
                            ]}
                            onExport={(format: string) => {
                                if (onExport) {
                                    onExport(format);
                                } else {
                                    console.log('Exporting:', format);
                                }
                            }}
                            size="sm"
                        />
                    </div>
                </div>

                {error && (
                    <div className="alert alert-danger mb-0" role="alert">
                        <i className="ti ti-alert-triangle me-2" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export const DashboardFilters = React.memo(DashboardFiltersComponent);
