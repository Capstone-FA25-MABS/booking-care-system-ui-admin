import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TableSkeleton from '@/components/TableSkeleton';
import Pagination from '@/components/Pagination';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import {
    DoctorScheduleExceptionWithInfo,
    ExceptionRequestStatus,
    ExceptionType,
    ReviewExceptionRequest,
    AppointmentTime,
} from '@/types/schedule.types';
import { ScheduleService } from '@/services/schedule.service';
import { RootState } from '@/store';
import styles from './ExceptionRequestsManagement.module.scss';

// Import default avatar
import defaultAvatar from '@/assets/img/users/user-01.jpg';

// Skeleton columns for table
const tableColumns = [
    { type: 'avatar' as const, width: 200 },
    { type: 'badge' as const, width: 150 },
    { type: 'badge' as const, width: 120 },
    { type: 'text' as const, width: 180 },
    { type: 'actions' as const, items: 3 },
];

// Helper to get exception type display name
const getExceptionTypeDisplayName = (type: ExceptionType): string => {
    const typeNames: Record<ExceptionType, string> = {
        [ExceptionType.DAY_OFF]: 'Nghỉ cả ngày',
        [ExceptionType.BLOCK_SLOT]: 'Khóa khung giờ',
        [ExceptionType.UNBLOCK_SLOT]: 'Mở khung giờ',
        [ExceptionType.CAPACITY_CHANGE]: 'Thay đổi số lượng',
    };
    return typeNames[type] || type;
};

// Helper to get appointment time display
const getAppointmentTimeDisplay = (time?: AppointmentTime): string => {
    if (!time) return 'Cả ngày';
    const match = time.match(/AT_(\d{2})_(\d{2})_(\d{2})_(\d{2})/);
    if (match) {
        return `${match[1]}:${match[2]} - ${match[3]}:${match[4]}`;
    }
    return time;
};

