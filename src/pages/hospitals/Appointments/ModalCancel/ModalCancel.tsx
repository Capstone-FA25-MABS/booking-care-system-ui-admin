import React, { useState, useEffect } from 'react';

interface ModalCancelProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    itemName?: string;
    reasonLabel?: string;
    reasonPlaceholder?: string;
    minReasonLength?: number;
}

export const ModalCancel: React.FC<ModalCancelProps> = ({
    show,
    onHide,
    onConfirm,
    title = 'Xác Nhận Hủy',
    message = 'Bạn có chắc chắn muốn hủy?',
    confirmText = 'Có, Hủy',
    cancelText = 'Đóng',
    loading = false,
    itemName = '',
    reasonLabel = 'Lý do hủy',
    reasonPlaceholder = 'Vui lòng nhập lý do hủy...',
    minReasonLength = 10,
}) => {
    const [cancelReason, setCancelReason] = useState('');
    const [error, setError] = useState('');

    // Reset state when modal opens/closes
    useEffect(() => {
        if (show) {
            setCancelReason('');
            setError('');
        }
    }, [show]);

    const handleConfirm = () => {
        // Validate reason
        if (!cancelReason.trim()) {
            setError('Vui lòng nhập lý do hủy');
            return;
        }

        if (cancelReason.trim().length < minReasonLength) {
            setError(`Lý do hủy phải có ít nhất ${minReasonLength} ký tự`);
            return;
        }

        // Call parent callback with reason
        onConfirm(cancelReason.trim());
    };

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCancelReason(e.target.value);
        if (error) {
            setError('');
        }
    };

    if (!show) return null;

    return (
        <>
            <div
                className={`modal fade ${show ? 'show' : ''}`}
                id="cancel_modal"
                style={{ display: show ? 'block' : 'none' }}
                tabIndex={-1}
                aria-labelledby="cancel_modal_label"
                aria-hidden={!show}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onHide}
                                disabled={loading}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body text-center pt-0">
                            <div className="mb-3">
                                <span className="avatar avatar-lg bg-warning text-white">
                                    <i className="ti ti-x fs-24"></i>
                                </span>
                            </div>
                            <h5 className="fw-bold mb-1">{title}</h5>
                            <p className="mb-3">
                                {message}
                                {itemName && (
                                    <>
                                        {' '}
                                        <strong>{itemName}</strong>
                                    </>
                                )}
                                ?
                            </p>

                            {/* Cancellation Reason Textarea */}
                            <div className="text-start mb-3">
                                <label
                                    htmlFor="cancel-reason"
                                    className="form-label text-dark fw-medium"
                                >
                                    {reasonLabel} <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    id="cancel-reason"
                                    className={`form-control ${error ? 'is-invalid' : ''}`}
                                    rows={4}
                                    placeholder={reasonPlaceholder}
                                    value={cancelReason}
                                    onChange={handleReasonChange}
                                    disabled={loading}
                                    maxLength={500}
                                />
                                <div className="form-text">
                                    {cancelReason.length}/500 ký tự (tối thiểu {minReasonLength})
                                </div>
                                {error && <div className="invalid-feedback d-block">{error}</div>}
                            </div>

                            <div className="d-flex justify-content-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={onHide}
                                    disabled={loading}
                                >
                                    {cancelText}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning"
                                    onClick={handleConfirm}
                                    disabled={loading || !cancelReason.trim()}
                                >
                                    {loading ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                aria-hidden="true"
                                            ></span>{' '}
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        confirmText
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal backdrop */}
            {show && (
                <button
                    type="button"
                    className="modal-backdrop fade show border-0 p-0"
                    onClick={onHide}
                    aria-label="Close modal"
                    style={{ zIndex: 1040 }}
                ></button>
            )}
        </>
    );
};

export default ModalCancel;
