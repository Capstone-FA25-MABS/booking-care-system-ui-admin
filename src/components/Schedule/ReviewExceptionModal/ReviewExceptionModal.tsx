import React, { useState } from 'react';
import { ExceptionRequestStatus } from '@/types/schedule.types';

interface ReviewExceptionModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (status: ExceptionRequestStatus, comments: string) => void;
    requesterName: string;
    exceptionDate: string;
    isLoading?: boolean;
}

const ReviewExceptionModal: React.FC<ReviewExceptionModalProps> = ({
    show,
    onClose,
    onSubmit,
    requesterName,
    exceptionDate,
    isLoading = false,
}) => {
    const [reviewStatus, setReviewStatus] = useState<ExceptionRequestStatus>(
        ExceptionRequestStatus.APPROVED
    );
    const [comments, setComments] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(reviewStatus, comments);
    };

    const handleClose = () => {
        setComments('');
        setReviewStatus(ExceptionRequestStatus.APPROVED);
        onClose();
    };

    if (!show) return null;

    return (
        <>
            <div className={`modal fade ${show ? 'show d-block' : ''}`} tabIndex={-1}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="ti ti-checklist me-2"></i>
                                Đánh giá yêu cầu nghỉ
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={handleClose}
                                disabled={isLoading}
                            ></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <div className="mb-2">
                                        <strong>Người yêu cầu:</strong> {requesterName}
                                    </div>
                                    <div>
                                        <strong>Ngày nghỉ:</strong>{' '}
                                        {new Date(exceptionDate).toLocaleDateString('vi-VN', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">
                                        Quyết định <span className="text-danger">*</span>
                                    </label>
                                    <div className="d-flex gap-3">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="reviewStatus"
                                                id="approveRadio"
                                                checked={
                                                    reviewStatus === ExceptionRequestStatus.APPROVED
                                                }
                                                onChange={() =>
                                                    setReviewStatus(ExceptionRequestStatus.APPROVED)
                                                }
                                                disabled={isLoading}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="approveRadio"
                                            >
                                                <i className="ti ti-check text-success me-1"></i>
                                                Phê duyệt
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="reviewStatus"
                                                id="rejectRadio"
                                                checked={
                                                    reviewStatus === ExceptionRequestStatus.REJECTED
                                                }
                                                onChange={() =>
                                                    setReviewStatus(ExceptionRequestStatus.REJECTED)
                                                }
                                                disabled={isLoading}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor="rejectRadio"
                                            >
                                                <i className="ti ti-x text-danger me-1"></i>
                                                Từ chối
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="reviewComments" className="form-label">
                                        Nhận xét
                                    </label>
                                    <textarea
                                        id="reviewComments"
                                        className="form-control"
                                        rows={4}
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder={
                                            reviewStatus === ExceptionRequestStatus.APPROVED
                                                ? 'Nhập nhận xét (không bắt buộc)...'
                                                : 'Nhập lý do từ chối...'
                                        }
                                        disabled={isLoading}
                                    />
                                    <small className="text-muted">Tối đa 500 ký tự</small>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className={`btn ${
                                        reviewStatus === ExceptionRequestStatus.APPROVED
                                            ? 'btn-success'
                                            : 'btn-danger'
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
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
                                            <i
                                                className={`ti ${
                                                    reviewStatus === ExceptionRequestStatus.APPROVED
                                                        ? 'ti-check'
                                                        : 'ti-x'
                                                } me-1`}
                                            ></i>
                                            {reviewStatus === ExceptionRequestStatus.APPROVED
                                                ? 'Phê duyệt'
                                                : 'Từ chối'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            {show && <div className="modal-backdrop fade show"></div>}
        </>
    );
};

export default ReviewExceptionModal;
