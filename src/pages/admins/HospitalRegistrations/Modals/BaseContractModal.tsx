import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useModalEscape } from '@/hooks/useModalEscape';

interface BaseContractModalProps {
    isOpen: boolean;
    hospitalName: string;
    registrationId: string;
    onClose: () => void;
    onSuccess: () => void;
    title: string;
    submitButtonText: string;
    submitButtonClass?: string;
    fileLabel: string;
    errorMessage: string;
    onSubmit: (
        registrationId: string,
        contractFile: File
    ) => Promise<{ success: boolean; message?: string }>;
    additionalContent?: React.ReactNode;
}

const BaseContractModal: React.FC<BaseContractModalProps> = ({
    isOpen,
    hospitalName,
    registrationId,
    onClose,
    onSuccess,
    title,
    submitButtonText,
    submitButtonClass = 'btn btn-primary',
    fileLabel,
    errorMessage,
    onSubmit,
    additionalContent,
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
            toast.error(errorMessage, { position: 'top-right' });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await onSubmit(registrationId, contractFile);

            if (response.success) {
                toast.success(response.message || 'Thành công', {
                    position: 'top-right',
                });
                handleCloseWithCleanup();
                onSuccess();
            } else {
                toast.error(response.message || 'Có lỗi xảy ra', {
                    position: 'top-right',
                });
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Có lỗi xảy ra khi xử lý yêu cầu', {
                position: 'top-right',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <p>
                                    <strong>Bệnh viện:</strong> {hospitalName}
                                </p>
                            </div>
                            {additionalContent}
                            <div className="mb-3">
                                <label htmlFor="contractFile" className="form-label">
                                    {fileLabel} <span className="text-danger">*</span>
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
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className={submitButtonClass}
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
                                    submitButtonText
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BaseContractModal;
