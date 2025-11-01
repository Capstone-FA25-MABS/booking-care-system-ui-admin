import React from 'react';

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
    if (!isOpen) return null;

    const sizeClass = size === 'md' ? '' : `modal-${size}`;

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div
                className={`modal-dialog modal-dialog-centered ${sizeClass}`}
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <div className="modal-content">
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
