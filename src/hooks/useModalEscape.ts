import { useEffect, useCallback } from 'react';

/**
 * Custom hook to handle ESC key press for modals
 * @param isOpen - Whether the modal is open
 * @param onClose - Function to call when ESC is pressed
 * @param isSubmitting - Optional flag to prevent closing while submitting
 */
export const useModalEscape = (
    isOpen: boolean,
    onClose: () => void,
    isSubmitting: boolean = false
) => {
    const handleClose = useCallback(() => {
        if (!isSubmitting) {
            onClose();
        }
    }, [isSubmitting, onClose]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, isSubmitting, handleClose]);

    return handleClose;
};
