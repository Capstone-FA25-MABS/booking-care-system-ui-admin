import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import TableSkeleton from '@/components/TableSkeleton';
import Pagination from '@/components/Pagination';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import { DoctorScheduleWithInfo, SchedulePattern } from '@/types/schedule.types';
import { ScheduleService } from '@/services/schedule.service';
import { RootState } from '@/store';
import styles from './MySchedules.module.scss';

// Skeleton columns for schedule table
const scheduleTableColumns = [
    { type: 'badge' as const, width: 180 },
    { type: 'badge' as const, width: 200 },
    { type: 'text' as const, width: 100 },
];

// Helper to get pattern display name
const getPatternDisplayName = (pattern: SchedulePattern): string => {
    const patternNames: Record<SchedulePattern, string> = {
        [SchedulePattern.MORNING]: 'Sáng',
        [SchedulePattern.AFTERNOON]: 'Chiều',
        [SchedulePattern.EVENING]: 'Tối',
        [SchedulePattern.NIGHT]: 'Đêm',
    };
    return patternNames[pattern] || pattern;
};

// Helper to get pattern badge color
const getPatternBadgeClass = (pattern: SchedulePattern): string => {
    const patternColors: Record<SchedulePattern, string> = {
        [SchedulePattern.MORNING]: 'bg-warning',
        [SchedulePattern.AFTERNOON]: 'bg-info',
        [SchedulePattern.EVENING]: 'bg-primary',
        [SchedulePattern.NIGHT]: 'bg-secondary',
    };
    return patternColors[pattern] || 'bg-info';
};

// Helper to get day of week badge color
const getDayOfWeekBadgeClass = (date: Date): string => {
    const day = date.getDay();
    if (day === 0) return 'bg-danger'; // Sunday
    if (day === 6) return 'bg-warning'; // Saturday
    return 'bg-light text-dark'; // Weekday
};

