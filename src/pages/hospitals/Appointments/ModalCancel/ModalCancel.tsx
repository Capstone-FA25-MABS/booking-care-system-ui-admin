import React, { useState, useEffect } from 'react';

interface ModalCancelProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (reason: string, rescheduleOptions?: RescheduleOptions) => void;
    onAssignDoctor?: () => void; // Callback to trigger assign doctor modal (actual cancellation happens after successful assignment)
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    itemName?: string;
    reasonLabel?: string;
    reasonPlaceholder?: string;
    minReasonLength?: number;
    showRescheduleOptions?: boolean; // Enable reschedule options for staff
    hasDoctorAssigned?: boolean; // Whether the appointment has a doctor (not service-based)
    consultationFees?: number; // For checking if refund option should be shown
}

export interface RescheduleOptions {
    enableSameDoctorReschedule: boolean;
    enableNewDoctorAssignment: boolean;
    enableDoctorSelection: boolean;
    enableRefundRequest: boolean;
}

export const ModalCancel: React.FC<ModalCancelProps> = ({
    show,
    onHide,
    onConfirm,
    onAssignDoctor,
    title = 'Xác Nhận Hủy',
    message = 'Bạn có chắc chắn muốn hủy?',
    confirmText = 'Có, Hủy',
    cancelText = 'Đóng',
    loading = false,
    itemName = '',
    reasonLabel = 'Lý do hủy',
    reasonPlaceholder = 'Vui lòng nhập lý do hủy...',
    minReasonLength = 10,
    showRescheduleOptions = false,
    hasDoctorAssigned = true, // Default true for backward compatibility
    consultationFees = 0, // Default to 0 (no refund option)
}) => {
    const [cancelReason, setCancelReason] = useState('');
    const [error, setError] = useState('');

    // Reschedule options state (conditionally enabled based on doctor assignment and payment)
    const [rescheduleOptions, setRescheduleOptions] = useState<RescheduleOptions>({
        enableSameDoctorReschedule: hasDoctorAssigned,
        enableNewDoctorAssignment: hasDoctorAssigned,
        enableDoctorSelection: true,
        enableRefundRequest: (consultationFees ?? 0) > 0, // Only show if patient has paid
    });

    // Reset state when modal opens/closes or when hasDoctorAssigned/consultationFees changes
    useEffect(() => {
        if (show) {
            setCancelReason('');
            setError('');
            setRescheduleOptions({
                enableSameDoctorReschedule: hasDoctorAssigned,
                enableNewDoctorAssignment: hasDoctorAssigned,
                enableDoctorSelection: true,
                enableRefundRequest: (consultationFees ?? 0) > 0, // Only show if patient has paid
            });
        }
    }, [show, hasDoctorAssigned, consultationFees]);

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

        // Call parent callback with reason and reschedule options
        onConfirm(cancelReason.trim(), showRescheduleOptions ? rescheduleOptions : undefined);
    };

    const handleOptionToggle = (option: keyof RescheduleOptions) => {
        setRescheduleOptions((prev) => ({
            ...prev,
            [option]: !prev[option],
        }));
    };

    const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCancelReason(e.target.value);
        if (error) {
            setError('');
        }
    };

    // Only hide cancel reason & confirm button when staff is assigning new doctor (Option 2)
    // Other options (1, 3, 4) still need cancellation reason
    const isAssigningNewDoctor =
        showRescheduleOptions && rescheduleOptions.enableNewDoctorAssignment;

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

                            {/* Cancellation Reason Textarea - Hide only when assigning new doctor (Option 2) */}
                            {!isAssigningNewDoctor && (
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
                                        {cancelReason.length}/500 ký tự (tối thiểu {minReasonLength}
                                        )
                                    </div>
                                    {error && (
                                        <div className="invalid-feedback d-block">{error}</div>
                                    )}
                                </div>
                            )}

                            {/* Reschedule Options - Only for Staff */}
                            {showRescheduleOptions && (
                                <div className="text-start mb-3 p-3 border rounded bg-light">
                                    <h6 className="fw-bold mb-3">
                                        <i className="ti ti-calendar-event me-2"></i>
                                        Tùy chọn đổi lịch cho bệnh nhân
                                    </h6>
                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="option-same-doctor"
                                            checked={rescheduleOptions.enableSameDoctorReschedule}
                                            onChange={() =>
                                                handleOptionToggle('enableSameDoctorReschedule')
                                            }
                                            disabled={loading || !hasDoctorAssigned}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="option-same-doctor"
                                        >
                                            <strong>1. Đổi lịch với cùng bác sĩ</strong>
                                            <br />
                                            <small className="text-muted">
                                                Bệnh nhân chọn ngày/giờ khác với cùng bác sĩ
                                            </small>
                                            {!hasDoctorAssigned && (
                                                <>
                                                    <br />
                                                    <small className="text-danger">
                                                        <i className="ti ti-alert-circle me-1"></i>
                                                        Không áp dụng cho lịch hẹn dịch vụ (không có
                                                        bác sĩ)
                                                    </small>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="option-new-doctor"
                                            checked={rescheduleOptions.enableNewDoctorAssignment}
                                            onChange={() =>
                                                handleOptionToggle('enableNewDoctorAssignment')
                                            }
                                            disabled={loading || !hasDoctorAssigned}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="option-new-doctor"
                                        >
                                            <strong>2. Bệnh viện gán bác sĩ mới</strong>
                                            <br />
                                            <small className="text-muted">
                                                Bệnh viện gán bác sĩ khác cùng chuyên khoa
                                            </small>
                                            {!hasDoctorAssigned && (
                                                <>
                                                    <br />
                                                    <small className="text-danger">
                                                        <i className="ti ti-alert-circle me-1"></i>
                                                        Không áp dụng cho lịch hẹn dịch vụ (không có
                                                        bác sĩ)
                                                    </small>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    <div className="form-check mb-2">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="option-choose-doctor"
                                            checked={rescheduleOptions.enableDoctorSelection}
                                            onChange={() =>
                                                handleOptionToggle('enableDoctorSelection')
                                            }
                                            disabled={loading}
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor="option-choose-doctor"
                                        >
                                            <strong>3. Bệnh nhân tự chọn bác sĩ khác</strong>
                                            <br />
                                            <small className="text-muted">
                                                Bệnh nhân chọn bác sĩ khác cùng bệnh viện/chuyên
                                                khoa
                                            </small>
                                        </label>
                                    </div>
                                    {/* Option 4: Only show if patient has paid (consultationFees > 0) */}
                                    {(consultationFees ?? 0) > 0 && (
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="option-refund"
                                                checked={rescheduleOptions.enableRefundRequest}
                                                onChange={() =>
                                                    handleOptionToggle('enableRefundRequest')
                                                }
                                                disabled={loading}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="option-refund"
                                            >
                                                <strong>4. Yêu cầu hoàn tiền</strong>
                                                <br />
                                                <small className="text-muted">
                                                    Bệnh nhân yêu cầu hoàn lại tiền đặt cọc (
                                                    {(consultationFees ?? 0).toLocaleString(
                                                        'vi-VN'
                                                    )}{' '}
                                                    đ )
                                                </small>
                                            </label>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="d-flex justify-content-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-light"
                                    onClick={onHide}
                                    disabled={loading}
                                >
                                    {cancelText}
                                </button>

                                {/* Show "Assign Doctor" button if option 2 is enabled and has doctor */}
                                {showRescheduleOptions &&
                                    rescheduleOptions.enableNewDoctorAssignment &&
                                    hasDoctorAssigned &&
                                    onAssignDoctor && (
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={onAssignDoctor}
                                            disabled={loading}
                                        >
                                            <i className="ti ti-user-check me-1"></i>
                                            Gán bác sĩ mới
                                        </button>
                                    )}

                                {/* Show "Confirm Cancel" button - Hide only when assigning new doctor (Option 2) */}
                                {!isAssigningNewDoctor && (
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
                                )}
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
