import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

interface DateCalendarProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    minDate?: Date;
    maxDate?: Date;
    isTodaySelected?: boolean;
    styles?: React.CSSProperties;
}

const DateCustomize: React.FC<DateCalendarProps> = ({
    value,
    onChange,
    minDate,
    maxDate,
    isTodaySelected,
    styles = { width: '300px' },
}) => {
    // Common calendar styles
    const calendarStyles = {
        ...styles,
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '10px',
        fontFamily: "'Inter', sans-serif",
        '&.MuiDateCalendar-root': {
            height: 'unset',
            maxHeight: 'unset',
        },
        '& .MuiTypography-root': {
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            fontWeight: 500,
            color: '#333',
        },
        '& .MuiDayCalendar-header': {
            justifyContent: 'space-between',
        },
        '& .MuiDayCalendar-weekContainer': {
            justifyContent: 'space-between',
        },
        '& .MuiPickersArrowSwitcher-button': {
            background: 'none',
            border: 'none',
            padding: '8px',
            borderRadius: '4px',
            '&:hover': {
                background: '#e9ecef',
            },
            '&.Mui-disabled': {
                color: '#ccc',
            },
        },
        '& .MuiDayCalendar-weekDayLabel': {
            fontSize: '12px',
            fontWeight: 500,
            color: '#666',
            textTransform: 'uppercase',
        },
        '& .MuiPickersDay-root': {
            fontFamily: "'Inter', sans-serif",
            fontSize: '14px',
            color: '#333',
            borderRadius: '4px',
            '&:hover': {
                background: '#e9ecef',
            },
            '&.Mui-selected': {
                background: '#007bff !important',
                color: '#ffffff',
            },
            '&.MuiPickersDay-today': {
                background: isTodaySelected ? '#e6f0fa' : 'transparent',
                color: isTodaySelected ? '#ffffff' : '#333',
            },
            '&.Mui-disabled': {
                color: '#ccc',
            },
        },
    };

    return (
        <DateCalendar
            value={value}
            onChange={onChange}
            minDate={minDate}
            maxDate={maxDate}
            sx={calendarStyles}
            showDaysOutsideCurrentMonth
            views={['day']}
            fixedWeekNumber={6}
        />
    );
};

export default DateCustomize;
