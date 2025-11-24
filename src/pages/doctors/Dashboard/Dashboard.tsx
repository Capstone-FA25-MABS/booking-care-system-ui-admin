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
import { DashboardFilters } from '@/components/DashboardFilters';
import { DashboardTrendCharts } from '@/components/DashboardTrendCharts';
import DashboardOverviewMetrics from '@/components/DashboardOverviewMetrics';
import DashboardReviewStats from '@/components/DashboardReviewStats';
import DashboardRatingDistributionChart from '@/components/DashboardRatingDistributionChart/DashboardRatingDistributionChart';
import DashboardAdditionalCharts from '@/components/DashboardAdditionalCharts/DashboardAdditionalCharts';
import { useDashboardDateRange } from '@/hooks/useDashboardDateRange';
import { useAppointmentStatistics } from '@/hooks/useAppointmentStatistics';
import {
    periodOptions,
    numberFormatter,
    formatPercent,
    formatDateDisplay,
} from '@/utils/dashboard.utils';
import { AppointmentMetricKey, buildAppointmentOverviewMetrics } from '@/utils/appointmentMetrics';
import {
    buildRatingChartData,
    buildPeakHoursChartData,
    buildAppointmentTypeChartData,
    ChartPoint,
} from '@/utils/dashboardChartData';
import { buildReviewMetrics, buildCompletionVsCancellationData } from '@/utils/reviewCharts';

const appointmentMetricPresentation: Record<
    AppointmentMetricKey,
    { className: string; icon: string }
> = {
    total: { className: styles.total, icon: 'ti ti-calendar-event' },
    completed: { className: styles.completed, icon: 'ti ti-circle-check' },
    pending: { className: styles.pending, icon: 'ti ti-clock-hour-4' },
    cancelled: { className: styles.cancelled, icon: 'ti ti-circle-x' },
    newPatients: { className: styles.newPatients, icon: 'ti ti-user-plus' },
};

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

type DoctorAdditionalStats = ReturnType<typeof calculateAdditionalStatisticsUtil>;

const DoctorDashboard: React.FC = () => {
    const { doctorProfile } = useSelector((state: RootState) => state.user);
    const [period, setPeriod] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const { dateRange, isoRange, handleDateChange } = useDashboardDateRange();

    const [reviewStats, setReviewStats] = useState<{
        totalReviews: number;
        averageRating: number;
        ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
    } | null>(null);
    const [isLoadingReviewStats, setIsLoadingReviewStats] = useState(false);

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

    const fetchDoctorAppointments = useCallback(async () => {
        if (!doctorProfile?.id || !isoRange.fromDate || !isoRange.toDate) {
            return null;
        }

        const response = await AppointmentService.getAppointmentsForManagement({
            doctorId: doctorProfile.id,
            fromDate: isoRange.fromDate.split('T')[0],
            toDate: isoRange.toDate.split('T')[0],
            pageNumber: 1,
            pageSize: 10000, // Get all appointments
            includeStatusCounts: false,
        });

        return response.data?.appointments ?? [];
    }, [doctorProfile?.id, isoRange.fromDate, isoRange.toDate]);

    const {
        stats,
        appointmentTrendPoints,
        newPatientTrendPoints,
        additionalStats,
        isLoading,
        error,
    } = useAppointmentStatistics<DoctorStatistics, DoctorAdditionalStats>({
        period,
        fetchAppointments: fetchDoctorAppointments,
        calculateStatistics,
        calculateAdditionalStatistics,
        onError: (message) => toast.error(message),
        disabled: !doctorProfile?.id,
    });

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
        return buildAppointmentOverviewMetrics(stats).map((metric) => {
            const presentation = appointmentMetricPresentation[metric.key];
            return {
                label: metric.label,
                value: metric.value,
                sub: metric.sub,
                className: `${styles.metricCard} ${presentation.className}`,
                icon: presentation.icon,
            };
        });
    }, [stats]);

    type DoctorReviewStats = NonNullable<typeof reviewStats>;

    const reviewMetrics = useMemo(
        () =>
            buildReviewMetrics<DoctorReviewStats>(reviewStats, [
                {
                    label: 'Tổng đánh giá',
                    getValue: (stats) => stats.totalReviews,
                    getSub: (stats) => `${stats.averageRating.toFixed(1)}⭐ điểm trung bình`,
                    className: `${styles.metricCard} ${styles.cardSpecialty}`,
                    icon: 'ti ti-star-filled',
                },
                {
                    label: 'Điểm trung bình',
                    getValue: (stats) => stats.averageRating,
                    getSub: (stats) => `${stats.totalReviews} đánh giá`,
                    className: `${styles.metricCard} ${styles.cardDoctorServices}`,
                    icon: 'ti ti-star',
                    formatDecimal: true,
                },
            ]),
        [reviewStats]
    );

    const ratingChartData = useMemo(
        () => buildRatingChartData(reviewStats?.ratingDistribution),
        [reviewStats]
    );

    const peakHoursChartData = useMemo<ChartPoint[]>(
        () => buildPeakHoursChartData(additionalStats?.peakHours),
        [additionalStats]
    );

    const completedVsCancelledData = useMemo(
        () => buildCompletionVsCancellationData(stats),
        [stats]
    );

    const appointmentTypeChartData = useMemo(
        () => buildAppointmentTypeChartData(additionalStats?.appointmentTypeStats),
        [additionalStats]
    );

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

                            <DashboardRatingDistributionChart
                                data={ratingChartData}
                                trendCardClassName={styles.trendCard}
                                cardHeaderClassName={styles.cardHeader}
                                cardBodyClassName={styles.cardBody}
                            />

                            <DashboardTrendCharts
                                period={period}
                                appointmentTrendPoints={appointmentTrendPoints}
                                newPatientPoints={newPatientTrendPoints}
                                isLoading={false}
                            />

                            {additionalStats && (
                                <DashboardAdditionalCharts
                                    completedVsCancelledData={completedVsCancelledData}
                                    peakHoursChartData={peakHoursChartData}
                                    appointmentTypeChartData={appointmentTypeChartData}
                                    trendCardClassName={styles.trendCard}
                                    cardHeaderClassName={styles.cardHeader}
                                    cardBodyClassName={styles.cardBody}
                                />
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
