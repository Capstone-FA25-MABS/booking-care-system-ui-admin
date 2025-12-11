import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import styles from './Dashboard.module.scss';
import AppointmentService from '@/services/appointment.service';
import { DoctorService } from '@/services/doctor.service';
import { HospitalService } from '@/services/hospital.service';
import { DiscountService } from '@/services/discount.service';
import { SubscriptionService } from '@/services/subscription.service';
import { getAllServiceIds } from '@/services/service.service';
import { getAllSpecialtiesSimple } from '@/services/specialty.service';
import { getAllServiceTypesSimple } from '@/services/serviceType.service';
import { getAllPositionsSimple } from '@/services/position.service';
import { getAllLanguagesSimple } from '@/services/language.service';
import { StatisticsPeriod } from '@/types/statistics.types';
import { AppointmentStatus } from '@/enums/appointment.enums';
import { calculateAdditionalStatistics as calculateAdditionalStatisticsUtil } from '@/utils/dashboardStatistics';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import { ChartJsMultiBar, ChartJsTripleBar, ChartJsSingleBar } from '@/components/ChartJsLine';
import DashboardReviewSection from '@/components/DashboardReviewSection';
import DashboardRatingDistributionChart from '@/components/DashboardRatingDistributionChart';
import DashboardAdditionalCharts from '@/components/DashboardAdditionalCharts';
import { DashboardFilters } from '@/components/DashboardFilters';
import { DashboardTrendCharts } from '@/components/DashboardTrendCharts';
import DashboardOverviewMetrics from '@/components/DashboardOverviewMetrics';
import { useDashboardDateRange } from '@/hooks/useDashboardDateRange';
import { useReviewInsights, ReviewStatsSummary } from '@/hooks/useReviewInsights';
import PaymentMethodService from '@/services/paymentMethod.service';
import { RevenueFilterButtons, RevenueViewPeriod } from '@/components/RevenueFilterButtons';
import { StatisticsPeriod as PaymentStatisticsPeriod } from '@/types/payment.types';
import type { GetPaymentStatisticsRequest, PaymentStatisticsResponse } from '@/types/payment.types';
import { formatTimeLabel } from '@/utils/paymentChartFormatter';
import {
    periodOptions,
    numberFormatter,
    formatPercent,
    formatDateDisplay,
} from '@/utils/dashboard.utils';
import {
    AppointmentMetricKey,
    AppointmentMetricOverride,
    buildAppointmentOverviewMetrics,
} from '@/utils/appointmentMetrics';
import {
    buildRatingChartData,
    buildPeakHoursChartData,
    buildAppointmentTypeChartData,
    ChartPoint,
} from '@/utils/dashboardChartData';
import { buildReviewMetrics, buildCompletionVsCancellationData } from '@/utils/reviewCharts';
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
    const fetchAdminReviewEntities = useCallback(async () => {
        // Optimized: fetch only IDs instead of full objects (1-2MB → ~70KB)
        const [doctorIdsRes, serviceIdsRes] = await Promise.all([
            DoctorService.getAllDoctorIds().catch(() => ({
                data: [],
            })),
            getAllServiceIds().catch(() => ({
                data: [],
            })),
        ]);

        // Map IDs to minimal objects for review statistics calculation
        const doctors = (doctorIdsRes.data || []).map((id: string) => ({ id }));
        const services = (serviceIdsRes.data || []).map((id: string) => ({ id }));

        return { doctors, services };
    }, []);
    const { reviewStats, isLoadingReviewStats } = useReviewInsights({
        fetchEntities: fetchAdminReviewEntities,
        includeRatingDistribution: true,
    });
    const [subscriptionChartData, setSubscriptionChartData] = useState<
        Array<{
            label: string;
            value1: number; // Hủy
            value2: number; // Upgrade
            value3: number; // Tổng
        }>
    >([]);
    const [isLoadingSubscriptionChart, setIsLoadingSubscriptionChart] = useState(false);

    // Revenue statistics state (subscription payments only)
    const [revenueChartData, setRevenueChartData] = useState<
        Array<{
            label: string;
            value: number; // Total revenue
        }>
    >([]);
    const [isLoadingRevenueChart, setIsLoadingRevenueChart] = useState(false);
    const [revenuePeriod, setRevenuePeriod] = useState<RevenueViewPeriod>('4weeks');

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

    const handleStatisticsError = useCallback((message: string) => {
        toast.error(message);
    }, []);

    const {
        stats,
        appointmentTrendPoints,
        newPatientTrendPoints,
        additionalStats,
        isLoading,
        error,
    } = useAppointmentStatistics<AdminStatistics, AdminAdditionalStats>({
        period,
        fetchAppointments: fetchAdminAppointments,
        calculateStatistics,
        calculateAdditionalStatistics,
        onError: handleStatisticsError,
    });

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

    // Load revenue statistics (subscription payments only)
    const loadRevenueChart = useCallback(async () => {
        setIsLoadingRevenueChart(true);
        try {
            // Calculate date range based on selected revenue period
            const now = new Date();
            let fromDateStr: string;
            let toDateStr: string;
            let apiPeriod: PaymentStatisticsPeriod;

            // Helper function to format date as YYYY-MM-DD in local timezone
            const formatLocalDate = (date: Date): string => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            switch (revenuePeriod) {
                case '7days': {
                    // Last 7 days: today and 6 days back
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(now.getDate() - 6);
                    fromDateStr = formatLocalDate(sevenDaysAgo);
                    toDateStr = formatLocalDate(now);
                    apiPeriod = PaymentStatisticsPeriod.Daily;
                    break;
                }
                case '4weeks': {
                    // Last 4 weeks: 27 days back to today (28 days total)
                    const fourWeeksAgo = new Date(now);
                    fourWeeksAgo.setDate(now.getDate() - 27);
                    fromDateStr = formatLocalDate(fourWeeksAgo);
                    toDateStr = formatLocalDate(now);
                    apiPeriod = PaymentStatisticsPeriod.Weekly;
                    break;
                }
                case '6months': {
                    // Last 6 months: from start of 5 months ago to today
                    // Example: Nov 30 → Jun 1 to Nov 30 (covers Jun, Jul, Aug, Sep, Oct, Nov)
                    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                    fromDateStr = formatLocalDate(sixMonthsAgo);
                    toDateStr = formatLocalDate(now);
                    apiPeriod = PaymentStatisticsPeriod.Monthly;
                    break;
                }
                case '4quarters': {
                    // Last 4 quarters including current quarter
                    // Example: Nov 30 2025 (Q4) → Q1 2025 to Q4 2025
                    const currentMonth = now.getMonth(); // 0-11
                    const currentQuarter = Math.floor(currentMonth / 3); // 0-3

                    // Start from 3 quarters ago
                    let startQuarter = currentQuarter - 3;
                    let startYear = now.getFullYear();

                    // Handle negative quarters (go to previous year)
                    while (startQuarter < 0) {
                        startQuarter += 4;
                        startYear--;
                    }

                    // First day of the start quarter
                    const startMonth = startQuarter * 3;
                    const fourQuartersAgo = new Date(startYear, startMonth, 1);

                    fromDateStr = formatLocalDate(fourQuartersAgo);
                    toDateStr = formatLocalDate(now);
                    apiPeriod = PaymentStatisticsPeriod.Quarterly;
                    break;
                }
                default: {
                    const defaultFrom = new Date(now);
                    defaultFrom.setDate(now.getDate() - 27);
                    fromDateStr = formatLocalDate(defaultFrom);
                    toDateStr = formatLocalDate(now);
                    apiPeriod = PaymentStatisticsPeriod.Weekly;
                }
            }

            const request: GetPaymentStatisticsRequest = {
                fromDate: fromDateStr,
                toDate: toDateStr,
                period: apiPeriod,
            };

            console.log('Revenue chart request:', {
                revenuePeriod,
                fromDate: request.fromDate,
                toDate: request.toDate,
                period: apiPeriod,
            });

            const response = await PaymentMethodService.getPaymentStatistics(request);
            const statistics: PaymentStatisticsResponse = response.data;

            console.log('Revenue chart response:', statistics);

            // Transform time series data to chart format with Vietnamese labels
            const chartData = statistics.timeSeries.map((point) => ({
                label: formatTimeLabel(
                    point.timeLabel,
                    apiPeriod,
                    point.periodStart,
                    point.periodEnd
                ),
                value: point.totalAmount,
            }));

            setRevenueChartData(chartData);
        } catch (err: any) {
            console.error('Failed to load revenue chart:', err);
            console.error('Error details:', {
                message: err?.message,
                response: err?.response?.data,
                status: err?.response?.status,
            });
            toast.error(
                `Không thể tải dữ liệu doanh thu: ${err?.response?.data?.message || err?.message || 'Lỗi không xác định'}`
            );
            setRevenueChartData([]);
        } finally {
            setIsLoadingRevenueChart(false);
        }
    }, [revenuePeriod]);

    useEffect(() => {
        loadSubscriptionChart();
    }, [loadSubscriptionChart]);

    useEffect(() => {
        loadRevenueChart();
    }, [loadRevenueChart]);

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

    const reviewMetrics = useMemo(
        () =>
            buildReviewMetrics<ReviewStatsSummary>(reviewStats, [
                {
                    label: 'Tổng đánh giá bác sĩ',
                    getValue: (stats) => stats.doctorTotalReviews,
                    getSub: (stats) => `${stats.doctorAverageRating.toFixed(1)}⭐ điểm trung bình`,
                    className: `${styles.metricCard} ${styles.cardReview}`,
                    icon: 'ti ti-user',
                },
                {
                    label: 'Tổng đánh giá dịch vụ',
                    getValue: (stats) => stats.serviceTotalReviews,
                    getSub: (stats) => `${stats.serviceAverageRating.toFixed(1)}⭐ điểm trung bình`,
                    className: `${styles.metricCard} ${styles.cardServiceType}`,
                    icon: 'ti ti-briefcase',
                },
                {
                    label: 'Điểm trung bình bác sĩ',
                    getValue: (stats) => stats.doctorAverageRating,
                    getSub: (stats) => `${stats.doctorTotalReviews} đánh giá`,
                    className: `${styles.metricCard} ${styles.cardRating}`,
                    icon: 'ti ti-star',
                    formatDecimal: true,
                },
                {
                    label: 'Điểm trung bình dịch vụ',
                    getValue: (stats) => stats.serviceAverageRating,
                    getSub: (stats) => `${stats.serviceTotalReviews} đánh giá`,
                    className: `${styles.metricCard} ${styles.cardPosition}`,
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
                                    <DashboardReviewSection
                                        metrics={reviewMetrics}
                                        reviewStats={reviewStats}
                                        trendCardClassName={styles.trendCard}
                                        cardHeaderClassName={styles.cardHeader}
                                        cardBodyClassName={styles.cardBody}
                                        metricsGridClassName={styles.metricsGrid}
                                        overviewGridClassName={styles.overviewGrid}
                                        rankingsClassNames={{
                                            containerClassName: styles.topRankingsContainer,
                                            cardClassName: styles.trendCard,
                                            cardHeaderClassName: styles.cardHeader,
                                            cardBodyClassName: styles.cardBody,
                                            listClassName: styles.topList,
                                            itemClassName: styles.topItem,
                                            rankClassName: styles.topRank,
                                            infoClassName: styles.topInfo,
                                            nameClassName: styles.topName,
                                            statsClassName: styles.topStats,
                                            ratingClassName: styles.topRating,
                                            reviewsClassName: styles.topReviews,
                                        }}
                                    />

                                    <DashboardRatingDistributionChart
                                        data={ratingChartData}
                                        trendCardClassName={styles.trendCard}
                                        cardHeaderClassName={styles.cardHeader}
                                        cardBodyClassName={styles.cardBody}
                                    />

                                    {reviewStats.doctorChartData.length > 0 && (
                                        <div className={styles.trendCard}>
                                            <div className={styles.cardHeader}>
                                                <h5>Đánh giá theo bác sĩ</h5>
                                                <span>
                                                    Điểm đánh giá và số đánh giá của từng bác sĩ
                                                </span>
                                            </div>
                                            <div className={styles.cardBody}>
                                                <ChartJsMultiBar
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
                                                <ChartJsMultiBar
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
                                            <ChartJsTripleBar
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

                            {isLoadingRevenueChart ? (
                                <div className={styles.trendCard}>
                                    <div className={styles.cardHeader}>
                                        <h5>Doanh thu từ đăng ký gói</h5>
                                        <span>
                                            Biểu đồ thống kê doanh thu từ các gói đăng ký (không bao
                                            gồm lịch hẹn)
                                        </span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <div className={styles.chartJsWrapper}>
                                            <div className={styles.chartSkeleton} />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                revenueChartData.length > 0 && (
                                    <div className={styles.trendCard}>
                                        <div className={styles.cardHeader}>
                                            <div>
                                                <h5>Doanh thu từ đăng ký gói</h5>
                                                <span>
                                                    Biểu đồ thống kê doanh thu từ các gói đăng ký
                                                    (không bao gồm thanh toán lịch hẹn)
                                                </span>
                                            </div>
                                            <RevenueFilterButtons
                                                selectedPeriod={revenuePeriod}
                                                onPeriodChange={setRevenuePeriod}
                                                isLoading={isLoadingRevenueChart}
                                            />
                                        </div>
                                        <div className={styles.cardBody}>
                                            <ChartJsSingleBar
                                                data={revenueChartData}
                                                color="#10b981"
                                                label="Tổng doanh thu"
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
