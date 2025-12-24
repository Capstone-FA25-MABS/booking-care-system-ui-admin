import React, { useEffect } from 'react';

interface BaseModalProps {
    isOpen: boolean;
    title: string;
    titleId: string;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const BaseModal: React.FC<BaseModalProps> = ({
    isOpen,
    title,
    titleId,
    onClose,
    children,
    size = 'md',
}) => {
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            // Save current overflow style
            const originalStyle = globalThis.getComputedStyle(document.body).overflow;
            // Prevent scrolling
            document.body.style.overflow = 'hidden';

            // Cleanup function to restore scroll
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClass = size === 'md' ? '' : `modal-${size}`;

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <button
                type="button"
                className="position-absolute w-100 h-100 border-0 bg-transparent"
                style={{ cursor: 'default' }}
                onClick={onClose}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
                aria-label="Close modal backdrop"
            />
            <div
                className={`modal-dialog modal-dialog-centered ${sizeClass}`}
                aria-modal="true"
                aria-labelledby={titleId}
                style={{ maxHeight: '90vh' }}
            >
                <div
                    className="modal-content"
                    style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
                >
                    <div className="modal-header">
                        <h5 className="modal-title" id={titleId}>
                            {title}
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BaseModal;