const ExceptionRequestsManagement: React.FC = () => {
    const [exceptions, setExceptions] = useState<DoctorScheduleExceptionWithInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [reviewingId, setReviewingId] = useState<string | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedException, setSelectedException] =
        useState<DoctorScheduleExceptionWithInfo | null>(null);
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
    const [reviewComments, setReviewComments] = useState('');
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;

    // Get hospitalId from user profile (Staff role)
    const hospitalProfile = useSelector((state: RootState) => state.user.hospitalProfile);
    const hospitalId = hospitalProfile?.id;

    // Load pending exception requests
    const loadExceptions = useCallback(async () => {
        if (!hospitalId) return;

        try {
            setLoading(true);
            const response = await ScheduleService.getPendingDoctorExceptions(hospitalId);
            const data = response.data || [];
            setExceptions(data);
            setTotalCount(data.length);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    }, [hospitalId]);

    useEffect(() => {
        if (hospitalId) {
            loadExceptions();
        }
    }, [loadExceptions, hospitalId]);

    // Handle quick review (inline approve/reject)
    const handleQuickReview = async (
        exception: DoctorScheduleExceptionWithInfo,
        action: 'approve' | 'reject'
    ) => {
        const reviewRequest: ReviewExceptionRequest = {
            exceptionId: exception.id,
            status:
                action === 'approve'
                    ? ExceptionRequestStatus.APPROVED
                    : ExceptionRequestStatus.REJECTED,
        };

        try {
            setReviewingId(exception.id);
            await ScheduleService.reviewDoctorException(reviewRequest);
            toast.success(action === 'approve' ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu');
            loadExceptions();
        } catch (error: any) {
            toast.error(error.message || 'Không thể xử lý yêu cầu');
        } finally {
            setReviewingId(null);
        }
    };

    // Handle review request with modal (for adding comments)
    const handleReviewRequest = async () => {
        if (!selectedException) return;

        const reviewRequest: ReviewExceptionRequest = {
            exceptionId: selectedException.id,
            status:
                reviewAction === 'approve'
                    ? ExceptionRequestStatus.APPROVED
                    : ExceptionRequestStatus.REJECTED,
            reviewComments: reviewComments.trim() || undefined,
        };

        try {
            setReviewingId(selectedException.id);
            await ScheduleService.reviewDoctorException(reviewRequest);
            toast.success(
                reviewAction === 'approve' ? 'Đã phê duyệt yêu cầu' : 'Đã từ chối yêu cầu'
            );
            setShowReviewModal(false);
            setSelectedException(null);
            setReviewComments('');
            loadExceptions();
        } catch (error: any) {
            toast.error(error.message || 'Không thể xử lý yêu cầu');
        } finally {
            setReviewingId(null);
        }
    };

    const handleOpenReviewModal = (
        exception: DoctorScheduleExceptionWithInfo,
        action: 'approve' | 'reject'
    ) => {
        setSelectedException(exception);
        setReviewAction(action);
        setReviewComments('');
        setShowReviewModal(true);
    };

    // Statistics
    const pendingCount = exceptions.filter(
        (e) => e.status === ExceptionRequestStatus.PENDING
    ).length;

    // Metrics for MetricCard components
    const metrics = useMemo(
        () => [
            {
                label: 'Chờ duyệt',
                value: pendingCount,
                sub: 'Yêu cầu đang chờ xử lý',
                className: styles.pending,
                icon: 'ti ti-clock',
            },
            {
                label: 'Tổng yêu cầu',
                value: totalCount,
                sub: 'Tất cả yêu cầu trong hệ thống',
                className: styles.total,
                icon: 'ti ti-list',
            },
            {
                label: 'Loại yêu cầu',
                value: 0,
                sub: 'Yêu cầu từ bác sĩ',
                className: styles.requestType,
                icon: 'ti ti-user-heart',
            },
        ],
        [pendingCount, totalCount]
    );

    // Pagination
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedExceptions = exceptions.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
    );

    // Render table body
    const renderTableBody = () => {
        if (loading) {
            return <TableSkeleton rows={pageSize} columns={tableColumns} />;
        }

        if (paginatedExceptions.length === 0) {
            return (
                <tr>
                    <td colSpan={6} className="text-center py-5">
                        <i className="ti ti-file-check fs-1 text-muted"></i>
                        <p className="mt-2 text-muted">Không có yêu cầu nào cần xử lý</p>
                    </td>
                </tr>
            );
        }

        return paginatedExceptions.map((exception) => {
            const isReviewing = reviewingId === exception.id;
            const isPending = exception.status === ExceptionRequestStatus.PENDING;

            return (
                <tr key={exception.id}>
                    {/* Bác sĩ */}
                    <td>
                        <div className="d-flex align-items-center">
                            <span className="avatar avatar-md me-2">
                                <img
                                    src={exception.doctorAvatarUrl || defaultAvatar}
                                    alt={exception.doctorName}
                                    className="rounded-circle"
                                />
                            </span>
                            <div>
                                <span className="fw-semibold d-block">{exception.doctorName}</span>
                                {exception.doctorEmail && (
                                    <span className="text-body fs-13 fw-normal d-block">
                                        {exception.doctorEmail}
                                    </span>
                                )}
                            </div>
                        </div>
                    </td>
                    {/* Ngày / Khung giờ */}
                    <td>
                        {new Date(exception.exceptionDate).toLocaleDateString('vi-VN', {
                            weekday: 'short',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                        {' | '}
                        {getAppointmentTimeDisplay(exception.appointmentTime)}
                    </td>
                    {/* Loại yêu cầu */}
                    <td>
                        <span
                            className={`badge ${exception.exceptionType === ExceptionType.DAY_OFF ? 'bg-danger-transparent text-danger' : 'bg-warning-transparent text-warning'}`}
                        >
                            {getExceptionTypeDisplayName(exception.exceptionType)}
                        </span>
                    </td>
                    {/* Lý do */}
                    <td>
                        <span
                            className="text-muted text-truncate d-inline-block"
                            style={{ maxWidth: '200px' }}
                            title={exception.reason || ''}
                        >
                            {exception.reason || '-'}
                        </span>
                    </td>
                    {/* Trạng thái */}
                    <td>
                        <span className="badge bg-warning-transparent text-warning">Chờ duyệt</span>
                    </td>
                    {/* Actions */}
                    {isPending && (
                        <td className="action-item">
                            <button
                                type="button"
                                className="btn btn-link p-0"
                                data-bs-toggle="dropdown"
                                aria-label="Mở menu hành động"
                            >
                                <i className="ti ti-dots-vertical"></i>
                            </button>
                            <ul className="dropdown-menu p-2">
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-success"
                                        onClick={() => handleQuickReview(exception, 'approve')}
                                        disabled={isReviewing}
                                    >
                                        <i className="ti ti-check me-2" aria-hidden="true"></i>
                                        Phê duyệt
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-danger"
                                        onClick={() => handleOpenReviewModal(exception, 'reject')}
                                        disabled={isReviewing}
                                    >
                                        <i className="ti ti-x me-2" aria-hidden="true"></i>
                                        Từ chối
                                    </button>
                                </li>
                            </ul>
                        </td>
                    )}
                </tr>
            );
        });
    };

    // Show loading if hospital profile not loaded yet
    if (!hospitalId) {
        return (
            <div className="content">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải thông tin bệnh viện...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="content">
                {/* Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-semibold mb-0">
                            <i className="ti ti-file-alert me-2"></i>
                            Quản lý yêu cầu nghỉ / thay đổi lịch
                        </h4>
                    </div>
                </div>

                {/* Statistics Cards using MetricCard component */}
                <div className={styles.dashboardSection}>
                    <div className={`${styles.metricsGrid} ${styles.overviewGrid}`}>
                        {loading
                            ? [1, 2, 3].map((i) => <MetricCardSkeleton key={i} />)
                            : metrics.map((metric, index) => (
                                  <MetricCard
                                      key={index}
                                      label={metric.label}
                                      value={metric.value}
                                      sub={metric.sub}
                                      className={metric.className}
                                      icon={metric.icon}
                                  />
                              ))}
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table datatable table-nowrap">
                        <thead>
                            <tr>
                                <th className="no-sort">Bác sĩ</th>
                                <th>Ngày / Khung giờ</th>
                                <th>Loại yêu cầu</th>
                                <th>Lý do</th>
                                <th className="text-end">Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={pageNumber}
                totalPages={totalPages}
                onPageChange={setPageNumber}
            />

            {/* Review Modal - for reject with comments */}
            {showReviewModal && selectedException && (
                <>
                    <div className="modal fade show d-block" tabIndex={-1}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i
                                            className={`ti ${reviewAction === 'approve' ? 'ti-check text-success' : 'ti-x text-danger'} me-2`}
                                        ></i>
                                        {reviewAction === 'approve'
                                            ? 'Phê duyệt yêu cầu'
                                            : 'Từ chối yêu cầu'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowReviewModal(false);
                                            setSelectedException(null);
                                            setReviewComments('');
                                        }}
                                        disabled={reviewingId !== null}
                                        aria-label="Đóng"
                                    ></button>
                                </div>

                                <div className="modal-body">
                                    {/* Doctor Info */}
                                    <div className="d-flex align-items-center mb-3 p-3 bg-light rounded">
                                        <span className="avatar avatar-lg me-3">
                                            <img
                                                src={
                                                    selectedException.doctorAvatarUrl ||
                                                    defaultAvatar
                                                }
                                                alt={selectedException.doctorName}
                                                className="rounded-circle"
                                            />
                                        </span>
                                        <div>
                                            <h6 className="mb-1">{selectedException.doctorName}</h6>
                                            {selectedException.doctorEmail && (
                                                <small className="text-muted">
                                                    {selectedException.doctorEmail}
                                                </small>
                                            )}
                                        </div>
                                    </div>

                                    {/* Request Info */}
                                    <div className="alert alert-light mb-3">
                                        <div className="row">
                                            <div className="col-6">
                                                <small className="text-muted d-block">
                                                    Ngày yêu cầu
                                                </small>
                                                <strong>
                                                    {new Date(
                                                        selectedException.exceptionDate
                                                    ).toLocaleDateString('vi-VN', {
                                                        weekday: 'long',
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric',
                                                    })}
                                                </strong>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">
                                                    Loại yêu cầu
                                                </small>
                                                <span
                                                    className={`badge ${selectedException.exceptionType === ExceptionType.DAY_OFF ? 'bg-danger' : 'bg-warning'}`}
                                                >
                                                    {getExceptionTypeDisplayName(
                                                        selectedException.exceptionType
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedException.appointmentTime && (
                                            <div className="mt-2">
                                                <small className="text-muted d-block">
                                                    Khung giờ
                                                </small>
                                                <strong>
                                                    {getAppointmentTimeDisplay(
                                                        selectedException.appointmentTime
                                                    )}
                                                </strong>
                                            </div>
                                        )}
                                        {selectedException.reason && (
                                            <div className="mt-2">
                                                <small className="text-muted d-block">Lý do</small>
                                                <span>{selectedException.reason}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Review Comments */}
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Ghi chú{' '}
                                            {reviewAction === 'reject' && (
                                                <span className="text-danger">*</span>
                                            )}
                                        </label>
                                        <textarea
                                            className="form-control"
                                            rows={3}
                                            value={reviewComments}
                                            onChange={(e) => setReviewComments(e.target.value)}
                                            placeholder={
                                                reviewAction === 'approve'
                                                    ? 'Nhập ghi chú (không bắt buộc)...'
                                                    : 'Nhập lý do từ chối...'
                                            }
                                            required={reviewAction === 'reject'}
                                        />
                                    </div>

                                    {/* Warning */}
                                    <div
                                        className={`alert ${reviewAction === 'approve' ? 'alert-success' : 'alert-danger'} mb-0`}
                                    >
                                        <i className="ti ti-info-circle me-2"></i>
                                        {reviewAction === 'approve'
                                            ? 'Sau khi phê duyệt, bác sĩ sẽ được nghỉ/thay đổi lịch theo yêu cầu.'
                                            : 'Sau khi từ chối, bác sĩ sẽ nhận được thông báo và lịch làm việc không thay đổi.'}
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowReviewModal(false);
                                            setSelectedException(null);
                                            setReviewComments('');
                                        }}
                                        disabled={reviewingId !== null}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${reviewAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                                        onClick={handleReviewRequest}
                                        disabled={
                                            reviewingId !== null ||
                                            (reviewAction === 'reject' && !reviewComments.trim())
                                        }
                                    >
                                        {reviewingId !== null ? (
                                            <>
                                                <span
                                                    className="spinner-border spinner-border-sm me-2"
                                                    role="status"
                                                ></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                <i
                                                    className={`ti ${reviewAction === 'approve' ? 'ti-check' : 'ti-x'} me-1`}
                                                ></i>
                                                {reviewAction === 'approve'
                                                    ? 'Phê duyệt'
                                                    : 'Từ chối'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </>
    );
};

export default ExceptionRequestsManagement;
