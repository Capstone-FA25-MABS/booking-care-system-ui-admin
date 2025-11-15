/**
 * Suppress known React errors that don't affect functionality
 * These errors are typically caused by DOM library conflicts (Bootstrap/Simplebar)
 * with React Strict Mode in development
 */

if (process.env.NODE_ENV === 'development') {
    // Store original console.error
    const originalConsoleError = console.error;

    // Override console.error to filter out removeChild errors
    console.error = (...args: any[]) => {
        // Check all arguments for removeChild error
        const errorString = args
            .map((arg) => {
                if (typeof arg === 'string') return arg;
                if (arg instanceof Error) return arg.message + ' ' + arg.name;
                if (arg?.toString) return arg.toString();
                return '';
            })
            .join(' ');

        const isRemoveChildError =
            errorString.includes('removeChild') &&
            (errorString.includes('not a child of this node') ||
                errorString.includes('NotFoundError'));

        if (isRemoveChildError) {
            // Suppress this specific error - it's a known issue with React Strict Mode + DOM libraries
            // Optionally log a warning instead (commented out to fully suppress)
            // console.warn('[Suppressed] removeChild error (React Strict Mode + DOM libraries conflict)');
            return;
        }

        // Call original console.error for all other errors
        originalConsoleError.apply(console, args);
    };

    // Also suppress React's onUncaughtError for removeChild errors
    const originalOnUncaughtError = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__?.onUncaughtError;
    if (originalOnUncaughtError) {
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onUncaughtError = (
            error: Error,
            errorInfo: any
        ) => {
            if (error.name === 'NotFoundError' && error.message.includes('removeChild')) {
                // Suppress removeChild errors
                return;
            }
            originalOnUncaughtError(error, errorInfo);
        };
    }

    // Override window.onerror to catch and suppress removeChild errors
    const originalOnError = window.onerror;
    window.onerror = (
        message: string | Event,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error
    ) => {
        if (error?.name === 'NotFoundError' && error?.message?.includes('removeChild')) {
            // Suppress removeChild errors
            return true; // Return true to prevent default error handling
        }

        if (originalOnError) {
            return originalOnError(message, source, lineno, colno, error);
        }
        return false;
    };

    // Override window.onunhandledrejection for promise rejections
    const originalOnUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function (event: PromiseRejectionEvent) {
        if (
            event.reason?.name === 'NotFoundError' &&
            event.reason?.message?.includes('removeChild')
        ) {
            // Suppress removeChild errors in promises
            event.preventDefault();
            return;
        }

        if (originalOnUnhandledRejection) {
            originalOnUnhandledRejection.call(window, event);
        }
    };
}
