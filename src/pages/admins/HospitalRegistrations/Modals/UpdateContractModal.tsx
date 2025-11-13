import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { updateContractFile } from '@/services/hospital-registration.service';
import { useModalEscape } from '@/hooks/useModalEscape';
import BaseModal from '@/components/Modal/BaseModal';

interface UpdateContractModalProps {
    isOpen: boolean;
    hospitalName: string;
    registrationId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const UpdateContractModal: React.FC<UpdateContractModalProps> = ({
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
            toast.error('Vui lòng chọn file hợp đồng mới', { position: 'top-right' });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await updateContractFile(registrationId, contractFile);

            if (response.success) {
                toast.success(response.message || 'Cập nhật file hợp đồng thành công', {
                    position: 'top-right',
                    autoClose: 5000,
                });
                onSuccess();
                onClose();
                setContractFile(null);
            } else {
                toast.error(response.message || 'Có lỗi xảy ra khi cập nhật file hợp đồng', {
                    position: 'top-right',
                });
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra khi cập nhật file hợp đồng';

            toast.error(errorMessage, {
                position: 'top-right',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BaseModal
            isOpen={isOpen}
            title="Cập nhật file hợp đồng"
            titleId="update-contract-modal-title"
            onClose={handleClose}
        >
            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <p className="mb-3">
                        <strong>Bệnh viện:</strong> {hospitalName}
                    </p>
                    <div className="alert alert-warning">
                        <i className="ti ti-alert-triangle me-2"></i>
                        Bạn đang cập nhật lại file hợp đồng cho đơn đăng ký đã được phê duyệt. File
                        mới sẽ thay thế file hợp đồng hiện tại.
                    </div>
                    <div className="mb-3">
                        <label htmlFor="contractFile" className="form-label">
                            File hợp đồng mới <span className="text-danger">*</span>
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
                            <i className="ti ti-file-check me-2"></i> Đã chọn: {contractFile.name}
                        </output>
                    )}
                </div>
                <div className="modal-footer">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleClose}
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || !contractFile}
                    >
                        {isSubmitting ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    aria-hidden="true"
                                ></span>{' '}
                                Đang cập nhật...
                            </>
                        ) : (
                            <>
                                <i className="ti ti-edit me-2"></i> Cập nhật
                            </>
                        )}
                    </button>
                </div>
            </form>
        </BaseModal>
    );
};

export default UpdateContractModal;
