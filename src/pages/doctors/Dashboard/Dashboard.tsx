import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from '../../hospitals/Dashboard/Dashboard.module.scss';
import { RootState } from '@/store';
import AppointmentService from '@/services/appointment.service';
import ReviewService from '@/services/review.service';
import { StatisticsPeriod } from '@/types/statistics.types';
import { AppointmentStatus } from '@/enums/appointment.enums';
import { calculateAdditionalStatistics as calculateAdditionalStatisticsUtil } from '@/utils/dashboardStatistics';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import { ChartJsMultiLine, ChartJsLine } from '@/components/ChartJsLine';
import { DashboardFilters } from '@/components/DashboardFilters';
import { DashboardTrendCharts } from '@/components/DashboardTrendCharts';
import DashboardOverviewMetrics from '@/components/DashboardOverviewMetrics';
import DashboardReviewStats from '@/components/DashboardReviewStats';
import { useDashboardDateRange } from '@/hooks/useDashboardDateRange';
import {
    periodOptions,
    numberFormatter,
    formatPercent,
    formatDateDisplay,
    formatTrendLabel,
} from '@/utils/dashboard.utils';
import {
    AppointmentTrendPoint,
    NewPatientTrendPoint,
    calculateAppointmentTrends,
} from '@/utils/appointmentTrends';

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

const DoctorDashboard: React.FC = () => {
    const { doctorProfile } = useSelector((state: RootState) => state.user);
    const [period, setPeriod] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const { dateRange, isoRange, handleDateChange } = useDashboardDateRange();

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

    // Calculate additional statistics using shared utility
    const calculateAdditionalStatistics = useCallback(
        (appointments: any[]) => calculateAdditionalStatisticsUtil(appointments),
        []
    );

    // Calculate trend data based on period
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
                const trends = calculateAppointmentTrends(appointments, period);
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
    }, [doctorProfile?.id, isoRange.fromDate, isoRange.toDate, period, calculateStatistics]);

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
                label: 'Tư vấn trực tiếp',
                value: additionalStats.appointmentTypeStats.telehealth,
            },
            {
                label: 'Khám trực tiếp',
                value: additionalStats.appointmentTypeStats.inPerson,
            },
        ];
    }, [additionalStats]);

    const doctorName = `${doctorProfile?.firstName || ''} ${doctorProfile?.lastName || ''}`.trim();

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

            <DashboardFilters
                dateRange={dateRange}
                period={period}
                isLoading={isLoading}
                error={error}
                onDateChange={handleDateChange}
                onPeriodChange={setPeriod}
                onExport={(format: string) => {
                    console.log('Exporting:', format);
                    // Handle export logic here
                }}
            />

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
                        <DashboardTrendCharts
                            period={period}
                            appointmentTrendPoints={[]}
                            newPatientPoints={[]}
                            isLoading={true}
                        />
                    )}
                </>
            ) : (
                <>
                    {stats && (
                        <>
                            <DashboardOverviewMetrics
                                period={period}
                                metrics={overviewMetrics}
                                trendCardClassName={styles.trendCard}
                                cardHeaderClassName={styles.cardHeader}
                                cardBodyClassName={styles.cardBody}
                                metricsGridClassName={styles.metricsGrid}
                                overviewGridClassName={styles.overviewGrid}
                            />

                            {reviewStats && (
                                <DashboardReviewStats
                                    metrics={reviewMetrics}
                                    trendCardClassName={styles.trendCard}
                                    cardHeaderClassName={styles.cardHeader}
                                    cardBodyClassName={styles.cardBody}
                                    metricsGridClassName={styles.metricsGrid}
                                    hospitalOverviewGridClassName={styles.hospitalOverviewGrid}
                                />
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
                                                label="Tư vấn trực tiếp"
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

                            <DashboardTrendCharts
                                period={period}
                                appointmentTrendPoints={appointmentTrendPoints}
                                newPatientPoints={newPatientPoints}
                                isLoading={false}
                            />

                            {additionalStats && (
                                <>
                                    {completedVsCancelledData.length > 0 && (
                                        <div className={styles.trendCard}>
                                            <div className={styles.cardHeader}>
                                                <h5>Thống kê cuộc hẹn hoàn thành và hủy</h5>
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
                                                <span>
                                                    So sánh tư vấn trực tiếp vs khám trực tiếp
                                                </span>
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
