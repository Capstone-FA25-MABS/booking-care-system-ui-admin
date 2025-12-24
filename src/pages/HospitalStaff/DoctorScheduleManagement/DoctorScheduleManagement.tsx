import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import SchedulePatternSelector from '@/components/Schedule/SchedulePatternSelector';
import ScheduleCalendar from '@/components/Schedule/ScheduleCalendar';
import {
    DoctorScheduleDto,
    SchedulePattern,
    CreateDoctorScheduleRequest,
} from '@/types/schedule.types';
import { ScheduleService } from '@/services/schedule.service';
import styles from './DoctorScheduleManagement.module.scss';

const DoctorScheduleManagement: React.FC = () => {
    const [schedules, setSchedules] = useState<DoctorScheduleDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Filter states
    const [filterDoctorId, setFilterDoctorId] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Form states
    const [formData, setFormData] = useState<CreateDoctorScheduleRequest>({
        doctorId: '',
        scheduleDate: '',
        schedulePatterns: [SchedulePattern.MORNING],
    });

    useEffect(() => {
        loadSchedules();
    }, [filterDoctorId, filterStartDate, filterEndDate]);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const response = await ScheduleService.listDoctorSchedules({
                doctorId: filterDoctorId || undefined,
                startDate: filterStartDate || undefined,
                endDate: filterEndDate || undefined,
            });
            setSchedules(response.data || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tải danh sách lịch khám');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.doctorId || !formData.scheduleDate) {
            toast.warning('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            await ScheduleService.createOrUpdateDoctorSchedule(formData);
            toast.success('Tạo lịch khám thành công');
            setShowCreateModal(false);
            resetForm();
            loadSchedules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tạo lịch khám');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSchedule = async (doctorId: string, scheduleDate: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa lịch khám này?')) {
            return;
        }

        try {
            setLoading(true);
            await ScheduleService.deleteDoctorSchedule(doctorId, scheduleDate);
            toast.success('Xóa lịch khám thành công');
            loadSchedules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể xóa lịch khám');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            doctorId: '',
            scheduleDate: '',
            schedulePatterns: [SchedulePattern.MORNING],
        });
    };

    return (
        <div className={styles.doctorScheduleManagement}>
            <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">
                        <i className="ti ti-calendar-time me-2"></i>
                        Quản lý lịch khám bác sĩ
                    </h4>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowCreateModal(true)}
                        disabled={loading}
                    >
                        <i className="ti ti-plus me-1"></i>
                        Tạo lịch khám
                    </button>
                </div>

                <div className="card-body">
                    {/* Filters */}
                    <div className="row mb-4">
                        <div className="col-md-4">
                            <label className="form-label">Mã bác sĩ</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nhập mã bác sĩ..."
                                value={filterDoctorId}
                                onChange={(e) => setFilterDoctorId(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Từ ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Đến ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Calendar View */}
                    {filterStartDate && filterEndDate && (
                        <ScheduleCalendar
                            schedules={schedules}
                            startDate={new Date(filterStartDate)}
                            endDate={new Date(filterEndDate)}
                        />
                    )}

                    {/* List View */}
                    <div className="table-responsive mt-4">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Bác sĩ</th>
                                    <th>Ngày khám</th>
                                    <th>Ca khám</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((schedule) => (
                                        <tr key={schedule.id}>
                                            <td>{schedule.doctorId}</td>
                                            <td>
                                                {new Date(schedule.scheduleDate).toLocaleDateString(
                                                    'vi-VN'
                                                )}
                                            </td>
                                            <td>
                                                {schedule.schedulePatterns.map((pattern, idx) => (
                                                    <span key={idx} className="badge bg-info me-1">
                                                        {pattern}
                                                    </span>
                                                ))}
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() =>
                                                        handleDeleteSchedule(
                                                            schedule.doctorId,
                                                            schedule.scheduleDate
                                                        )
                                                    }
                                                    disabled={loading}
                                                >
                                                    <i className="ti ti-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <>
                    <div className={`modal fade ${showCreateModal ? 'show d-block' : ''}`}>
                        <div className="modal-dialog modal-lg modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="ti ti-calendar-plus me-2"></i>
                                        Tạo lịch khám mới
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

                                <form onSubmit={handleCreateSchedule}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Mã bác sĩ <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.doctorId}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            doctorId: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Ngày khám <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    className="form-control"
                                                    value={formData.scheduleDate}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            scheduleDate: e.target.value,
                                                        })
                                                    }
                                                    required
                                                />
                                            </div>

                                            <div className="col-12 mb-3">
                                                <SchedulePatternSelector
                                                    selectedPatterns={formData.schedulePatterns}
                                                    onChange={(schedulePatterns) =>
                                                        setFormData({
                                                            ...formData,
                                                            schedulePatterns,
                                                        })
                                                    }
                                                    singleSelect={false}
                                                />
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
                                                    Đang tạo...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="ti ti-check me-1"></i>
                                                    Tạo lịch khám
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

export default DoctorScheduleManagement;
