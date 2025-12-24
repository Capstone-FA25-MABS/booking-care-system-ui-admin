import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import ScheduleCalendar from '@/components/Schedule/ScheduleCalendar';
import { DoctorScheduleDto } from '@/types/schedule.types';
import { ScheduleService } from '@/services/schedule.service';
import styles from './MySchedules.module.scss';

const MySchedules: React.FC = () => {
    const [schedules, setSchedules] = useState<DoctorScheduleDto[]>([]);
    const [loading, setLoading] = useState(false);

    // Filter states
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Get doctor ID from auth context (simplified - adjust based on your auth implementation)
    const doctorId = localStorage.getItem('userId') || '';

    useEffect(() => {
        if (doctorId) {
            loadMySchedules();
        }
    }, [doctorId, filterStartDate, filterEndDate]);

    const loadMySchedules = async () => {
        try {
            setLoading(true);
            const response = await ScheduleService.listDoctorSchedules({
                doctorId,
                startDate: filterStartDate || undefined,
                endDate: filterEndDate || undefined,
            });
            setSchedules(response.data || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể tải lịch khám của bạn');
        } finally {
            setLoading(false);
        }
    };

    // Set default date range (current week)
    useEffect(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        setFilterStartDate(startOfWeek.toISOString().split('T')[0]);
        setFilterEndDate(endOfWeek.toISOString().split('T')[0]);
    }, []);

    return (
        <div className={styles.mySchedules}>
            <div className="card">
                <div className="card-header">
                    <h4 className="mb-0">
                        <i className="ti ti-calendar-user me-2"></i>
                        Lịch khám của tôi
                    </h4>
                </div>

                <div className="card-body">
                    {/* Date Range Filter */}
                    <div className="row mb-4">
                        <div className="col-md-5">
                            <label className="form-label">Từ ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-5">
                            <label className="form-label">Đến ngày</label>
                            <input
                                type="date"
                                className="form-control"
                                value={filterEndDate}
                                onChange={(e) => setFilterEndDate(e.target.value)}
                            />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-primary w-100"
                                onClick={loadMySchedules}
                                disabled={loading}
                            >
                                <i className="ti ti-refresh me-1"></i>
                                Tải lại
                            </button>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <div className="card bg-light-primary text-primary">
                                <div className="card-body">
                                    <h6 className="mb-1">Tổng số lịch</h6>
                                    <h3 className="mb-0">{schedules.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendar View */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    ) : filterStartDate && filterEndDate ? (
                        <ScheduleCalendar
                            schedules={schedules}
                            startDate={new Date(filterStartDate)}
                            endDate={new Date(filterEndDate)}
                        />
                    ) : null}

                    {/* List View */}
                    <div className="table-responsive mt-4">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Ngày khám</th>
                                    <th>Ca khám</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={2} className="text-center">
                                            <div className="spinner-border" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : schedules.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="text-center">
                                            Bạn chưa có lịch khám nào trong khoảng thời gian này
                                        </td>
                                    </tr>
                                ) : (
                                    schedules.map((schedule) => (
                                        <tr key={schedule.id}>
                                            <td>
                                                <i className="ti ti-calendar me-2"></i>
                                                {new Date(schedule.scheduleDate).toLocaleDateString(
                                                    'vi-VN',
                                                    {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    }
                                                )}
                                            </td>
                                            <td>
                                                {schedule.schedulePatterns.map((pattern, idx) => (
                                                    <span key={idx} className="badge bg-info me-1">
                                                        {pattern}
                                                    </span>
                                                ))}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MySchedules;
