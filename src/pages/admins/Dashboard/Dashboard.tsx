import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './Dashboard.module.scss';
import AppointmentService from '@/services/appointment.service';
import ReviewService from '@/services/review.service';
import { DoctorService } from '@/services/doctor.service';
import { HospitalService } from '@/services/hospital.service';
import { DiscountService } from '@/services/discount.service';
import { SubscriptionService } from '@/services/subscription.service';
import { serviceService } from '@/services/service.service';
import { getAllSpecialtiesSimple } from '@/services/specialty.service';
import { getAllServiceTypesSimple } from '@/services/serviceType.service';
import { getAllPositionsSimple } from '@/services/position.service';
import { getAllLanguagesSimple } from '@/services/language.service';
import { StatisticsPeriod } from '@/types/statistics.types';
import { AppointmentStatus } from '@/enums/appointment.enums';
import { calculateAdditionalStatistics as calculateAdditionalStatisticsUtil } from '@/utils/dashboardStatistics';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import { ChartJsMultiLine, ChartJsLine } from '@/components/ChartJsLine';
import { ChartJsTripleLine } from '@/components/ChartJsLine/ChartJsTripleLine';
import DashboardReviewStats from '@/components/DashboardReviewStats';
import DashboardTopRankings from '@/components/DashboardTopRankings/DashboardTopRankings';
import { DashboardFilters } from '@/components/DashboardFilters';
import { DashboardTrendCharts } from '@/components/DashboardTrendCharts';
import DashboardOverviewMetrics from '@/components/DashboardOverviewMetrics';
import { useDashboardDateRange } from '@/hooks/useDashboardDateRange';
import {
    periodOptions,
    numberFormatter,
    formatPercent,
    formatDateDisplay,
    formatTrendLabel,
} from '@/utils/dashboard.utils';
import {
    AppointmentMetricKey,
    AppointmentMetricOverride,
    buildAppointmentOverviewMetrics,
} from '@/utils/appointmentMetrics';
import {
    buildDoctorReviewInsights,
    buildServiceReviewInsights,
    buildRatingDistribution,
} from '@/utils/reviewStats';
import {
    buildAppointmentTrendPoints,
    buildNewPatientTrendPoints,
    buildRatingChartData,
    buildPeakHoursChartData,
    buildAppointmentTypeChartData,
    ChartPoint,
} from '@/utils/dashboardChartData';
import { useAppointmentStatistics } from '@/hooks/useAppointmentStatistics';

interface AdminStatistics {
    totalAppointments: number;
    completedAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    newPatients: number;
    noShowRate: number;
}

interface SystemOverview {
    totalHospitals: number;
    totalDoctors: number;
    totalAppointments: number;
    totalUsers: number;
    totalRevenue: number;
    totalDiscounts: number;
    totalSubscriptionPlans: number;
    totalSpecialties: number;
    totalServiceTypes: number;
    totalPositions: number;
    totalLanguages: number;
}

type AdminAdditionalStats = ReturnType<typeof calculateAdditionalStatisticsUtil>;

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

const adminMetricOverrides: Partial<Record<AppointmentMetricKey, AppointmentMetricOverride>> = {
    total: {
        getSub: (stats) =>
            `Trong khoảng thời gian đã chọn | ${formatPercent(stats.noShowRate ?? 0)} vắng/huỷ`,
    },
    pending: {
        sub: 'Chờ xác nhận',
    },
    newPatients: {
        sub: 'Bệnh nhân đặt lịch lần đầu',
    },
};