const MySchedules: React.FC = () => {
    const [schedules, setSchedules] = useState<DoctorScheduleWithInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [pageNumber, setPageNumber] = useState(1);
    const pageSize = 10;

    // Get doctorId from Redux store
    const doctorProfile = useSelector((state: RootState) => state.user.doctorProfile);
    const doctorId = doctorProfile?.id;

    // Filter states - default to current week
    const [filterStartDate, setFilterStartDate] = useState(() => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        return startOfWeek.toISOString().split('T')[0];
    });
    const [filterEndDate, setFilterEndDate] = useState(() => {
        const today = new Date();
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 7); // Sunday
        return endOfWeek.toISOString().split('T')[0];
    });

    const loadMySchedules = useCallback(async () => {
        if (!doctorId) {
            return;
        }

        try {
            setLoading(true);
            const response = await ScheduleService.getDoctorScheduleRange(
                doctorId,
                filterStartDate,
                filterEndDate
            );

            // Map to DoctorScheduleWithInfo format for consistency
            const data = response.data || [];
            const mappedSchedules: DoctorScheduleWithInfo[] = data.map((schedule) => ({
                id: schedule.id,
                doctorId: schedule.doctorId,
                doctorName:
                    `${doctorProfile?.firstName || ''} ${doctorProfile?.lastName || ''}`.trim(),
                doctorAvatarUrl: doctorProfile?.avatarUrl,
                doctorEmail: doctorProfile?.email,
                scheduleDate: schedule.scheduleDate,
                schedulePatterns: schedule.schedulePatterns,
                createdAt: schedule.createdAt,
                updatedAt: schedule.updatedAt,
            }));

            setSchedules(mappedSchedules);
            setTotalCount(mappedSchedules.length);
        } catch (error: any) {
            toast.error(error.message || 'Không thể tải lịch khám của bạn');
        } finally {
            setLoading(false);
        }
    }, [doctorId, doctorProfile, filterStartDate, filterEndDate]);

    useEffect(() => {
        if (doctorId) {
            loadMySchedules();
        }
    }, [loadMySchedules, doctorId]);

    // Quick filter buttons
    const handleThisWeek = () => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 7);

        setFilterStartDate(startOfWeek.toISOString().split('T')[0]);
        setFilterEndDate(endOfWeek.toISOString().split('T')[0]);
        setPageNumber(1);
    };

    const handleNextWeek = () => {
        const today = new Date();
        const startOfNextWeek = new Date(today);
        startOfNextWeek.setDate(today.getDate() - today.getDay() + 8);
        const endOfNextWeek = new Date(today);
        endOfNextWeek.setDate(today.getDate() - today.getDay() + 14);

        setFilterStartDate(startOfNextWeek.toISOString().split('T')[0]);
        setFilterEndDate(endOfNextWeek.toISOString().split('T')[0]);
        setPageNumber(1);
    };

    const handleThisMonth = () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        setFilterStartDate(startOfMonth.toISOString().split('T')[0]);
        setFilterEndDate(endOfMonth.toISOString().split('T')[0]);
        setPageNumber(1);
    };

    // Pagination
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginatedSchedules = schedules.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    // Statistics
    const totalScheduleDays = schedules.length;
    const morningCount = schedules.filter((s) =>
        s.schedulePatterns.includes(SchedulePattern.MORNING)
    ).length;
    const afternoonCount = schedules.filter((s) =>
        s.schedulePatterns.includes(SchedulePattern.AFTERNOON)
    ).length;
    const eveningCount = schedules.filter((s) =>
        s.schedulePatterns.includes(SchedulePattern.EVENING)
    ).length;

    // Metrics for MetricCard components
    const metrics = useMemo(
        () => [
            {
                label: 'Tổng số ngày',
                value: totalScheduleDays,
                sub: 'Ngày có lịch khám',
                className: styles.total,
                icon: 'ti ti-calendar-stats',
            },
            {
                label: 'Ca sáng',
                value: morningCount,
                sub: 'Ngày có ca sáng',
                className: styles.morning,
                icon: 'ti ti-sun',
            },
            {
                label: 'Ca chiều',
                value: afternoonCount,
                sub: 'Ngày có ca chiều',
                className: styles.afternoon,
                icon: 'ti ti-cloud-sun',
            },
            {
                label: 'Ca tối',
                value: eveningCount,
                sub: 'Ngày có ca tối',
                className: styles.evening,
                icon: 'ti ti-moon',
            },
        ],
        [totalScheduleDays, morningCount, afternoonCount, eveningCount]
    );

    // Render table body
    const renderTableBody = () => {
        if (loading) {
            return <TableSkeleton rows={pageSize} columns={scheduleTableColumns} />;
        }

        if (paginatedSchedules.length === 0) {
            return (
                <tr>
                    <td colSpan={3} className="text-center py-5">
                        <i className="ti ti-calendar-off fs-1 text-muted"></i>
                        <p className="mt-2 text-muted">
                            Bạn chưa có lịch khám nào trong khoảng thời gian này
                        </p>
                    </td>
                </tr>
            );
        }

        return paginatedSchedules.map((schedule) => {
            const scheduleDate = new Date(schedule.scheduleDate);
            return (
                <tr key={schedule.id}>
                    {/* Ngày khám */}
                    <td>
                        <span className={`badge ${getDayOfWeekBadgeClass(scheduleDate)} me-2`}>
                            {scheduleDate.toLocaleDateString('vi-VN', { weekday: 'short' })}
                        </span>
                        {scheduleDate.toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                        })}
                    </td>
                    {/* Ca khám */}
                    <td>
                        {schedule.schedulePatterns.map((pattern, idx) => (
                            <span
                                key={idx}
                                className={`badge ${getPatternBadgeClass(pattern)} me-1`}
                            >
                                {getPatternDisplayName(pattern)}
                            </span>
                        ))}
                    </td>
                    {/* Cập nhật */}
                    <td>
                        <span className="text-muted">
                            {new Date(schedule.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                    </td>
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
                            <i className="ti ti-calendar-user me-2"></i>
                            Lịch khám của tôi
                        </h4>
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

                {/* Filters */}
                <div className="card mb-3">
                    <div className="card-body">
                        <div className="row align-items-end">
                            <div className="col-md-3 mb-3 mb-md-0">
                                <label className="form-label">Từ ngày</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filterStartDate}
                                    onChange={(e) => {
                                        setFilterStartDate(e.target.value);
                                        setPageNumber(1);
                                    }}
                                />
                            </div>
                            <div className="col-md-3 mb-3 mb-md-0">
                                <label className="form-label">Đến ngày</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={filterEndDate}
                                    onChange={(e) => {
                                        setFilterEndDate(e.target.value);
                                        setPageNumber(1);
                                    }}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">Lọc nhanh</label>
                                <div className="btn-group w-100" role="group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={handleThisWeek}
                                    >
                                        Tuần này
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={handleNextWeek}
                                    >
                                        Tuần sau
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary"
                                        onClick={handleThisMonth}
                                    >
                                        Tháng này
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={loadMySchedules}
                                        disabled={loading}
                                    >
                                        <i className="ti ti-refresh me-1"></i>
                                        Tải lại
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                    <table className="table datatable table-nowrap">
                        <thead>
                            <tr>
                                <th className="no-sort">Ngày khám</th>
                                <th>Ca khám</th>
                                <th>Cập nhật</th>
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
        </>
    );
};

export default MySchedules;
