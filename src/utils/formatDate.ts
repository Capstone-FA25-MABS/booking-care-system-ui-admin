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
