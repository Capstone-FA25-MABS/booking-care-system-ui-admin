import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import Select from 'react-select';
import FilterDatePicker from '@/components/FilterDatePicker';
import styles from '../../hospitals/Dashboard/Dashboard.module.scss';
import { RootState } from '@/store';
import ActionDropdown from '@/components/ActionDropdown';
import { selectCustomStyles } from '@/constants/select.styles';
import AppointmentService from '@/services/appointment.service';
import ReviewService from '@/services/review.service';
import { StatisticsPeriod } from '@/types/statistics.types';
import { AppointmentStatus, AppointmentType, AppointmentTime } from '@/enums/appointment.enums';
import { getAppointmentTimeText } from '@/types/appointment.types';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import { ChartJsLine, ChartSkeleton, ChartJsMultiLine } from '@/components/ChartJsLine';

const periodOptions: Array<{ value: StatisticsPeriod; label: string }> = [
    { value: StatisticsPeriod.Daily, label: 'Theo ngày' },
    { value: StatisticsPeriod.Weekly, label: 'Theo tuần' },
    { value: StatisticsPeriod.Monthly, label: 'Theo tháng' },
    { value: StatisticsPeriod.Quarterly, label: 'Theo quý' },
    { value: StatisticsPeriod.Yearly, label: 'Theo năm' },
];

const numberFormatter = new Intl.NumberFormat('vi-VN');
const formatPercent = (value: number) => (Number.isFinite(value) ? `${value.toFixed(2)}%` : '0%');

const formatDateDisplay = (value?: string | Date) => {
    if (!value) return '--';
    try {
        const date = typeof value === 'string' ? new Date(value) : value;
        if (isNaN(date.getTime())) {
            return '--';
        }
        return format(date, 'dd/MM/yyyy');
    } catch {
        return '--';
    }
};

const formatTrendLabel = (periodStart: string, periodEnd: string): string => {
    try {
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);

        // Kiểm tra Date hợp lệ
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return `${periodStart} - ${periodEnd}`;
        }

        const startFormatted = format(startDate, 'dd/MM/yyyy');
        const endFormatted = format(endDate, 'dd/MM/yyyy');

        if (startFormatted === endFormatted) {
            return startFormatted;
        }

        return `${startFormatted} - ${endFormatted}`;
    } catch {
        return `${periodStart} - ${periodEnd}`;
    }
};

type ChartPoint = { label: string; value: number };

interface DoctorStatistics {
    totalAppointments: number;
    completedAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    rescheduledAppointments: number;
    newPatients: number;
    noShowRate: number;
    rescheduleRate: number;
}

interface AppointmentTrendPoint {
    label: string;
    periodStart: string;
    periodEnd: string;
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
}

interface NewPatientTrendPoint {
    label: string;
    periodStart: string;
    periodEnd: string;
    newPatients: number;
}

