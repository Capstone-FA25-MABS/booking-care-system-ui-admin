import React from 'react';
import {
    DoctorScheduleException,
    ServiceMedicalScheduleException,
    ExceptionRequestStatus,
} from '@/types/schedule.types';
import styles from './ExceptionRequestCard.module.scss';

interface ExceptionRequestCardProps {
    exception: DoctorScheduleException | ServiceMedicalScheduleException;
    type: 'doctor' | 'service';
    requesterName?: string;
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
    onCancel?: (id: string) => void;
    showActions?: boolean;
}

const ExceptionRequestCard: React.FC<ExceptionRequestCardProps> = ({
    exception,
    type,
    requesterName = 'N/A',
    onApprove,
    onReject,
    onCancel,
    showActions = true,
}) => {
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case ExceptionRequestStatus.PENDING:
                return 'badge-warning';
            case ExceptionRequestStatus.APPROVED:
                return 'badge-success';
            case ExceptionRequestStatus.REJECTED:
                return 'badge-danger';
            case ExceptionRequestStatus.CANCELLED:
                return 'badge-secondary';
            default:
                return 'badge-secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case ExceptionRequestStatus.PENDING:
                return 'Chờ duyệt';
            case ExceptionRequestStatus.APPROVED:
                return 'Đã duyệt';
            case ExceptionRequestStatus.REJECTED:
                return 'Từ chối';
            case ExceptionRequestStatus.CANCELLED:
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const isFullDayOff = !exception.appointmentTime;
    const isPending = exception.status === ExceptionRequestStatus.PENDING;

    return (
        <div className={`${styles.exceptionCard} card mb-3`}>
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="card-title mb-1">
                            {type === 'doctor' ? (
                                <>
                                    <i className="ti ti-stethoscope me-2 text-primary"></i>
                                    Bác sĩ: {requesterName}
                                </>
                            ) : (
                                <>
                                    <i className="ti ti-medical-cross me-2 text-info"></i>
                                    Dịch vụ: {requesterName}
                                </>
                            )}
                        </h5>
                        <p className="text-muted small mb-0">
                            Tạo lúc: {new Date(exception.createdAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(exception.status)}`}>
                        {getStatusText(exception.status)}
                    </span>
                </div>

                <div className={styles.exceptionDetails}>
                    <div className="row mb-2">
                        <div className="col-md-6">
                            <strong>
                                <i className="ti ti-calendar me-2"></i>Ngày nghỉ:
                            </strong>
                            <p className="mb-0">{formatDate(exception.exceptionDate)}</p>
                        </div>
                        <div className="col-md-6">
                            <strong>
                                <i className="ti ti-clock me-2"></i>Thời gian:
                            </strong>
                            <p className="mb-0">
                                {isFullDayOff ? (
                                    <span className="badge bg-warning text-dark">Cả ngày</span>
                                ) : (
                                    <span className="badge bg-info">
                                        {exception.appointmentTime}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    {exception.reason && (
                        <div className="mb-2">
                            <strong>
                                <i className="ti ti-message me-2"></i>Lý do:
                            </strong>
                            <p className="mb-0 text-muted">{exception.reason}</p>
                        </div>
                    )}

                    {exception.reviewComments && (
                        <div className="alert alert-info mb-0 mt-2">
                            <strong>
                                <i className="ti ti-message-circle me-2"></i>Nhận xét:
                            </strong>
                            <p className="mb-0">{exception.reviewComments}</p>
                            {exception.reviewedAt && (
                                <small className="text-muted d-block mt-1">
                                    Đánh giá lúc:{' '}
                                    {new Date(exception.reviewedAt).toLocaleString('vi-VN')}
                                </small>
                            )}
                        </div>
                    )}
                </div>

                {showActions && isPending && (
                    <div className="d-flex gap-2 mt-3">
                        {onApprove && (
                            <button
                                className="btn btn-success btn-sm"
                                onClick={() => onApprove(exception.id)}
                            >
                                <i className="ti ti-check me-1"></i>
                                Phê duyệt
                            </button>
                        )}
                        {onReject && (
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => onReject(exception.id)}
                            >
                                <i className="ti ti-x me-1"></i>
                                Từ chối
                            </button>
                        )}
                        {onCancel && (
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => onCancel(exception.id)}
                            >
                                <i className="ti ti-ban me-1"></i>
                                Hủy yêu cầu
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExceptionRequestCard;