const AdminDashboard: React.FC = () => {
    const [period, setPeriod] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const { dateRange, isoRange, handleDateChange } = useDashboardDateRange();

    const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [reviewStats, setReviewStats] = useState<{
        doctorTotalReviews: number;
        serviceTotalReviews: number;
        doctorAverageRating: number;
        serviceAverageRating: number;
        ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
        topDoctors: Array<{ id: string; name: string; rating: number; reviews: number }>;
        topServices: Array<{ id: string; name: string; rating: number; reviews: number }>;
        doctorChartData: Array<{ label: string; value1: number; value2: number }>;
        serviceChartData: Array<{ label: string; value1: number; value2: number }>;
    } | null>(null);
    const [subscriptionChartData, setSubscriptionChartData] = useState<
        Array<{
            label: string;
            value1: number; // Hủy
            value2: number; // Upgrade
            value3: number; // Tổng
        }>
    >([]);
    const [isLoadingReviewStats, setIsLoadingReviewStats] = useState(false);
    const [isLoadingSubscriptionChart, setIsLoadingSubscriptionChart] = useState(false);

    // Load system overview (hospitals, doctors, etc.)
    const loadSystemOverview = useCallback(async () => {
        setIsLoadingOverview(true);
        try {
            // Get total counts - using pagination with pageSize=1 to get totalCount
            const [
                hospitalsRes,
                doctorsRes,
                appointmentsRes,
                discountsRes,
                subscriptionPlansRes,
                specialtiesRes,
                serviceTypesRes,
                positionsRes,
                languagesRes,
            ] = await Promise.all([
                // Get hospitals with filter to get totalCount
                HospitalService.getHospitals({ pageNumber: 1, pageSize: 1 }).catch(() => ({
                    data: { hospitals: [], totalCount: 0 },
                })),
                DoctorService.filterDoctors({ pageNumber: 1, pageSize: 1 }).catch(() => ({
                    data: { totalCount: 0 },
                })),
                // Get ALL appointments (no date range) to get total count
                AppointmentService.getAppointmentsForManagement({
                    fromDate: undefined,
                    toDate: undefined,
                    pageNumber: 1,
                    pageSize: 1,
                    includeStatusCounts: true,
                }).catch(() => ({ data: { totalCount: 0 } })),
                DiscountService.getDiscounts({ page: 1, limit: 1 }).catch(() => ({
                    data: { pagination: { total: 0 } },
                })),
                SubscriptionService.getAllSubscriptionPlans().catch(() => ({
                    data: { totalCount: 0 },
                })),
                getAllSpecialtiesSimple().catch(() => ({ data: [] })),
                getAllServiceTypesSimple().catch(() => ({ data: [] })),
                getAllPositionsSimple().catch(() => ({ data: [] })),
                getAllLanguagesSimple().catch(() => ({ data: [] })),
            ]);

            // Get actual counts from responses
            const totalHospitals = (hospitalsRes.data as any)?.totalCount || 0;
            const totalDoctors = (doctorsRes.data as any)?.totalCount || 0;
            const totalAppointments = (appointmentsRes.data as any)?.totalCount || 0;
            const totalDiscounts = (discountsRes.data as any)?.pagination?.total || 0;
            const totalSubscriptionPlans = (subscriptionPlansRes.data as any)?.totalCount || 0;
            const totalSpecialties = Array.isArray(specialtiesRes.data)
                ? specialtiesRes.data.length
                : 0;
            const totalServiceTypes = Array.isArray(serviceTypesRes.data)
                ? serviceTypesRes.data.length
                : 0;
            const totalPositions = Array.isArray(positionsRes.data) ? positionsRes.data.length : 0;
            const totalLanguages = Array.isArray(languagesRes.data) ? languagesRes.data.length : 0;

            setSystemOverview({
                totalHospitals,
                totalDoctors,
                totalAppointments,
                totalUsers: 0, // Need user service endpoint
                totalRevenue: 0, // Need payment statistics endpoint
                totalDiscounts,
                totalSubscriptionPlans,
                totalSpecialties,
                totalServiceTypes,
                totalPositions,
                totalLanguages,
            });
        } catch (err: any) {
            console.error('Failed to load system overview:', err);
            setSystemOverview({
                totalHospitals: 0,
                totalDoctors: 0,
                totalAppointments: 0,
                totalUsers: 0,
                totalRevenue: 0,
                totalDiscounts: 0,
                totalSubscriptionPlans: 0,
                totalSpecialties: 0,
                totalServiceTypes: 0,
                totalPositions: 0,
                totalLanguages: 0,
            });
        } finally {
            setIsLoadingOverview(false);
        }
    }, []);

    useEffect(() => {
        loadSystemOverview();
    }, [loadSystemOverview]);

    // Calculate statistics from appointments
    const calculateStatistics = useCallback(
        async (appointments: any[]): Promise<AdminStatistics> => {
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

            // Calculate new patients (unique patient IDs in the period)
            const uniquePatients = new Set(appointments.map((a) => a.patientId).filter((id) => id));
            const newPatients = uniquePatients.size;

            const noShowRate =
                totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

            return {
                totalAppointments,
                completedAppointments,
                confirmedAppointments,
                pendingAppointments,
                cancelledAppointments,
                newPatients,
                noShowRate,
            };
        },
        []
    );

    // Calculate additional statistics using shared utility
    const calculateAdditionalStatistics = useCallback(
        (appointments: any[]) => calculateAdditionalStatisticsUtil(appointments),
        []
    );

    const fetchAdminAppointments = useCallback(async () => {
        if (!isoRange.fromDate || !isoRange.toDate) {
            return null;
        }

        const response = await AppointmentService.getAppointmentsForManagement({
            fromDate: isoRange.fromDate.split('T')[0],
            toDate: isoRange.toDate.split('T')[0],
            pageNumber: 1,
            pageSize: 10000, // Get all appointments
            includeStatusCounts: false,
        });

        return response.data?.appointments ?? [];
    }, [isoRange.fromDate, isoRange.toDate]);

    const { stats, appointmentTrend, newPatientTrend, additionalStats, isLoading, error } =
        useAppointmentStatistics<AdminStatistics, AdminAdditionalStats>({
            period,
            fetchAppointments: fetchAdminAppointments,
            calculateStatistics,
            calculateAdditionalStatistics,
            onError: (message) => toast.error(message),
        });

    const loadReviewStatistics = useCallback(async () => {
        setIsLoadingReviewStats(true);
        try {
            // Get all doctors and services to calculate overall review stats
            const [doctorsRes, servicesRes] = await Promise.all([
                DoctorService.filterDoctors({ pageNumber: 1, pageSize: 1000 }).catch(() => ({
                    data: { doctors: [], totalCount: 0 },
                })),
                // Get all services - using service service
                serviceService.getAllServices(1, 1000).catch(() => ({
                    data: { items: [] },
                })),
            ]);

            const doctors = (doctorsRes.data as any)?.doctors || [];
            const services = Array.isArray((servicesRes.data as any)?.items)
                ? (servicesRes.data as any).items
                : [];

            if (doctors.length > 0 || services.length > 0) {
                const [doctorsStatsRes, servicesStatsRes] = await Promise.all([
                    doctors.length > 0
                        ? ReviewService.getBatchDoctorsStatistics({
                              doctorIds: doctors.map((d: any) => d.id),
                          }).catch(() => ({ data: { doctorStatistics: {} } }))
                        : Promise.resolve({ data: { doctorStatistics: {} } }),
                    services.length > 0
                        ? ReviewService.getBatchServicesStatistics({
                              serviceIds: services.map((s: any) => s.id),
                          }).catch(() => ({ data: { serviceStatistics: {} } }))
                        : Promise.resolve({ data: { serviceStatistics: {} } }),
                ]);

                const doctorsStats = (doctorsStatsRes.data as any)?.doctorStatistics || {};
                const servicesStats = (servicesStatsRes.data as any)?.serviceStatistics || {};

                const doctorInsights = buildDoctorReviewInsights(doctors, doctorsStats);
                const serviceInsights = buildServiceReviewInsights(services, servicesStats);
                const ratingDistribution = buildRatingDistribution([
                    doctorInsights.ratingDistributions,
                    serviceInsights.ratingDistributions,
                ]);

                setReviewStats({
                    doctorTotalReviews: doctorInsights.totalReviews,
                    serviceTotalReviews: serviceInsights.totalReviews,
                    doctorAverageRating: doctorInsights.averageRating,
                    serviceAverageRating: serviceInsights.averageRating,
                    ratingDistribution,
                    topDoctors: doctorInsights.topEntities,
                    topServices: serviceInsights.topEntities,
                    doctorChartData: doctorInsights.chartData,
                    serviceChartData: serviceInsights.chartData,
                });
            }
        } catch (err: any) {
            console.error('Failed to load review statistics:', err);
            setReviewStats(null);
        } finally {
            setIsLoadingReviewStats(false);
        }
    }, []);

    useEffect(() => {
        loadReviewStatistics();
    }, [loadReviewStatistics]);

    const loadSubscriptionChart = useCallback(async () => {
        setIsLoadingSubscriptionChart(true);
        try {
            // Get all subscriptions and plans
            const [subscriptionsRes, plansRes] = await Promise.all([
                SubscriptionService.getAllHospitalSubscriptions().catch(() => ({
                    data: [],
                })),
                SubscriptionService.getAllSubscriptionPlans().catch(() => ({
                    data: { subscriptionPlans: [] },
                })),
            ]);

            const subscriptions = (subscriptionsRes.data as any) || [];
            const plans = (plansRes.data as any)?.subscriptionPlans || [];

            // Initialize all plans with counts for cancelled, upgraded, and total
            const planStats: Record<
                string,
                { cancelled: number; upgraded: number; total: number }
            > = {};
            plans.forEach((plan: any) => {
                planStats[plan.name] = { cancelled: 0, upgraded: 0, total: 0 };
            });

            // Group subscriptions by hospital to detect upgrades
            const hospitalSubscriptions: Record<string, any[]> = {};
            subscriptions.forEach((sub: any) => {
                const hospitalId = sub.hospitalId;
                if (!hospitalSubscriptions[hospitalId]) {
                    hospitalSubscriptions[hospitalId] = [];
                }
                hospitalSubscriptions[hospitalId].push(sub);
            });

            // Count subscriptions by plan
            subscriptions.forEach((sub: any) => {
                const planName = sub.subscriptionPlan?.name;
                if (!planName || !planStats[planName]) return;

                planStats[planName].total++;

                // Count cancelled
                if (sub.status === 'CANCELLED') {
                    planStats[planName].cancelled++;
                }
            });

            // Detect upgrades: if a hospital has multiple subscriptions with different plans,
            // and a newer subscription has a different (higher tier) plan, count as upgrade
            Object.values(hospitalSubscriptions).forEach((hospitalSubs: any[]) => {
                if (hospitalSubs.length < 2) return;

                // Sort by creation date
                const sorted = [...hospitalSubs].sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                );

                // Check if there's an upgrade (newer subscription with different plan)
                for (let i = 1; i < sorted.length; i++) {
                    const prevSub = sorted[i - 1];
                    const currSub = sorted[i];
                    const prevPlanName = prevSub.subscriptionPlan?.name;
                    const currPlanName = currSub.subscriptionPlan?.name;

                    if (
                        prevPlanName &&
                        currPlanName &&
                        prevPlanName !== currPlanName &&
                        currSub.status === 'ACTIVE' &&
                        planStats[currPlanName]
                    ) {
                        planStats[currPlanName].upgraded++;
                    }
                }
            });

            // Create chart data for all plans
            const chartData = Object.entries(planStats)
                .map(([label, stats]) => ({
                    label,
                    value1: stats.cancelled,
                    value2: stats.upgraded,
                    value3: stats.total,
                }))
                .sort((a, b) => {
                    // Sort by total descending first, then by name ascending
                    if (b.value3 !== a.value3) {
                        return b.value3 - a.value3;
                    }
                    return a.label.localeCompare(b.label);
                });

            setSubscriptionChartData(chartData);
        } catch (err: any) {
            console.error('Failed to load subscription chart:', err);
            setSubscriptionChartData([]);
        } finally {
            setIsLoadingSubscriptionChart(false);
        }
    }, []);

    useEffect(() => {
        loadSubscriptionChart();
    }, [loadSubscriptionChart]);

    const systemOverviewMetrics = useMemo(() => {
        if (!systemOverview) return [];
        return [
            {
                label: 'Tổng số bệnh viện',
                value: systemOverview.totalHospitals,
                sub: 'Bệnh viện đã đăng ký',
                className: `${styles.metricCard} ${styles.cardHospitals}`,
                icon: 'ti ti-building-hospital',
            },
            {
                label: 'Tổng số bác sĩ',
                value: systemOverview.totalDoctors,
                sub: 'Bác sĩ đang hoạt động',
                className: `${styles.metricCard} ${styles.cardDoctors}`,
                icon: 'ti ti-user',
            },
            {
                label: 'Tổng số cuộc hẹn',
                value: systemOverview.totalAppointments,
                sub: 'Tất cả cuộc hẹn trong hệ thống',
                className: `${styles.metricCard} ${styles.cardAppointments}`,
                icon: 'ti ti-calendar-event',
            },
            {
                label: 'Tổng số mã giảm giá',
                value: systemOverview.totalDiscounts,
                sub: 'Mã giảm giá hiện có',
                className: `${styles.metricCard} ${styles.cardDiscounts}`,
                icon: 'ti ti-discount',
            },
            {
                label: 'Gói đăng ký',
                value: systemOverview.totalSubscriptionPlans,
                sub: 'Tổng số gói đăng ký',
                className: `${styles.metricCard} ${styles.cardSubscriptions}`,
                icon: 'ti ti-package',
            },
            {
                label: 'Số chuyên khoa',
                value: systemOverview.totalSpecialties,
                sub: 'Chuyên khoa hiện có',
                className: `${styles.metricCard} ${styles.cardSpecialty}`,
                icon: 'ti ti-stethoscope',
            },
            {
                label: 'Số dịch vụ bác sĩ',
                value: systemOverview.totalServiceTypes,
                sub: 'Loại dịch vụ bác sĩ',
                className: `${styles.metricCard} ${styles.cardServiceType}`,
                icon: 'ti ti-briefcase',
            },
            {
                label: 'Số học vị',
                value: systemOverview.totalPositions,
                sub: 'Học vị hiện có',
                className: `${styles.metricCard} ${styles.cardPosition}`,
                icon: 'ti ti-certificate',
            },
            {
                label: 'Số ngôn ngữ',
                value: systemOverview.totalLanguages,
                sub: 'Ngôn ngữ hỗ trợ',
                className: `${styles.metricCard} ${styles.cardLanguage}`,
                icon: 'ti ti-language',
            },
        ];
    }, [systemOverview]);

    const overviewMetrics = useMemo(() => {
        if (!stats) return [];
        return buildAppointmentOverviewMetrics(stats, adminMetricOverrides).map((metric) => {
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

    const appointmentTrendPoints = useMemo<ChartPoint[]>(
        () => buildAppointmentTrendPoints(appointmentTrend),
        [appointmentTrend]
    );

    const newPatientPoints = useMemo<ChartPoint[]>(
        () => buildNewPatientTrendPoints(newPatientTrend),
        [newPatientTrend]
    );

    const reviewMetrics = useMemo(() => {
        if (!reviewStats) return [];
        return [
            {
                label: 'Tổng đánh giá bác sĩ',
                value: reviewStats.doctorTotalReviews,
                sub: `${reviewStats.doctorAverageRating.toFixed(1)}⭐ điểm trung bình`,
                className: `${styles.metricCard} ${styles.cardReview}`,
                icon: 'ti ti-user',
            },
            {
                label: 'Tổng đánh giá dịch vụ',
                value: reviewStats.serviceTotalReviews,
                sub: `${reviewStats.serviceAverageRating.toFixed(1)}⭐ điểm trung bình`,
                className: `${styles.metricCard} ${styles.cardServiceType}`,
                icon: 'ti ti-briefcase',
            },
            {
                label: 'Điểm trung bình bác sĩ',
                value: reviewStats.doctorAverageRating,
                sub: `${reviewStats.doctorTotalReviews} đánh giá`,
                className: `${styles.metricCard} ${styles.cardRating}`,
                icon: 'ti ti-star',
                formatDecimal: true,
            },
            {
                label: 'Điểm trung bình dịch vụ',
                value: reviewStats.serviceAverageRating,
                sub: `${reviewStats.serviceTotalReviews} đánh giá`,
                className: `${styles.metricCard} ${styles.cardPosition}`,
                icon: 'ti ti-star',
                formatDecimal: true,
            },
        ];
    }, [reviewStats]);

    const ratingChartData = useMemo(
        () => buildRatingChartData(reviewStats?.ratingDistribution),
        [reviewStats]
    );

    const peakHoursChartData = useMemo<ChartPoint[]>(
        () => buildPeakHoursChartData(additionalStats?.peakHours),
        [additionalStats]
    );

    const completedVsCancelledData = useMemo(() => {
        if (!appointmentTrend || appointmentTrend.length === 0) return [];
        return appointmentTrend.map((point) => ({
            label: formatTrendLabel(point.periodStart, point.periodEnd),
            value1: point.completedAppointments,
            value2: point.cancelledAppointments,
        }));
    }, [appointmentTrend]);

    const appointmentTypeChartData = useMemo<ChartPoint[]>(
        () => buildAppointmentTypeChartData(additionalStats?.appointmentTypeStats),
        [additionalStats]
    );

    return (
        <div className={`content ${styles.dashboardPage}`} id="adminDashboardPage">
            <div className={styles.pageHeader}>
                <h5 className={styles.pageTitle}>Thống kê & báo cáo hệ thống</h5>
                <p className={styles.pageSubtitle}>
                    <span className={styles.adminBadge}>Quản trị viên</span>
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
                }}
            />

            {isLoadingOverview ? (
                <div className={styles.trendCard}>
                    <div className={styles.cardHeader}>
                        <h5>Tổng quan hệ thống</h5>
                        <span>Thông tin tổng hợp</span>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={`${styles.metricsGrid} ${styles.overviewGrid}`}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                <MetricCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                systemOverview && (
                    <div className={styles.trendCard}>
                        <div className={styles.cardHeader}>
                            <h5>Tổng quan hệ thống</h5>
                            <span>Thông tin tổng hợp</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={`${styles.metricsGrid} ${styles.overviewGrid}`}>
                                {systemOverviewMetrics.map((metric) => (
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
                )
            )}

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

                            {additionalStats && (
                                <div className={styles.trendCard}>
                                    <div className={styles.cardHeader}>
                                        <h5>Thống kê bổ sung</h5>
                                        <span>Các chỉ số quan trọng khác</span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div
                                            className={`${styles.metricsGrid} ${styles.overviewGrid}`}
                                        >
                                            <MetricCard
                                                label="Tỷ lệ hoàn thành"
                                                value={additionalStats.completionRate}
                                                sub={`${formatPercent(additionalStats.completionRate)} tỷ lệ`}
                                                className={`${styles.metricCard} ${styles.cardSubscriptions}`}
                                                icon="ti ti-chart-line"
                                                formatDecimal={true}
                                            />
                                            <MetricCard
                                                label="Bệnh nhân quay lại"
                                                value={additionalStats.returningPatients}
                                                sub={`${numberFormatter.format(stats?.newPatients || 0)} bệnh nhân mới`}
                                                className={`${styles.metricCard} ${styles.cardHospitals}`}
                                                icon="ti ti-repeat"
                                            />
                                            <MetricCard
                                                label="Tư vấn trực tiếp"
                                                value={
                                                    additionalStats.appointmentTypeStats.telehealth
                                                }
                                                sub={`${numberFormatter.format(additionalStats.appointmentTypeStats.inPerson)} khám trực tiếp`}
                                                className={`${styles.metricCard} ${styles.cardDoctors}`}
                                                icon="ti ti-video"
                                            />
                                            <MetricCard
                                                label="Khám trực tiếp"
                                                value={
                                                    additionalStats.appointmentTypeStats.inPerson
                                                }
                                                sub={`${numberFormatter.format(additionalStats.appointmentTypeStats.telehealth)} tư vấn trực tiếp`}
                                                className={`${styles.metricCard} ${styles.cardLanguage}`}
                                                icon="ti ti-building-hospital"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {reviewStats && (
                                <>
                                    <DashboardReviewStats
                                        metrics={reviewMetrics}
                                        trendCardClassName={styles.trendCard}
                                        cardHeaderClassName={styles.cardHeader}
                                        cardBodyClassName={styles.cardBody}
                                        metricsGridClassName={styles.metricsGrid}
                                        hospitalOverviewGridClassName={styles.overviewGrid}
                                    />

                                    <DashboardTopRankings
                                        topDoctors={reviewStats.topDoctors}
                                        topServices={reviewStats.topServices}
                                        containerClassName={styles.topRankingsContainer}
                                        cardClassName={styles.trendCard}
                                        cardHeaderClassName={styles.cardHeader}
                                        cardBodyClassName={styles.cardBody}
                                        listClassName={styles.topList}
                                        itemClassName={styles.topItem}
                                        rankClassName={styles.topRank}
                                        infoClassName={styles.topInfo}
                                        nameClassName={styles.topName}
                                        statsClassName={styles.topStats}
                                        ratingClassName={styles.topRating}
                                        reviewsClassName={styles.topReviews}
                                    />

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

                                    {reviewStats.doctorChartData.length > 0 && (
                                        <div className={styles.trendCard}>
                                            <div className={styles.cardHeader}>
                                                <h5>Đánh giá theo bác sĩ</h5>
                                                <span>
                                                    Điểm đánh giá và số đánh giá của từng bác sĩ
                                                </span>
                                            </div>
                                            <div className={styles.cardBody}>
                                                <ChartJsMultiLine
                                                    data={reviewStats.doctorChartData}
                                                    color1="#8b5cf6"
                                                    color2="#10b981"
                                                    label1="Điểm đánh giá"
                                                    label2="Số đánh giá"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {reviewStats.serviceChartData.length > 0 && (
                                        <div className={styles.trendCard}>
                                            <div className={styles.cardHeader}>
                                                <h5>Đánh giá theo dịch vụ</h5>
                                                <span>
                                                    Điểm đánh giá và số đánh giá của từng dịch vụ
                                                </span>
                                            </div>
                                            <div className={styles.cardBody}>
                                                <ChartJsMultiLine
                                                    data={reviewStats.serviceChartData}
                                                    color1="#f59e0b"
                                                    color2="#10b981"
                                                    label1="Điểm đánh giá"
                                                    label2="Số đánh giá"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
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

                            {isLoadingSubscriptionChart ? (
                                <div className={styles.trendCard}>
                                    <div className={styles.cardHeader}>
                                        <h5>Phân bổ gói đăng ký</h5>
                                        <span>Số lượng bệnh viện đăng ký theo từng gói</span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.chartJsWrapper}>
                                            <div className={styles.chartSkeleton} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                subscriptionChartData.length > 0 && (
                                    <div className={styles.trendCard}>
                                        <div className={styles.cardHeader}>
                                            <h5>Phân bổ gói đăng ký</h5>
                                            <span>
                                                Thống kê hủy, nâng cấp và tổng số đăng ký theo từng
                                                gói
                                            </span>
                                        </div>
                                        <div className={styles.cardBody}>
                                            <ChartJsTripleLine
                                                data={subscriptionChartData}
                                                color1="#ef4444"
                                                color2="#10b981"
                                                color3="#8b5cf6"
                                                label1="Hủy"
                                                label2="Nâng cấp"
                                                label3="Tổng"
                                            />
                                        </div>
                                    </div>
                                )
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

export default AdminDashboard;
