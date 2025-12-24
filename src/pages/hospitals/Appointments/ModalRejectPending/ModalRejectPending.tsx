import React, { useState, useEffect } from 'react';

interface ModalRejectPendingProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (reason: string, notifyPatient: boolean) => void;
    loading?: boolean;
    appointmentId?: string;
    patientName?: string;
}

/**
 * Modal for rejecting pending appointments (before payment)
 * Simpler than ModalCancel - no reschedule options needed
 */
export const ModalRejectPending: React.FC<ModalRejectPendingProps> = ({
    show,
    onHide,
    onConfirm,
    loading = false,
    appointmentId,
    patientName,
}) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [notifyPatient, setNotifyPatient] = useState(true);
    const [error, setError] = useState('');

    const MIN_REASON_LENGTH = 10;
    const MAX_REASON_LENGTH = 500;

    // Reset state when modal opens/closes
    useEffect(() => {
        if (show) {
            setRejectionReason('');
            setNotifyPatient(true);
            setError('');
        }
    }, [show]);

    const handleConfirm = () => {
        // Validate reason
        if (!rejectionReason.trim()) {
            setError('Vui lòng nhập lý do từ chối');
            return;
        }

        if (rejectionReason.trim().length < MIN_REASON_LENGTH) {
            setError(`Lý do từ chối phải có ít nhất ${MIN_REASON_LENGTH} ký tự`);
            return;
        }

        onConfirm(rejectionReason.trim(), notifyPatient);
    };

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setRejectionReason(e.target.value);
        if (error) {
            setError('');
        }
    };

    if (!show) return null;

    return (
        <>
            <div
                className={`modal fade ${show ? 'show' : ''}`}
                id="reject_pending_modal"
                style={{ display: show ? 'block' : 'none' }}
                tabIndex={-1}
                aria-labelledby="reject_pending_modal_label"
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
                                <span className="avatar avatar-lg bg-danger text-white">
                                    <i className="ti ti-x fs-24"></i>
                                </span>
                            </div>
                            <h5 className="fw-bold mb-1">Từ chối lịch hẹn</h5>
                            <p className="mb-3 text-muted">
                                Bạn có chắc chắn muốn từ chối lịch hẹn
                                {appointmentId && (
                                    <>
                                        {' '}
                                        <strong>#{appointmentId.substring(0, 8)}</strong>
                                    </>
                                )}
                                {patientName && (
                                    <>
                                        {' '}
                                        của bệnh nhân <strong>{patientName}</strong>
                                    </>
                                )}
                                ?
                            </p>

                            {/* Info alert - no refund needed */}
                            <div className="alert alert-info text-start mb-3">
                                <i className="ti ti-info-circle me-2" aria-hidden="true"></i>
                                <small>
                                    Lịch hẹn này chưa được thanh toán nên không cần xử lý hoàn tiền.
                                    Bệnh nhân sẽ được thông báo về việc từ chối.
                                </small>
                            </div>

                            {/* Rejection Reason Textarea */}
                            <div className="text-start mb-3">
                                <label
                                    htmlFor="rejection-reason"
                                    className="form-label text-dark fw-medium"
                                >
                                    Lý do từ chối <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    id="rejection-reason"
                                    className={`form-control ${error ? 'is-invalid' : ''}`}
                                    rows={4}
                                    placeholder="Vui lòng nhập lý do từ chối lịch hẹn (tối thiểu 10 ký tự)..."
                                    value={rejectionReason}
                                    onChange={handleReasonChange}
                                    disabled={loading}
                                    maxLength={MAX_REASON_LENGTH}
                                />
                                <div className="form-text">
                                    {rejectionReason.length}/{MAX_REASON_LENGTH} ký tự (tối thiểu{' '}
                                    {MIN_REASON_LENGTH})
                                </div>
                                {error && <div className="invalid-feedback d-block">{error}</div>}
                            </div>

                            {/* Notify Patient Checkbox */}
                            <div className="text-start mb-3">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="notify-patient"
                                        checked={notifyPatient}
                                        onChange={(e) => setNotifyPatient(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <label className="form-check-label" htmlFor="notify-patient">
                                        Gửi thông báo cho bệnh nhân
                                    </label>
                                </div>
                            </div>

                            <div className="d-flex justify-content-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={onHide}
                                    disabled={loading}
                                >
                                    Đóng
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleConfirm}
                                    disabled={loading || !rejectionReason.trim()}
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
                                        <>Từ chối lịch hẹn</>
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

export default ModalRejectPending;
