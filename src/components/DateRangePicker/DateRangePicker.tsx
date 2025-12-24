import React, { useState, useRef, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Box, Button, Typography, Portal } from '@mui/material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface DateRange {
    start: Date | null;
    end: Date | null;
}

interface DateRangePickerProps {
    value: DateRange;
    onChange: (value: DateRange) => void;
    anchorEl?: HTMLElement | null;
    open?: boolean;
    onClose?: () => void;
    placeholder?: string;
    minDate?: Date;
    maxDate?: Date;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
    value,
    onChange,
    open = false,
    onClose,
    placeholder = 'Chọn khoảng thời gian...',
    minDate,
    maxDate,
}) => {
    const popperRef = useRef<HTMLDivElement>(null);
    const [internalValue, setInternalValue] = useState<[Date | null, Date | null]>([
        value.start,
        value.end,
    ]);

    // Default maxDate: if not provided, allow future dates (no restriction)
    // For revenue statistics, pass maxDate={new Date()} to restrict to today
    const effectiveMaxDate = maxDate || undefined;

    // Update internal value when prop changes or modal opens
    useEffect(() => {
        if (open) {
            setInternalValue([value.start, value.end]);
        }
    }, [open, value.start, value.end]);

    // Only update internal state when selecting dates (don't call onChange)
    const handleStartDateChange = (newValue: Date | null) => {
        setInternalValue([newValue, internalValue[1]]);
    };

    const handleEndDateChange = (newValue: Date | null) => {
        setInternalValue([internalValue[0], newValue]);
    };

    const handleApply = () => {
        const startDate = internalValue[0];
        let endDate = internalValue[1];

        // If only start date is selected, default end date to today
        if (startDate && !endDate) {
            endDate = new Date();
            endDate.setHours(23, 59, 59, 999);
        }

        // Only apply if at least start date is selected
        if (startDate) {
            onChange({
                start: startDate,
                end: endDate,
            });
        }

        if (onClose) {
            onClose();
        }
    };

    const handleClear = () => {
        setInternalValue([null, null]);
    };

    const getDisplayText = () => {
        const [start, end] = internalValue;
        if (start && end) {
            return `${format(start, 'dd/MM/yyyy', { locale: vi })} - ${format(end, 'dd/MM/yyyy', { locale: vi })}`;
        } else if (start) {
            return `${format(start, 'dd/MM/yyyy', { locale: vi })} - Chọn ngày kết thúc`;
        }
        return placeholder;
    };

    if (!open) {
        return null;
    }

    return (
        <Portal>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}
                    onClick={(e) => {
                        if (e.target === e.currentTarget && onClose) {
                            onClose();
                        }
                    }}
                >
                    <Box
                        ref={popperRef}
                        data-testid="date-range-picker"
                        sx={{
                            background: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            padding: '16px',
                            minWidth: '600px',
                            maxWidth: '700px',
                            maxHeight: '80vh',
                            overflow: 'auto',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 2,
                                pb: 1,
                                borderBottom: '1px solid #e0e0e0',
                            }}
                        >
                            <Typography variant="h6" sx={{ fontSize: '16px', fontWeight: 600 }}>
                                Chọn khoảng thời gian
                            </Typography>
                            <Button
                                size="small"
                                onClick={onClose}
                                sx={{
                                    minWidth: 'auto',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                }}
                            >
                                ✕
                            </Button>
                        </Box>

                        {/* Selected range display */}
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#666',
                                    fontSize: '14px',
                                    fontStyle: 'italic',
                                }}
                            >
                                {getDisplayText()}
                            </Typography>
                        </Box>

                        {/* Date Range Picker */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Từ ngày
                                </Typography>
                                <DateCalendar
                                    value={internalValue[0]}
                                    onChange={handleStartDateChange}
                                    minDate={minDate}
                                    maxDate={internalValue[1] || effectiveMaxDate}
                                    sx={{
                                        '& .MuiPickersDay-root': {
                                            fontSize: '14px',
                                        },
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Đến ngày
                                </Typography>
                                <DateCalendar
                                    value={internalValue[1]}
                                    onChange={handleEndDateChange}
                                    minDate={internalValue[0] || minDate}
                                    maxDate={effectiveMaxDate}
                                    sx={{
                                        '& .MuiPickersDay-root': {
                                            fontSize: '14px',
                                        },
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Action buttons */}
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 1,
                                mt: 2,
                                pt: 1,
                                borderTop: '1px solid #e0e0e0',
                            }}
                        >
                            <Button
                                size="small"
                                onClick={handleClear}
                                sx={{
                                    textTransform: 'none',
                                    color: '#666',
                                }}
                            >
                                Xóa
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleApply}
                                sx={{
                                    textTransform: 'none',
                                    backgroundColor: '#6366f1',
                                    '&:hover': {
                                        backgroundColor: '#4f46e5',
                                    },
                                }}
                            >
                                Áp dụng
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </LocalizationProvider>
        </Portal>
    );
};

export default DateRangePicker;