const DoctorDashboard: React.FC = () => {
    const { doctorProfile } = useSelector((state: RootState) => state.user);
    const [period, setPeriod] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
        const end = new Date();
        return {
            end,
            start: subDays(end, 29),
        };
    });

    const [stats, setStats] = useState<DoctorStatistics | null>(null);
    const [appointmentTrend, setAppointmentTrend] = useState<AppointmentTrendPoint[]>([]);
    const [newPatientTrend, setNewPatientTrend] = useState<NewPatientTrendPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reviewStats, setReviewStats] = useState<{
        totalReviews: number;
        averageRating: number;
        ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
    } | null>(null);
    const [isLoadingReviewStats, setIsLoadingReviewStats] = useState(false);
    const [additionalStats, setAdditionalStats] = useState<{
        peakHours: Array<{ hour: string; count: number }>;
        appointmentTypeStats: { telehealth: number; inPerson: number };
        returningPatients: number;
        completionRate: number;
    } | null>(null);

    const isoRange = useMemo(() => {
        const start = dateRange.start ? startOfDay(dateRange.start).toISOString() : undefined;
        const end = dateRange.end ? endOfDay(dateRange.end).toISOString() : undefined;
        return { fromDate: start, toDate: end };
    }, [dateRange]);

    // Calculate statistics from appointments
    const calculateStatistics = useCallback(
        async (appointments: any[]): Promise<DoctorStatistics> => {
            const totalAppointments = appointments.length;
            const completedAppointments = appointments.filter(
                (a) => a.status === AppointmentStatus.COMPLETED
            ).length;
            const confirmedAppointments = appointments.filter(
                (a) => a.status === AppointmentStatus.CONFIRMED
            ).length;
            const pendingAppointments = appointments.filter(
                (a) => a.status === AppointmentStatus.PENDING
            ).length;
            const cancelledAppointments = appointments.filter(
                (a) => a.status === AppointmentStatus.CANCELLED
            ).length;

            // Calculate rescheduled (appointments that have been updated multiple times)
            // This is a simplified calculation - you might need to track this differently
            const rescheduledAppointments = 0; // Placeholder - need to track from history

            // Calculate new patients (unique patient IDs in the period)
            const uniquePatients = new Set(appointments.map((a) => a.patientId).filter((id) => id));
            const newPatients = uniquePatients.size;

            const noShowRate =
                totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

            const rescheduleRate =
                totalAppointments > 0 ? (rescheduledAppointments / totalAppointments) * 100 : 0;

            return {
                totalAppointments,
                completedAppointments,
                confirmedAppointments,
                pendingAppointments,
                cancelledAppointments,
                rescheduledAppointments,
                newPatients,
                noShowRate,
                rescheduleRate,
            };
        },
        []
    );

    // Calculate additional statistics
    const calculateAdditionalStatistics = useCallback(async (appointments: any[]) => {
        // Peak hours analysis - sử dụng AppointmentTimeId
        const hourCounts: Record<string, number> = {};
        appointments.forEach((apt) => {
            if (apt.appointmentTimeId) {
                try {
                    // Lấy text từ AppointmentTimeId (ví dụ: "08:00 - 08:30")
                    const timeText = getAppointmentTimeText(
                        apt.appointmentTimeId as AppointmentTime
                    );
                    if (timeText && timeText !== 'Chưa xác định') {
                        // Extract giờ từ text (lấy phần đầu, ví dụ "08:00" từ "08:00 - 08:30")
                        const hourMatch = timeText.match(/^(\d{2}):\d{2}/);
                        if (hourMatch) {
                            const hourLabel = `${hourMatch[1]}:00`;
                            hourCounts[hourLabel] = (hourCounts[hourLabel] || 0) + 1;
                        }
                    }
                } catch (error) {
                    console.warn('Error parsing appointmentTimeId:', apt.appointmentTimeId, error);
                }
            }
        });

        const peakHours = Object.entries(hourCounts)
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => a.hour.localeCompare(b.hour));

        // Appointment type statistics
        let telehealth = 0;
        let inPerson = 0;
        appointments.forEach((apt) => {
            if (
                apt.appointmentType === AppointmentType.TELEHEALTH ||
                apt.appointmentType === 'TELEHEALTH'
            ) {
                telehealth++;
            } else if (
                apt.appointmentType === AppointmentType.IN_PERSON ||
                apt.appointmentType === 'IN_PERSON'
            ) {
                inPerson++;
            }
        });

        // Returning patients (patients with more than 1 appointment)
        const patientAppointmentCounts: Record<string, number> = {};
        appointments.forEach((apt) => {
            if (apt.patientId) {
                patientAppointmentCounts[apt.patientId] =
                    (patientAppointmentCounts[apt.patientId] || 0) + 1;
            }
        });

        const returningPatients = Object.values(patientAppointmentCounts).filter(
            (count) => count > 1
        ).length;

        // Completion rate
        const totalCompletedOrConfirmed = appointments.filter(
            (a) =>
                a.status === AppointmentStatus.COMPLETED || a.status === AppointmentStatus.CONFIRMED
        ).length;
        const completionRate =
            appointments.length > 0 ? (totalCompletedOrConfirmed / appointments.length) * 100 : 0;

        return {
            peakHours,
            appointmentTypeStats: { telehealth, inPerson },
            returningPatients,
            completionRate,
        };
    }, []);

    // Calculate trend data based on period
    const calculateTrends = useCallback((appointments: any[], period: StatisticsPeriod) => {
        const appointmentTrendPoints: AppointmentTrendPoint[] = [];
        const newPatientTrendPoints: NewPatientTrendPoint[] = [];

        // Group appointments by period
        const grouped: Record<string, any[]> = {};
        const patientGroups: Record<string, Set<string>> = {};

        appointments.forEach((apt) => {
            if (!apt.appointmentDate) return; // Skip nếu không có appointmentDate

            const date = new Date(apt.appointmentDate);
            // Kiểm tra Date hợp lệ
            if (isNaN(date.getTime())) {
                console.warn('Invalid appointmentDate:', apt.appointmentDate);
                return; // Skip invalid dates
            }

            let key: string;

            switch (period) {
                case StatisticsPeriod.Daily:
                    key = format(date, 'yyyy-MM-dd');
                    break;
                case StatisticsPeriod.Weekly: {
                    // Get start of week
                    const weekStart = subDays(date, date.getDay());
                    key = format(weekStart, 'yyyy-MM-dd');
                    break;
                }
                case StatisticsPeriod.Monthly:
                    key = format(date, 'yyyy-MM');
                    break;
                case StatisticsPeriod.Quarterly: {
                    const quarter = Math.floor(date.getMonth() / 3);
                    key = `${date.getFullYear()}-Q${quarter + 1}`;
                    break;
                }
                case StatisticsPeriod.Yearly:
                    key = format(date, 'yyyy');
                    break;
                default:
                    key = format(date, 'yyyy-MM-dd');
            }

            if (!grouped[key]) {
                grouped[key] = [];
                patientGroups[key] = new Set();
            }
            grouped[key].push(apt);
            if (apt.patientId) {
                patientGroups[key].add(apt.patientId);
            }
        });

        // Convert to trend points
        Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([key, apts]) => {
                let periodStart: Date;

                // Parse date từ key dựa trên format
                if (key.includes('Q')) {
                    // Quarterly format: "2024-Q1"
                    const [year, quarter] = key.split('-Q');
                    const quarterNum = parseInt(quarter, 10);
                    const month = (quarterNum - 1) * 3; // Q1 = tháng 0-2, Q2 = 3-5, etc.
                    periodStart = new Date(parseInt(year, 10), month, 1);
                } else if (key.match(/^\d{4}-\d{2}$/)) {
                    // Monthly format: "2024-01"
                    periodStart = new Date(`${key}-01`);
                } else if (key.match(/^\d{4}$/)) {
                    // Yearly format: "2024"
                    periodStart = new Date(`${key}-01-01`);
                } else if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // Daily format: "2024-01-01"
                    periodStart = new Date(key);
                } else {
                    // Fallback: try to parse directly
                    periodStart = new Date(key);
                }

                // Kiểm tra Date hợp lệ
                if (isNaN(periodStart.getTime())) {
                    console.warn(`Invalid date key: ${key}`);
                    return; // Skip invalid dates
                }

                const periodEnd = new Date(periodStart);

                // Set period end based on period type
                switch (period) {
                    case StatisticsPeriod.Daily:
                        // Same day
                        break;
                    case StatisticsPeriod.Weekly:
                        periodEnd.setDate(periodEnd.getDate() + 6);
                        break;
                    case StatisticsPeriod.Monthly:
                        periodEnd.setMonth(periodEnd.getMonth() + 1);
                        periodEnd.setDate(0); // Last day of month
                        break;
                    case StatisticsPeriod.Quarterly:
                        periodEnd.setMonth(periodEnd.getMonth() + 3);
                        periodEnd.setDate(0);
                        break;
                    case StatisticsPeriod.Yearly:
                        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
                        periodEnd.setMonth(0);
                        periodEnd.setDate(0);
                        break;
                }

                const completed = apts.filter(
                    (a) => a.status === AppointmentStatus.COMPLETED
                ).length;
                const cancelled = apts.filter(
                    (a) => a.status === AppointmentStatus.CANCELLED
                ).length;

                // Kiểm tra periodEnd hợp lệ trước khi thêm
                if (!isNaN(periodEnd.getTime())) {
                    appointmentTrendPoints.push({
                        label: key,
                        periodStart: periodStart.toISOString(),
                        periodEnd: periodEnd.toISOString(),
                        totalAppointments: apts.length,
                        completedAppointments: completed,
                        cancelledAppointments: cancelled,
                    });

                    newPatientTrendPoints.push({
                        label: key,
                        periodStart: periodStart.toISOString(),
                        periodEnd: periodEnd.toISOString(),
                        newPatients: patientGroups[key]?.size || 0,
                    });
                }
            });

        return { appointmentTrendPoints, newPatientTrendPoints };
    }, []);

    const loadStatistics = useCallback(async () => {
        if (!doctorProfile?.id || !isoRange.fromDate || !isoRange.toDate) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch all appointments in the date range
            const response = await AppointmentService.getAppointmentsForManagement({
                doctorId: doctorProfile.id,
                fromDate: isoRange.fromDate.split('T')[0],
                toDate: isoRange.toDate.split('T')[0],
                pageNumber: 1,
                pageSize: 10000, // Get all appointments
                includeStatusCounts: false,
            });

            if (response.data?.appointments) {
                const appointments = response.data.appointments;
                const statistics = await calculateStatistics(appointments);
                const trends = calculateTrends(appointments, period);
                const additional = await calculateAdditionalStatistics(appointments);

                setStats(statistics);
                setAppointmentTrend(trends.appointmentTrendPoints);
                setNewPatientTrend(trends.newPatientTrendPoints);
                setAdditionalStats(additional);
            }
        } catch (err: any) {
            const message = err?.message || 'Không thể tải dữ liệu thống kê';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [
        doctorProfile?.id,
        isoRange.fromDate,
        isoRange.toDate,
        period,
        calculateStatistics,
        calculateTrends,
    ]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const loadReviewStatistics = useCallback(async () => {
        if (!doctorProfile?.id) return;

        setIsLoadingReviewStats(true);
        try {
            const response = await ReviewService.getDoctorStatistics(doctorProfile.id);
            if (response.data) {
                // Đảm bảo ratingDistribution là một mảng
                let ratingDistribution = response.data.ratingDistribution;
                if (!Array.isArray(ratingDistribution)) {
                    ratingDistribution = [];
                }

                setReviewStats({
                    totalReviews: response.data.totalReviews || 0,
                    averageRating: response.data.averageRating || 0,
                    ratingDistribution,
                });
            }
        } catch (err: any) {
            console.error('Failed to load review statistics:', err);
            setReviewStats(null);
        } finally {
            setIsLoadingReviewStats(false);
        }
    }, [doctorProfile?.id]);

    useEffect(() => {
        loadReviewStatistics();
    }, [loadReviewStatistics]);

    const handleDateChange = (key: 'start' | 'end', value: string) => {
        if (!value) return;
        setDateRange((prev) => ({
            ...prev,
            [key]: new Date(value),
        }));
    };

    const overviewMetrics = useMemo(() => {
        if (!stats) return [];
        return [
            {
                label: 'Tổng lịch hẹn',
                value: stats.totalAppointments,
                sub: `${formatPercent(stats.noShowRate)} vắng/huỷ`,
                className: `${styles.metricCard} ${styles.total}`,
                icon: 'ti ti-calendar-event',
            },
            {
                label: 'Hoàn thành',
                value: stats.completedAppointments,
                sub: `${numberFormatter.format(stats.confirmedAppointments)} đã xác nhận`,
                className: `${styles.metricCard} ${styles.completed}`,
                icon: 'ti ti-circle-check',
            },
            {
                label: 'Đang chờ',
                value: stats.pendingAppointments,
                sub: `${numberFormatter.format(stats.rescheduledAppointments)} đã đổi lịch`,
                className: `${styles.metricCard} ${styles.pending}`,
                icon: 'ti ti-clock-hour-4',
            },
            {
                label: 'Huỷ / Vắng',
                value: stats.cancelledAppointments,
                sub: `Tỷ lệ vắng: ${formatPercent(stats.noShowRate)}`,
                className: `${styles.metricCard} ${styles.cancelled}`,
                icon: 'ti ti-circle-x',
            },
            {
                label: 'Bệnh nhân mới',
                value: stats.newPatients,
                sub: `Tỷ lệ đổi lịch: ${formatPercent(stats.rescheduleRate)}`,
                className: `${styles.metricCard} ${styles.newPatients}`,
                icon: 'ti ti-user-plus',
            },
        ];
    }, [stats]);

    const appointmentTrendPoints = useMemo<ChartPoint[]>(() => {
        return appointmentTrend.map((point) => ({
            label: formatTrendLabel(point.periodStart, point.periodEnd),
            value: point.totalAppointments,
        }));
    }, [appointmentTrend]);

    const newPatientPoints = useMemo<ChartPoint[]>(() => {
        return newPatientTrend.map((point) => ({
            label: formatTrendLabel(point.periodStart, point.periodEnd),
            value: point.newPatients,
        }));
    }, [newPatientTrend]);

    const reviewMetrics = useMemo(() => {
        if (!reviewStats) return [];
        return [
            {
                label: 'Tổng đánh giá',
                value: reviewStats.totalReviews,
                sub: `${reviewStats.averageRating.toFixed(1)}⭐ điểm trung bình`,
                className: `${styles.metricCard} ${styles.cardSpecialty}`,
                icon: 'ti ti-star-filled',
            },
            {
                label: 'Điểm trung bình',
                value: reviewStats.averageRating,
                sub: `${reviewStats.totalReviews} đánh giá`,
                className: `${styles.metricCard} ${styles.cardDoctorServices}`,
                icon: 'ti ti-star',
                formatDecimal: true,
            },
        ];
    }, [reviewStats]);

    const ratingChartData = useMemo(() => {
        if (!reviewStats?.ratingDistribution) return [];

        // Đảm bảo ratingDistribution là một mảng
        const ratingDistribution = Array.isArray(reviewStats.ratingDistribution)
            ? reviewStats.ratingDistribution
            : [];

        if (ratingDistribution.length === 0) return [];

        return ratingDistribution
            .slice() // Tạo bản sao để tránh mutate mảng gốc
            .sort((a, b) => b.rating - a.rating)
            .map((dist) => ({
                label: `${dist.rating}⭐`,
                value1: dist.count || 0,
                value2: dist.percentage || 0,
            }));
    }, [reviewStats]);

    const peakHoursChartData = useMemo<ChartPoint[]>(() => {
        if (!additionalStats?.peakHours) return [];
        return additionalStats.peakHours.map((item) => ({
            label: item.hour,
            value: item.count,
        }));
    }, [additionalStats]);

    const completedVsCancelledData = useMemo(() => {
        if (!stats) return [];
        return [
            {
                label: 'Hoàn thành',
                value1: stats.completedAppointments,
                value2: stats.confirmedAppointments,
            },
            {
                label: 'Hủy/Vắng',
                value1: stats.cancelledAppointments,
                value2: stats.pendingAppointments,
            },
        ];
    }, [stats]);

    const appointmentTypeChartData = useMemo(() => {
        if (!additionalStats?.appointmentTypeStats) return [];
        return [
            {
                label: 'Tư vấn online',
                value: additionalStats.appointmentTypeStats.telehealth,
            },
            {
                label: 'Khám trực tiếp',
                value: additionalStats.appointmentTypeStats.inPerson,
            },
        ];
    }, [additionalStats]);

    if (!doctorProfile?.id) {
        return (
            <div className="content">
                <div className="alert alert-warning" role="alert">
                    <i className="ti ti-alert-triangle me-2" /> Không tìm thấy thông tin bác sĩ. Vui
                    lòng đăng nhập lại.
                </div>
            </div>
        );
    }

    const doctorName = `${doctorProfile.firstName || ''} ${doctorProfile.lastName || ''}`.trim();

    return (
        <div className={`content ${styles.dashboardPage}`} id="doctorDashboardPage">
            <div className={styles.pageHeader}>
                <h5 className={styles.pageTitle}>Thống kê & báo cáo</h5>
                <p className={styles.pageSubtitle}>
                    <span className={styles.hospitalName}>BS. {doctorName || 'Bác sĩ'}</span>
                    <span className={styles.dateRangeBadge}>
                        {formatDateDisplay(dateRange.start)} - {formatDateDisplay(dateRange.end)}
                    </span>
                </p>
            </div>

            <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
                <div className="card-body">
                    <div className={styles.filtersHeader}>
                        <div className={styles.filtersRow}>
                            <div className={styles.filterControl}>
                                <label htmlFor="dateFrom">Từ ngày</label>
                                <FilterDatePicker
                                    id="dateFrom"
                                    value={dateRange.start}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            handleDateChange(
                                                'start',
                                                format(newValue, 'yyyy-MM-dd')
                                            );
                                        }
                                    }}
                                    maxDate={dateRange.end || undefined}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles.filterControl}>
                                <label htmlFor="dateTo">Đến ngày</label>
                                <FilterDatePicker
                                    id="dateTo"
                                    value={dateRange.end}
                                    onChange={(newValue) => {
                                        if (newValue) {
                                            handleDateChange('end', format(newValue, 'yyyy-MM-dd'));
                                        }
                                    }}
                                    minDate={dateRange.start || undefined}
                                    maxDate={new Date()}
                                    disabled={isLoading}
                                />
                            </div>
                            <div className={styles.filterControl}>
                                <label htmlFor="periodSelect">Chu kỳ thống kê</label>
                                <Select
                                    inputId="periodSelect"
                                    options={periodOptions.map((opt) => ({
                                        value: opt.value,
                                        label: opt.label,
                                    }))}
                                    value={periodOptions
                                        .map((opt) => ({ value: opt.value, label: opt.label }))
                                        .find((opt) => opt.value === period)}
                                    onChange={(selectedOption) => {
                                        if (selectedOption) {
                                            setPeriod(selectedOption.value as StatisticsPeriod);
                                        }
                                    }}
                                    placeholder="Chọn chu kỳ thống kê"
                                    classNamePrefix="select2"
                                    styles={{
                                        ...selectCustomStyles,
                                        control: (provided: any) => ({
                                            ...selectCustomStyles.control(provided),
                                            minHeight: '30px',
                                            height: '30px',
                                        }),
                                    }}
                                    menuPortalTarget={document.body}
                                    isDisabled={isLoading}
                                    isSearchable={false}
                                />
                            </div>
                        </div>
                        <div className={styles.exportAction}>
                            <ActionDropdown
                                type="export"
                                options={[
                                    { value: 'pdf', label: 'Tải xuống dạng PDF', format: 'pdf' },
                                    {
                                        value: 'excel',
                                        label: 'Tải xuống dạng Excel',
                                        format: 'excel',
                                    },
                                ]}
                                onExport={(format: string) => {
                                    console.log('Exporting:', format);
                                    // Handle export logic here
                                }}
                                size="sm"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-danger mb-0" role="alert">
                            <i className="ti ti-alert-triangle me-2" />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {isLoading || isLoadingReviewStats ? (
                <>
                    <div className={styles.trendCard}>
                        <div className={styles.cardHeader}>
                            <h5>Tổng quan lịch hẹn</h5>
                            <span>
                                Số liệu theo: {periodOptions.find((p) => p.value === period)?.label}
                            </span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={`${styles.metricsGrid} ${styles.overviewGrid}`}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <MetricCardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                    {isLoading && (
                        <>
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Xu hướng lịch hẹn</h5>
                                    <span>
                                        Số liệu theo:{' '}
                                        {periodOptions.find((p) => p.value === period)?.label}
                                    </span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartSkeleton />
                                </div>
                            </div>
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Bệnh nhân mới</h5>
                                    <span>Theo dõi số lượt đặt lịch lần đầu</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartSkeleton />
                                </div>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    {stats && (
                        <>
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Tổng quan lịch hẹn</h5>
                                    <span>
                                        Số liệu theo:{' '}
                                        {periodOptions.find((p) => p.value === period)?.label}
                                    </span>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={`${styles.metricsGrid} ${styles.overviewGrid}`}>
                                        {overviewMetrics.map((metric) => (
                                            <MetricCard
                                                key={metric.label}
                                                label={metric.label}
                                                value={metric.value}
                                                sub={metric.sub}
                                                className={metric.className}
                                                icon={metric.icon}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {reviewStats && (
                                <div className={styles.trendCard}>
                                    <div className={styles.cardHeader}>
                                        <h5>Thống kê đánh giá</h5>
                                        <span>Tổng hợp đánh giá từ bệnh nhân</span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div
                                            className={`${styles.metricsGrid} ${styles.hospitalOverviewGrid}`}
                                        >
                                            {reviewMetrics.map((metric) => (
                                                <MetricCard
                                                    key={metric.label}
                                                    label={metric.label}
                                                    value={metric.value}
                                                    sub={metric.sub}
                                                    className={metric.className}
                                                    icon={metric.icon}
                                                    formatDecimal={(metric as any).formatDecimal}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {additionalStats && (
                                <div className={styles.trendCard}>
                                    <div className={styles.cardHeader}>
                                        <h5>Thống kê bổ sung</h5>
                                        <span>Các chỉ số quan trọng khác</span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div
                                            className={`${styles.metricsGrid} ${styles.hospitalOverviewGrid}`}
                                        >
                                            <MetricCard
                                                label="Tỷ lệ hoàn thành"
                                                value={additionalStats.completionRate}
                                                sub={`${formatPercent(additionalStats.completionRate)} tỷ lệ`}
                                                className={`${styles.metricCard} ${styles.cardDoctors}`}
                                                icon="ti ti-chart-line"
                                                formatDecimal={true}
                                            />
                                            <MetricCard
                                                label="Bệnh nhân quay lại"
                                                value={additionalStats.returningPatients}
                                                sub={`${numberFormatter.format(stats?.newPatients || 0)} bệnh nhân mới`}
                                                className={`${styles.metricCard} ${styles.cardMedicalServices}`}
                                                icon="ti ti-repeat"
                                            />
                                            <MetricCard
                                                label="Tư vấn online"
                                                value={
                                                    additionalStats.appointmentTypeStats.telehealth
                                                }
                                                sub={`${numberFormatter.format(additionalStats.appointmentTypeStats.inPerson)} khám trực tiếp`}
                                                className={`${styles.metricCard} ${styles.cardSpecialty}`}
                                                icon="ti ti-video"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {ratingChartData.length > 0 && (
                                <div className={styles.trendCard}>
                                    <div className={styles.cardHeader}>
                                        <h5>Phân bổ đánh giá</h5>
                                        <span>
                                            Phân bổ số lượng và phần trăm đánh giá theo điểm
                                        </span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <ChartJsMultiLine
                                            data={ratingChartData}
                                            color1="#8b5cf6"
                                            color2="#10b981"
                                            label1="Số đánh giá"
                                            label2="Phần trăm (%)"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Xu hướng lịch hẹn</h5>
                                    <span>
                                        Số liệu theo:{' '}
                                        {periodOptions.find((p) => p.value === period)?.label}
                                    </span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsLine
                                        data={appointmentTrendPoints}
                                        color="#36B6C5"
                                        label="Xu hướng lịch hẹn"
                                    />
                                </div>
                            </div>

                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Bệnh nhân mới</h5>
                                    <span>Theo dõi số lượt đặt lịch lần đầu</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsLine
                                        data={newPatientPoints}
                                        color="#818CF8"
                                        label="Bệnh nhân mới"
                                    />
                                </div>
                            </div>

                            {additionalStats && (
                                <>
                                    {completedVsCancelledData.length > 0 && (
                                        <div className={styles.trendCard}>
                                            <div className={styles.cardHeader}>
                                                <h5>So sánh hoàn thành vs hủy</h5>
                                                <span>Thống kê trạng thái lịch hẹn</span>
                                            </div>
                                            <div className={styles.cardBody}>
                                                <ChartJsMultiLine
                                                    data={completedVsCancelledData}
                                                    color1="#10b981"
                                                    color2="#ef4444"
                                                    label1="Hoàn thành/Xác nhận"
                                                    label2="Hủy/Chờ"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {peakHoursChartData.length > 0 && (
                                        <div className={styles.trendCard}>
                                            <div className={styles.cardHeader}>
                                                <h5>Thống kê theo giờ trong ngày</h5>
                                                <span>Giờ cao điểm và giờ ít khách</span>
                                            </div>
                                            <div className={styles.cardBody}>
                                                <ChartJsLine
                                                    data={peakHoursChartData}
                                                    color="#f59e0b"
                                                    label="Số lịch hẹn"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {appointmentTypeChartData.length > 0 && (
                                        <div className={styles.trendCard}>
                                            <div className={styles.cardHeader}>
                                                <h5>Thống kê theo loại khám</h5>
                                                <span>So sánh tư vấn online vs khám trực tiếp</span>
                                            </div>
                                            <div className={styles.cardBody}>
                                                <ChartJsLine
                                                    data={appointmentTypeChartData}
                                                    color="#06b6d4"
                                                    label="Số lịch hẹn"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    {!stats && (
                        <div className={styles.emptyState}>
                            <i className="ti ti-database-search mb-2 fs-4 d-block" /> Chưa có dữ
                            liệu thống kê. Vui lòng điều chỉnh bộ lọc hoặc thử lại sau.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DoctorDashboard;
