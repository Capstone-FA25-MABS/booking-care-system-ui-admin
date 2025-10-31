import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { approveRegistration } from '@/services/hospital-registration.service';
import { useModalEscape } from '@/hooks/useModalEscape';

interface ApprovalModalProps {
    isOpen: boolean;
    hospitalName: string;
    registrationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
    isOpen,
    hospitalName,
    registrationId,
    onClose,
    onSuccess,
}) => {
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCloseWithCleanup = () => {
        setContractFile(null);
        onClose();
    };

    const handleClose = useModalEscape(isOpen, handleCloseWithCleanup, isSubmitting);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setContractFile(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contractFile) {
            toast.error('Vui lòng chọn file hợp đồng', { position: 'top-right' });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await approveRegistration(registrationId, contractFile);
            console.log(response);
            if (response.success) {
                toast.success(
                    response.message ||
                        'Đơn đăng ký đã được phê duyệt thành công. Hệ thống đang tạo tài khoản cho bệnh viện...',
                    {
                        position: 'top-right',
                        autoClose: 7000,
                    }
                );
                onSuccess();
                onClose();
                setContractFile(null);
            } else {
                toast.error(response.message || 'Có lỗi xảy ra khi phê duyệt đơn đăng ký', {
                    position: 'top-right',
                });
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra khi phê duyệt đơn đăng ký';

            toast.error(errorMessage, {
                position: 'top-right',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
            <div
                className="modal-dialog modal-dialog-centered"
                aria-modal="true"
                aria-labelledby="approval-modal-title"
            >
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="approval-modal-title">
                            Phê Duyệt Đơn Đăng Ký
                        </h5>
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
                            <div className="alert alert-info">
                                <i className="ti ti-info-circle me-2"></i> Sau khi phê duyệt, hệ
                                thống sẽ tự động tạo tài khoản cho bệnh viện và gửi email thông tin
                                đăng nhập.
                            </div>
                            <div className="mb-3">
                                <label htmlFor="contractFile" className="form-label">
                                    Hợp đồng hợp tác <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="contractFile"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                    required
                                />
                                <small className="text-muted">
                                    Chấp nhận file: PDF, DOC, DOCX (Tối đa 10MB)
                                </small>
                            </div>
                            {contractFile && (
                                <output className="alert alert-success" aria-live="polite">
                                    <i className="ti ti-file-check me-2"></i> Đã chọn:{' '}
                                    {contractFile.name}
                                </output>
                            )}
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
                                className="btn btn-success"
                                disabled={isSubmitting || !contractFile}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            aria-hidden="true"
                                        ></span>{' '}
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <i className="ti ti-check me-2"></i> Phê Duyệt
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

export default ApprovalModal;
