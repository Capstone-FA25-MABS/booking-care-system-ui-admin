import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TableSkeleton from '@/components/TableSkeleton';
import Pagination from '@/components/Pagination';
import ModalDelete from '@/components/ModalDelete/ModalDelete';
import TimeSlotSelector from '@/components/Schedule/TimeSlotSelector';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import {
    DoctorScheduleException,
    CreateDoctorScheduleExceptionRequest,
    ExceptionType,
    ExceptionRequestStatus,
    AppointmentTime,
} from '@/types/schedule.types';
import { ScheduleService } from '@/services/schedule.service';
import { RootState } from '@/store';
import styles from './RequestOff.module.scss';

// Skeleton columns for table
const tableColumns = [
    { type: 'badge' as const, width: 120 },
    { type: 'badge' as const, width: 100 },
    { type: 'text' as const, width: 150 },
    { type: 'badge' as const, width: 100 },
    { type: 'actions' as const, items: 1 },
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

// Helper to get status badge class
const getStatusBadgeClass = (status: ExceptionRequestStatus): string => {
    const statusColors: Record<ExceptionRequestStatus, string> = {
        [ExceptionRequestStatus.PENDING]: 'bg-warning',
        [ExceptionRequestStatus.APPROVED]: 'bg-success',
        [ExceptionRequestStatus.REJECTED]: 'bg-danger',
        [ExceptionRequestStatus.CANCELLED]: 'bg-secondary',
    };
    return statusColors[status] || 'bg-secondary';
};

// Helper to get status display name
const getStatusDisplayName = (status: ExceptionRequestStatus): string => {
    const statusNames: Record<ExceptionRequestStatus, string> = {
        [ExceptionRequestStatus.PENDING]: 'Chờ duyệt',
        [ExceptionRequestStatus.APPROVED]: 'Đã duyệt',
        [ExceptionRequestStatus.REJECTED]: 'Từ chối',
        [ExceptionRequestStatus.CANCELLED]: 'Đã hủy',
    };
    return statusNames[status] || status;
};

// Helper to get appointment time display
const getAppointmentTimeDisplay = (time?: AppointmentTime): string => {
    if (!time) return 'Cả ngày';
    // Convert AT_08_00_08_30 to 08:00 - 08:30
    const match = time.match(/AT_(\d{2})_(\d{2})_(\d{2})_(\d{2})/);
    if (match) {
        return `${match[1]}:${match[2]} - ${match[3]}:${match[4]}`;
    }
    return time;
};

const RequestOff: React.FC = () => {
    const [exceptions, setExceptions] = useState<DoctorScheduleException[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;

    // Get doctorId from Redux store
    const doctorProfile = useSelector((state: RootState) => state.user.doctorProfile);
    const doctorId = doctorProfile?.id || '';

    // Form states
    const [formData, setFormData] = useState<CreateDoctorScheduleExceptionRequest>({
        doctorId: '',
        exceptionDate: '',
        exceptionType: ExceptionType.DAY_OFF,
        isAvailable: false,
        appointmentTimes: [],
        reason: '',
    });

    // Update doctorId in form when profile loads
    useEffect(() => {
        if (doctorId) {
            setFormData((prev) => ({ ...prev, doctorId }));
        }
    }, [doctorId]);

    // Load my exception requests
    const loadMyExceptions = useCallback(async () => {
        if (!doctorId) return;

        try {
            setLoading(true);
            // Use getMyExceptionRequests to get all exceptions for this doctor (all statuses)
            const response = await ScheduleService.getMyExceptionRequests(doctorId);
            const data = response.data || [];
            setExceptions(data);
            setTotalCount(data.length);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    }, [doctorId]);

    useEffect(() => {
        if (doctorId) {
            loadMyExceptions();
        }
    }, [loadMyExceptions, doctorId]);

    // Handle create request
    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.exceptionDate) {
            toast.warning('Vui lòng chọn ngày');
            return;
        }

        if (!formData.reason || !formData.reason.trim()) {
            toast.warning('Vui lòng nhập lý do');
            return;
        }

        // Validate date is in the future
        const selectedDate = new Date(formData.exceptionDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            toast.warning('Ngày yêu cầu phải từ hôm nay trở đi');
            return;
        }

        // Validate appointment times for BLOCK_SLOT type
        if (
            formData.exceptionType === ExceptionType.BLOCK_SLOT &&
            (!formData.appointmentTimes || formData.appointmentTimes.length === 0)
        ) {
            toast.warning('Vui lòng chọn ít nhất một khung giờ');
            return;
        }

        try {
            setLoading(true);

            const requestData: CreateDoctorScheduleExceptionRequest = {
                doctorId,
                exceptionDate: formData.exceptionDate,
                exceptionType: formData.exceptionType,
                isAvailable: false, // Always false for day off / block slot
                reason: formData.reason.trim(),
                // Only include appointmentTimes for BLOCK_SLOT type
                appointmentTimes:
                    formData.exceptionType === ExceptionType.BLOCK_SLOT
                        ? formData.appointmentTimes
                        : undefined,
            };

            await ScheduleService.createDoctorException(requestData);
            toast.success('Gửi yêu cầu thành công. Vui lòng chờ nhân viên xét duyệt.');
            setShowCreateModal(false);
            resetForm();
            loadMyExceptions();
        } catch (error: any) {
            toast.error(error.message || 'Không thể gửi yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    // Handle cancel request
    const handleCancelRequest = async () => {
        if (!selectedExceptionId) return;

        try {
            setLoading(true);
            await ScheduleService.deleteDoctorException(selectedExceptionId);
            toast.success('Đã hủy yêu cầu');
            setShowCancelModal(false);
            setSelectedExceptionId(null);
            loadMyExceptions();
        } catch (error: any) {
            toast.error(error.message || 'Không thể hủy yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCancelModal = (exceptionId: string) => {
        setSelectedExceptionId(exceptionId);
        setShowCancelModal(true);
    };

    const resetForm = () => {
        setFormData({
            doctorId,
            exceptionDate: '',
            exceptionType: ExceptionType.DAY_OFF,
            isAvailable: false,
            appointmentTimes: [],
            reason: '',
        });
    };

    // Statistics
    const pendingCount = exceptions.filter(
        (e) => e.status === ExceptionRequestStatus.PENDING
    ).length;
    const approvedCount = exceptions.filter(
        (e) => e.status === ExceptionRequestStatus.APPROVED
    ).length;
    const rejectedCount = exceptions.filter(
        (e) => e.status === ExceptionRequestStatus.REJECTED
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
                label: 'Đã duyệt',
                value: approvedCount,
                sub: 'Yêu cầu được phê duyệt',
                className: styles.approved,
                icon: 'ti ti-check',
            },
            {
                label: 'Từ chối',
                value: rejectedCount,
                sub: 'Yêu cầu bị từ chối',
                className: styles.rejected,
                icon: 'ti ti-x',
            },
            {
                label: 'Tổng cộng',
                value: totalCount,
                sub: 'Tất cả yêu cầu',
                className: styles.total,
                icon: 'ti ti-list',
            },
        ],
        [pendingCount, approvedCount, rejectedCount, totalCount]
    );

    // Pagination
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedExceptions = exceptions.slice(
        (pageNumber - 1) * pageSize,
        pageNumber * pageSize
    );

    // Get minimum date for date picker (today)
    const getMinDate = (): string => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    // Render table body
    const renderTableBody = () => {
        if (loading) {
            return <TableSkeleton rows={pageSize} columns={tableColumns} />;
        }

        if (paginatedExceptions.length === 0) {
            return (
                <tr>
                    <td colSpan={5} className="text-center py-5">
                        <i className="ti ti-calendar-off fs-1 text-muted"></i>
                        <p className="mt-2 text-muted">
                            Bạn chưa có yêu cầu nào. Nhấn "Tạo yêu cầu mới" để bắt đầu.
                        </p>
                    </td>
                </tr>
            );
        }

        return paginatedExceptions.map((exception) => {
            const isPending = exception.status === ExceptionRequestStatus.PENDING;

            return (
                <tr key={exception.id}>
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
                        <span className={`badge ${getStatusBadgeClass(exception.status)}`}>
                            {getStatusDisplayName(exception.status)}
                        </span>
                        {exception.reviewedAt && (
                            <span className="text-body fs-13 fw-normal d-block">
                                {new Date(exception.reviewedAt).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </td>
                    {/* Actions */}
                    {isPending ? (
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
                                        className="dropdown-item d-flex align-items-center w-100 text-start border-0 bg-transparent text-danger"
                                        onClick={() => handleOpenCancelModal(exception.id)}
                                        disabled={loading}
                                    >
                                        <i className="ti ti-x me-2" aria-hidden="true"></i>
                                        Hủy yêu cầu
                                    </button>
                                </li>
                            </ul>
                        </td>
                    ) : (
                        <td>
                            <span className="text-muted">-</span>
                        </td>
                    )}
                </tr>
            );
        });
    };

    // Show loading if doctor profile not loaded yet
    if (!doctorId) {
        return (
            <div className="content">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải thông tin bác sĩ...</p>
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
                            <i className="ti ti-calendar-off me-2"></i>
                            Yêu cầu nghỉ / thay đổi lịch
                        </h4>
                    </div>
                    <div className="text-end">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowCreateModal(true)}
                            disabled={loading}
                        >
                            <i className="ti ti-plus me-1"></i>
                            Tạo yêu cầu mới
                        </button>
                    </div>
                </div>

                {/* Statistics Cards using MetricCard component */}
                <div className={styles.dashboardSection}>
                    <div className={`${styles.metricsGrid} ${styles.overviewGrid}`}>
                        {loading
                            ? [1, 2, 3, 4].map((i) => <MetricCardSkeleton key={i} />)
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
                                <th className="no-sort">Ngày / Khung giờ</th>
                                <th>Loại yêu cầu</th>
                                <th>Lý do</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>{renderTableBody()}</tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={pageNumber}
                    totalPages={totalPages}
                    onPageChange={setPageNumber}
                />
            )}

            {/* Create Request Modal */}
            {showCreateModal && (
                <>
                    <div className="modal fade show d-block">
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="ti ti-calendar-plus me-2"></i>
                                        Tạo yêu cầu nghỉ / thay đổi lịch
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        disabled={loading}
                                        aria-label="Đóng"
                                    ></button>
                                </div>

                                <form onSubmit={handleCreateRequest}>
                                    <div className="modal-body">
                                        <div className="row">
                                            {/* Date */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Ngày <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={formData.exceptionDate}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            exceptionDate: e.target.value,
                                                        })
                                                    }
                                                    min={getMinDate()}
                                                    required
                                                />
                                                <small className="text-muted">
                                                    Chọn ngày bạn muốn nghỉ hoặc thay đổi lịch
                                                </small>
                                            </div>

                                            {/* Exception Type */}
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Loại yêu cầu{' '}
                                                    <span className="text-danger">*</span>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={formData.exceptionType}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            exceptionType: e.target
                                                                .value as ExceptionType,
                                                            // Reset appointment times when changing type
                                                            appointmentTimes:
                                                                e.target.value ===
                                                                ExceptionType.DAY_OFF
                                                                    ? []
                                                                    : formData.appointmentTimes,
                                                        })
                                                    }
                                                    required
                                                >
                                                    <option value={ExceptionType.DAY_OFF}>
                                                        Nghỉ cả ngày
                                                    </option>
                                                    <option value={ExceptionType.BLOCK_SLOT}>
                                                        Khóa khung giờ cụ thể
                                                    </option>
                                                </select>
                                            </div>

                                            {/* Time Slot Selector - only show for BLOCK_SLOT */}
                                            {formData.exceptionType ===
                                                ExceptionType.BLOCK_SLOT && (
                                                <div className="col-12 mb-3">
                                                    <label className="form-label">
                                                        Chọn khung giờ muốn khóa{' '}
                                                        <span className="text-danger">*</span>
                                                    </label>
                                                    <TimeSlotSelector
                                                        selectedSlots={
                                                            formData.appointmentTimes || []
                                                        }
                                                        onChange={(appointmentTimes) =>
                                                            setFormData({
                                                                ...formData,
                                                                appointmentTimes,
                                                            })
                                                        }
                                                    />
                                                    <small className="text-muted">
                                                        Chọn các khung giờ bạn không thể khám trong
                                                        ngày này
                                                    </small>
                                                </div>
                                            )}

                                            {/* Reason */}
                                            <div className="col-12 mb-3">
                                                <label className="form-label">
                                                    Lý do <span className="text-danger">*</span>
                                                </label>
                                                <textarea
                                                    className="form-control"
                                                    rows={4}
                                                    value={formData.reason}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            reason: e.target.value,
                                                        })
                                                    }
                                                    placeholder="Nhập lý do yêu cầu nghỉ/thay đổi lịch..."
                                                    required
                                                />
                                                <small className="text-muted">
                                                    <i className="ti ti-info-circle me-1"></i>
                                                    Vui lòng nêu rõ lý do để nhân viên xem xét và
                                                    phê duyệt
                                                </small>
                                            </div>

                                            {/* Info Alert */}
                                            <div className="col-12">
                                                <div className="alert alert-info mb-0">
                                                    <i className="ti ti-info-circle me-2"></i>
                                                    <strong>Lưu ý:</strong> Yêu cầu của bạn sẽ được
                                                    gửi đến nhân viên bệnh viện để xét duyệt. Bạn sẽ
                                                    nhận được thông báo khi yêu cầu được phê duyệt
                                                    hoặc từ chối.
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                resetForm();
                                            }}
                                            disabled={loading}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                loading ||
                                                !formData.exceptionDate ||
                                                !formData.reason
                                            }
                                        >
                                            {loading ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        role="status"
                                                    ></span>
                                                    Đang gửi...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-send me-1"></i>
                                                    Gửi yêu cầu
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {/* Cancel Confirmation Modal */}
            <ModalDelete
                show={showCancelModal}
                onHide={() => {
                    setShowCancelModal(false);
                    setSelectedExceptionId(null);
                }}
                onConfirm={handleCancelRequest}
                title="Hủy yêu cầu"
                message="Bạn có chắc chắn muốn hủy yêu cầu này? Hành động này không thể hoàn tác."
                loading={loading}
                confirmText="Hủy yêu cầu"
            />
        </>
    );
};

export default RequestOff;
