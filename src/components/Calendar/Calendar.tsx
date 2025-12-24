/**
 * Calendar component for date picking.
 *
 * @property value - The currently selected date (ISO string or null).
 * @property onChange - Callback fired when a date is selected.
 * @property placeholder - Placeholder text for the input.
 * @property className - Optional additional CSS class names for the input.
 * @property style - Optional inline styles for the input.
 * @property disabled - Optional boolean to disable the input.
 */
import React, { useEffect, useRef } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Popper } from '@mui/material';
import DateCustomize from './components/DateCustomize';

interface CalendarProps {
    value: Date | null;
    onChange: (value: Date | null) => void;
    minDate?: Date;
    maxDate?: Date;
    anchorEl?: HTMLElement | null;
    open?: boolean;
    onClose?: () => void;
    isTodaySelected?: boolean;
    usePopper?: boolean; // New prop to control Popper usage
    styles?: React.CSSProperties;
}

const Calendar: React.FC<CalendarProps> = ({
    value,
    onChange,
    minDate,
    maxDate,
    anchorEl,
    open = false,
    onClose,
    isTodaySelected = false,
    usePopper = true, // Default to using Popper
    styles,
}) => {
    const popperRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close the popup
    useEffect(() => {
        if (!usePopper || !onClose) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                popperRef.current &&
                !popperRef.current.contains(event.target as Node) &&
                anchorEl &&
                !anchorEl.contains(event.target as Node)
            ) {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [usePopper, open, anchorEl, onClose]);

    const handleChangeDate = (newDate: Date | null) => {
        onChange(newDate);
        if (usePopper && onClose) {
            onClose();
        }
    };

    if (!usePopper) {
        // Render inline calendar without Popper
        return (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateCustomize
                    value={value}
                    onChange={handleChangeDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    isTodaySelected={isTodaySelected}
                    styles={styles}
                />
            </LocalizationProvider>
        );
    }

    // Render calendar with Popper
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Popper
                open={open}
                anchorEl={anchorEl}
                placement="bottom-start"
                sx={{
                    zIndex: 10000,
                }}
            >
                <div ref={popperRef}>
                    <DateCustomize
                        value={value}
                        onChange={handleChangeDate}
                        minDate={minDate}
                        maxDate={maxDate}
                        isTodaySelected={isTodaySelected}
                        styles={styles}
                    />
                </div>
            </Popper>
        </LocalizationProvider>
    );
};

export default Calendar;
