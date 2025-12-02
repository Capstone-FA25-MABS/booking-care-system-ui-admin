import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set up a timer to update the debounced value after the delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timer if value or delay changes
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
