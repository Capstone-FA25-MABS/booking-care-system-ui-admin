import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import styles from './FilterDatePicker.module.scss';

interface FilterDatePickerProps {
    value: Date | null;
    onChange: (newValue: Date | null) => void;
    disabled?: boolean;
    minDate?: Date;
    maxDate?: Date;
}

// Common styling for date picker
const datePickerSx = {
    width: '100%',
    '& .MuiInputBase-root': {
        height: '30px',
        fontSize: '0.875rem',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        background: '#fdfdff',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 4px 10px rgba(15, 23, 42, 0.06)',
        '&:focus-within': {
            borderColor: '#6366f1',
            boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
        },
    },
    '& .MuiInputBase-input': {
        padding: '0.5rem 0.95rem',
        fontWeight: 600,
        color: '#0f172a',
    },
    '& .MuiDayCalendar-weekContainer .MuiTypography-root': {
        fontSize: '0.875rem',
        fontWeight: 600,
    },
};

// Common slot props
const datePickerSlotProps = {
    textField: {
        size: 'small' as const,
        className: styles.muiDatePicker,
        placeholder: 'Chọn ngày',
    },
    day: {
        sx: {
            '&.Mui-selected': {
                backgroundColor: '#6366f1',
                '&:hover': {
                    backgroundColor: '#4f46e5',
                },
            },
        },
    },
};

// Common day of week formatter
const dayOfWeekFormatter = (day: Date | string): string => {
    if (day instanceof Date) {
        const dayIndex = day.getDay();
        const dayNames = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return dayNames[dayIndex] || format(day, 'EEEE', { locale: vi });
    }
    const dayStr = String(day);
    const dayMap: Record<string, string> = {
        Mon: 'Thứ 2',
        Tue: 'Thứ 3',
        Wed: 'Thứ 4',
        Thu: 'Thứ 5',
        Fri: 'Thứ 6',
        Sat: 'Thứ 7',
        Sun: 'CN',
    };
    return dayMap[dayStr] || dayStr;
};

const FilterDatePicker: React.FC<FilterDatePickerProps> = ({
    value,
    onChange,
    disabled = false,
    ...otherProps
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
            <DatePicker
                value={value}
                onChange={onChange}
                disabled={disabled}
                format="dd/MM/yyyy"
                slotProps={datePickerSlotProps}
                sx={datePickerSx}
                dayOfWeekFormatter={dayOfWeekFormatter}
                {...otherProps}
            />
        </LocalizationProvider>
    );
};

export default FilterDatePicker;
