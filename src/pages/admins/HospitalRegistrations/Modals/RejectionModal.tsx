import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { rejectRegistration } from '@/services/hospital-registration.service';

interface RejectionModalProps {
    isOpen: boolean;
    hospitalName: string;
    registrationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
    isOpen,
    hospitalName,
    registrationId,
    onClose,
    onSuccess,
}) => {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason.trim()) {
            toast.error('Vui lòng nhập lý do từ chối', { position: 'top-right' });
            return;
        }

        if (reason.trim().length < 10) {
            toast.error('Lý do từ chối phải có ít nhất 10 ký tự', {
                position: 'top-right',
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await rejectRegistration(registrationId, reason.trim());

            if (response.success) {
                toast.success(
                    response.message || 'Đơn đăng ký đã bị từ chối. Email thông báo đã được gửi.',
                    {
                        position: 'top-right',
                        autoClose: 5000,
                    }
                );
                onSuccess();
                onClose();
                setReason('');
            } else {
                toast.error(response.message || 'Có lỗi xảy ra khi từ chối đơn đăng ký', {
                    position: 'top-right',
                });
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra khi từ chối đơn đăng ký';

            toast.error(errorMessage, {
                position: 'top-right',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setReason('');
            onClose();
        }
    };

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={handleClose}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Từ Chối Đơn Đăng Ký</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <p className="mb-3">
                                <strong>Bệnh viện:</strong> {hospitalName}
                            </p>
                            <div className="alert alert-warning">
                                <i className="ti ti-alert-triangle me-2"></i>
                                Bệnh viện sẽ nhận được email thông báo về lý do từ chối.
                            </div>
                            <div className="mb-3">
                                <label htmlFor="rejectionReason" className="form-label">
                                    Lý do từ chối <span className="text-danger">*</span>
                                </label>
                                <textarea
                                    className="form-control"
                                    id="rejectionReason"
                                    rows={5}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối đơn đăng ký..."
                                    maxLength={1000}
                                    required
                                />
                                <small className="text-muted">
                                    {reason.length}/1000 ký tự (Tối thiểu 10 ký tự)
                                </small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="btn btn-danger"
                                disabled={isSubmitting || reason.trim().length < 10}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        ></span>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <i className="ti ti-x me-2"></i>
                                        Từ Chối
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RejectionModal;
