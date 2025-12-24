import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import TimeSlotSelector from '@/components/Schedule/TimeSlotSelector';
import ExceptionRequestCard from '@/components/Schedule/ExceptionRequestCard';
import {
    DoctorScheduleExceptionDto,
    CreateDoctorScheduleExceptionRequest,
    ExceptionType,
    ExceptionRequestStatus,
} from '@/types/schedule.types';
import { ScheduleService } from '@/services/schedule.service';
import styles from './RequestOff.module.scss';

const RequestOff: React.FC = () => {
    const [myExceptions, setMyExceptions] = useState<DoctorScheduleExceptionDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Get doctor ID from auth context
    const doctorId = localStorage.getItem('userId') || '';

    // Form states
    const [formData, setFormData] = useState<CreateDoctorScheduleExceptionRequest>({
        doctorId,
        exceptionDate: '',
        exceptionType: ExceptionType.DAY_OFF,
        isAvailable: false,
        appointmentTimes: [],
        reason: '',
    });

    useEffect(() => {
        if (doctorId) {
            loadMyExceptions();
        }
    }, [doctorId]);

    const loadMyExceptions = async () => {
        try {
            setLoading(true);
            // Use empty date to get all exceptions for this doctor
            const response = await ScheduleService.getDoctorExceptions(doctorId, '');
            setMyExceptions(response.data || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRequest = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.exceptionDate || !formData.reason || !formData.reason.trim()) {
            toast.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (
            formData.exceptionType === ExceptionType.BLOCK_SLOT &&
            formData.appointmentTimes &&
            formData.appointmentTimes.length === 0
        ) {
            toast.warning('Vui lòng chọn khung giờ muốn thay đổi');
            return;
        }

        try {
            setLoading(true);
            await ScheduleService.createDoctorException(formData);
            toast.success('Gửi yêu cầu thành công. Vui lòng chờ nhân viên xét duyệt.');
            setShowCreateModal(false);
            resetForm();
            loadMyExceptions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (exceptionId: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này?')) {
            return;
        }

        try {
            setLoading(true);
            await ScheduleService.deleteDoctorException(exceptionId);
            toast.success('Đã hủy yêu cầu');
            loadMyExceptions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể hủy yêu cầu');
        } finally {
            setLoading(false);
        }
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

    const pendingCount = myExceptions.filter(
        (e) => e.status === ExceptionRequestStatus.PENDING
    ).length;
    const approvedCount = myExceptions.filter(
        (e) => e.status === ExceptionRequestStatus.APPROVED
    ).length;
    const rejectedCount = myExceptions.filter(
        (e) => e.status === ExceptionRequestStatus.REJECTED
    ).length;

    return (
        <div className={styles.requestOff}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        <i className="ti ti-calendar-off me-2"></i>
                        Yêu cầu nghỉ/thay đổi lịch
                    </h4>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                        disabled={loading}
                    >
                        <i className="ti ti-plus me-1"></i>
                        Tạo yêu cầu mới
                    </button>
                </div>

                <div className="card-body">
                    {/* Summary */}
                    <div className="row mb-4">
                        <div className="col-md-3">
                            <div className="card bg-light-warning text-warning">
                                <div className="card-body">
                                    <h6 className="mb-1">Chờ duyệt</h6>
                                    <h3 className="mb-0">{pendingCount}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light-success text-success">
                                <div className="card-body">
                                    <h6 className="mb-1">Đã duyệt</h6>
                                    <h3 className="mb-0">{approvedCount}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light-danger text-danger">
                                <div className="card-body">
                                    <h6 className="mb-1">Từ chối</h6>
                                    <h3 className="mb-0">{rejectedCount}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light-info text-info">
                                <div className="card-body">
                                    <h6 className="mb-1">Tổng cộng</h6>
                                    <h3 className="mb-0">{myExceptions.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Exception Requests Grid */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : myExceptions.length === 0 ? (
                        <div className="alert alert-info">
                            <i className="ti ti-info-circle me-2"></i>
                            Bạn chưa có yêu cầu nào. Nhấn "Tạo yêu cầu mới" để bắt đầu.
                        </div>
                    ) : (
                        <div className={styles.exceptionsGrid}>
                            {myExceptions.map((exception) => (
                                <ExceptionRequestCard
                                    key={exception.id}
                                    type="doctor"
                                    exception={exception}
                                    requesterName="Bạn"
                                    onCancel={
                                        exception.status === ExceptionRequestStatus.PENDING
                                            ? () => handleCancelRequest(exception.id)
                                            : undefined
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Request Modal */}
            {showCreateModal && (
                <>
                    <div className={`modal fade ${showCreateModal ? 'show d-block' : ''}`}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="ti ti-calendar-plus me-2"></i>
                                        Tạo yêu cầu mới
                                    </h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        disabled={loading}
                                    ></button>
                                </div>

                                <form onSubmit={handleCreateRequest}>
                                    <div className="modal-body">
                                        <div className="row">
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
                                                    min={new Date().toISOString().split('T')[0]}
                                                    required
                                                />
                                            </div>

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
                                                        })
                                                    }
                                                    required
                                                >
                                                    <option value={ExceptionType.DAY_OFF}>
                                                        Nghỉ cả ngày
                                                    </option>
                                                    <option value={ExceptionType.BLOCK_SLOT}>
                                                        Khóa khe giờ cụ thể
                                                    </option>
                                                </select>
                                            </div>

                                            {formData.exceptionType ===
                                                ExceptionType.BLOCK_SLOT && (
                                                <div className="col-12 mb-3">
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
                                                </div>
                                            )}

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
                                                    Vui lòng nêu rõ lý do để nhân viên xem xét
                                                </small>
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
                                            disabled={loading}
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
                    {showCreateModal && <div className="modal-backdrop fade show"></div>}
                </>
            )}
        </div>
    );
};

export default RequestOff;
