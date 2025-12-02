type DateFormat =
    | 'YYYY-MM-DD'
    | 'DD/MM/YYYY'
    | 'MM-DD-YYYY'
    | 'YYYY-MM-DD HH:mm:ss'
    | 'DD/MM/YYYY HH:mm';

/**
 * Formats a date string or Date object into specified format
 * @param date - Date string or Date object to format
 * @param format - Output format for the date (default: 'YYYY-MM-DD')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, format: DateFormat = 'YYYY-MM-DD'): string => {
    const d = new Date(date);

    // Check if date is valid
    if (isNaN(d.getTime())) {
        throw new Error('Invalid date provided');
    }

    const pad = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1); // Months are zero-based
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());

    switch (format) {
        case 'YYYY-MM-DD':
            return `${year}-${month}-${day}`;
        case 'DD/MM/YYYY':
            return `${day}/${month}/${year}`;
        case 'MM-DD-YYYY':
            return `${month}-${day}-${year}`;
        case 'YYYY-MM-DD HH:mm:ss':
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        case 'DD/MM/YYYY HH:mm':
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        default:
            throw new Error(`Unsupported date format: ${format}`);
    }
};

/**
 * Formats a Date object to YYYY-MM-DD string in local timezone
 * This avoids timezone conversion issues when using toISOString()
 * @param date - Date object to format
 * @returns Formatted date string in YYYY-MM-DD format (local timezone)
 * @example
 * const date = new Date('2025-11-17'); // Local date
 * formatDateToLocalString(date); // Returns "2025-11-17" (not affected by UTC conversion)
 */
export const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};
