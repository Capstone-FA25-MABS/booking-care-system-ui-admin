import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import styles from './Dashboard.module.scss';

// Day of week formatter - hiển thị đầy đủ "Thứ 2" - "Chủ nhật"
const dayOfWeekFormatter = (day: Date | string): string => {
    if (day instanceof Date) {
        const dayIndex = day.getDay();
        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return dayNames[dayIndex] || format(day, 'EEEE', { locale: vi });
    }
    const dayStr = String(day);
    const dayMap: Record<string, string> = {
        Mon: 'Thứ 2',
        Tue: 'Thứ 3',
        Wed: 'Thứ 4',
        Thu: 'Thứ 5',
        Fri: 'Thứ 6',
        Sat: 'Thứ 7',
        Sun: 'Chủ nhật',
    };
    return dayMap[dayStr] || dayStr;
};
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
import {
    ChartJsMultiBar,
    ChartJsTripleBar,
    ChartJsSingleBar,
    ChartJsBar,
} from '@/components/ChartJsLine';
import { ChartJsPie } from '@/components/ChartJsLine/ChartJsPie';
import { ChartJsArea } from '@/components/ChartJsLine/ChartJsArea';
import { ChartJsLine } from '@/components/ChartJsLine/ChartJsLine';
import DashboardReviewSection from '@/components/DashboardReviewSection';
import DashboardRatingDistributionChart from '@/components/DashboardRatingDistributionChart';
import DashboardOverviewMetrics from '@/components/DashboardOverviewMetrics';
import DeepAnalyticsSection from '@/components/DeepAnalyticsSection';
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
import AIService, { AiInsightResponse, GenerateAiInsightRequest } from '@/services/aiService';

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
    const [period] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const { isoRange } = useDashboardDateRange();

    const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [aiInsights, setAiInsights] = useState<AiInsightResponse | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiDateRange, setAiDateRange] = useState<{ from: Date | null; to: Date | null }>({
        from: null,
        to: null,
    });
    const [aiLoadingStep, setAiLoadingStep] = useState<number>(0); // 0: idle, 1: collecting, 2: analyzing, 3: generating
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

    // Revenue statistics state (subscription payments only)
    const [revenueChartData, setRevenueChartData] = useState<
        Array<{
            label: string;
            value1: number; // Total revenue
            value2: number; // Completed revenue
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

    const loadAiInsights = useCallback(async () => {
        setIsLoadingAi(true);
        setAiError(null);
        setAiLoadingStep(1); // Start collecting data
        try {
            let request: GenerateAiInsightRequest;

            if (aiDateRange.from && aiDateRange.to) {
                // Nếu người dùng chọn date range cụ thể
                // FIX: Sử dụng local date format thay vì toISOString() để tránh timezone conversion
                const formatLocalDate = (date: Date): string => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                request = {
                    fromDate: formatLocalDate(aiDateRange.from),
                    toDate: formatLocalDate(aiDateRange.to),
                };
            } else {
                // Mặc định: 7 ngày trước đến ngày hiện tại
                const today = new Date();
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(today.getDate() - 7);

                const formatLocalDate = (date: Date): string => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                request = {
                    fromDate: formatLocalDate(sevenDaysAgo),
                    toDate: formatLocalDate(today),
                };
            }

            // Simulate steps for better UX
            await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
            setAiLoadingStep(2); // Analyzing AI
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate AI processing
            setAiLoadingStep(3); // Generating report

            const response = await AIService.generateInsights(request);
            if (response.success && response.data) {
                setAiInsights(response.data);
            } else {
                setAiError('Không thể tải AI Insights');
            }
        } catch (err: any) {
            const message =
                err instanceof Error ? err.message : 'Không thể tải AI Insights. Vui lòng thử lại.';
            setAiError(message);
        } finally {
            setIsLoadingAi(false);
            setAiLoadingStep(0); // Reset step
        }
    }, [aiDateRange.from, aiDateRange.to]);

    // Removed automatic loading - only load when user clicks button

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

    // Computed date range: ưu tiên sử dụng date range từ AI insights nếu có
    // Chỉ sử dụng aiDateRange khi đã tạo AI insights thành công
    const activeDateRange = useMemo(() => {
        // Nếu có AI insights, sử dụng periodStart và periodEnd từ response (ưu tiên cao nhất)
        if (aiInsights?.periodStart && aiInsights?.periodEnd) {
            // Extract date part from datetime string (YYYY-MM-DDTHH:mm:ss)
            const fromDate = aiInsights.periodStart.split('T')[0];
            const toDate = aiInsights.periodEnd.split('T')[0];
            return {
                fromDate,
                toDate,
            };
        }
        // Mặc định sử dụng isoRange (không sử dụng aiDateRange cho đến khi tạo AI insights thành công)
        return {
            fromDate: isoRange.fromDate,
            toDate: isoRange.toDate,
        };
    }, [aiInsights?.periodStart, aiInsights?.periodEnd, isoRange.fromDate, isoRange.toDate]);

    const fetchAdminAppointments = useCallback(async () => {
        if (!activeDateRange.fromDate || !activeDateRange.toDate) {
            return null;
        }

        // activeDateRange đã là date string (YYYY-MM-DD), không cần split
        const response = await AppointmentService.getAppointmentsForManagement({
            fromDate: activeDateRange.fromDate,
            toDate: activeDateRange.toDate,
            pageNumber: 1,
            pageSize: 10000, // Get all appointments
            includeStatusCounts: false,
        });

        return response.data?.appointments ?? [];
    }, [activeDateRange.fromDate, activeDateRange.toDate]);

    const handleStatisticsError = useCallback((message: string) => {
        toast.error(message);
    }, []);

    const { stats, appointmentTrendPoints, newPatientTrendPoints, additionalStats, isLoading } =
        useAppointmentStatistics<AdminStatistics, AdminAdditionalStats>({
            period,
            fetchAppointments: fetchAdminAppointments,
            calculateStatistics,
            calculateAdditionalStatistics,
            onError: handleStatisticsError,
        });

    const loadSubscriptionChart = useCallback(async () => {
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

            let subscriptions = (subscriptionsRes.data as any) || [];
            const plans = (plansRes.data as any)?.subscriptionPlans || [];

            // Filter subscriptions theo date range của AI insights nếu có
            if (activeDateRange.fromDate && activeDateRange.toDate) {
                const fromDate = new Date(activeDateRange.fromDate);
                const toDate = new Date(activeDateRange.toDate);
                // Set to end of day for toDate
                toDate.setHours(23, 59, 59, 999);

                subscriptions = subscriptions.filter((sub: any) => {
                    if (!sub.createdAt) return false;
                    const createdAt = new Date(sub.createdAt);
                    return createdAt >= fromDate && createdAt <= toDate;
                });
            }

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
        }
    }, [activeDateRange.fromDate, activeDateRange.toDate]);

    // Load revenue statistics (subscription payments only)
    const loadRevenueChart = useCallback(async () => {
        setIsLoadingRevenueChart(true);
        try {
            // Helper function to format date as YYYY-MM-DD in local timezone
            const formatLocalDate = (date: Date): string => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            let fromDateStr: string;
            let toDateStr: string;
            let apiPeriod: PaymentStatisticsPeriod;

            const now = new Date();

            // Xử lý theo revenuePeriod được chọn
            switch (revenuePeriod) {
                case '7days': {
                    const sevenDaysAgo = new Date(now);
                    sevenDaysAgo.setDate(now.getDate() - 6);
                    fromDateStr = formatLocalDate(sevenDaysAgo);
                    toDateStr = formatLocalDate(now);
                    apiPeriod = PaymentStatisticsPeriod.Daily;
                    break;
                }
                case '4weeks': {
                    const fourWeeksAgo = new Date(now);
                    fourWeeksAgo.setDate(now.getDate() - 27);
                    fromDateStr = formatLocalDate(fourWeeksAgo);
                    toDateStr = formatLocalDate(now);
                    apiPeriod = PaymentStatisticsPeriod.Weekly;
                    break;
                }
                case '6months': {
                    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                    fromDateStr = formatLocalDate(sixMonthsAgo);
                    toDateStr = formatLocalDate(now);
                    apiPeriod = PaymentStatisticsPeriod.Monthly;
                    break;
                }
                case '4quarters': {
                    const currentMonth = now.getMonth();
                    const currentQuarter = Math.floor(currentMonth / 3);
                    let startQuarter = currentQuarter - 3;
                    let startYear = now.getFullYear();
                    while (startQuarter < 0) {
                        startQuarter += 4;
                        startYear--;
                    }
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
                value1: point.totalAmount,
                value2: point.completedAmount,
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
    }, [revenuePeriod, customRevenueDateRange.start, customRevenueDateRange.end]);

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

    // Dự đoán chi tiết
    const predictions = useMemo(() => {
        if (!aiInsights || !stats) return null;
        const growth = aiInsights.metrics.growthPercent / 100;
        const baseTotal = aiInsights.metrics.currentTotal;
        const baseCancellation = aiInsights.metrics.cancellationRate;
        const cancellationDelta = aiInsights.metrics.cancellationDeltaPercent / 100;

        return {
            nextWeekAppointments: Math.max(0, Math.round(baseTotal * (1 + growth))),
            nextMonthAppointments: Math.max(0, Math.round(baseTotal * (1 + growth) * 4)),
            predictedCancellationRate: Math.max(
                0,
                Math.min(100, baseCancellation * (1 + cancellationDelta))
            ),
            predictedRevenue: 0, // Revenue calculation requires payment data, not available in AdminStatistics
            specialtyTrend: aiInsights.metrics.topSpecialtyName || 'Chưa xác định',
            specialtyGrowth: growth > 0 ? 'Tăng' : growth < 0 ? 'Giảm' : 'Ổn định',
        };
    }, [aiInsights, stats]);

    // Dữ liệu biểu đồ chuyên khoa (giả lập từ AI insights)
    const specialtyChartData = useMemo(() => {
        if (!aiInsights) return [];
        return [
            {
                label: aiInsights.metrics.topSpecialtyName || 'Chưa xác định',
                value: aiInsights.metrics.topSpecialtyCount,
            },
            {
                label: 'Chuyên khoa khác',
                value: Math.max(
                    0,
                    aiInsights.metrics.currentTotal - aiInsights.metrics.topSpecialtyCount
                ),
            },
        ];
    }, [aiInsights]);

    // Dữ liệu biểu đồ trạng thái lịch hẹn
    const statusChartData = useMemo(() => {
        if (!stats) return [];
        return [
            { label: 'Hoàn thành', value: stats.completedAppointments },
            { label: 'Đã xác nhận', value: stats.confirmedAppointments },
            { label: 'Chờ xác nhận', value: stats.pendingAppointments },
            { label: 'Đã hủy', value: stats.cancelledAppointments },
        ];
    }, [stats]);

    return (
        <div className={`content ${styles.dashboardPage}`} id="adminDashboardPage">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Bảng điều khiển quản trị viên</h4>
                </div>
            </div>

            <div className={styles.trendCard}>
                <div className={styles.cardHeader}>
                    <h5>AI phân tích hệ thống, dự đoán tương lai</h5>
                </div>

                {/* Date Range Picker - Improved Design */}
                <div className={styles.aiDateRangePicker}>
                    <div className={styles.dateRangeHeader}>
                        <span>Chọn khoảng thời gian phân tích</span>
                    </div>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
                        <div className={styles.dateRangeRow}>
                            <div className={styles.dateRangeGroup}>
                                <label htmlFor="aiFromDate" className={styles.dateLabel}>
                                    Từ ngày
                                </label>
                                <DatePicker
                                    value={aiDateRange.from}
                                    onChange={(newValue) =>
                                        setAiDateRange((prev) => ({
                                            ...prev,
                                            from: newValue,
                                        }))
                                    }
                                    disabled={isLoadingAi}
                                    maxDate={aiDateRange.to || new Date()}
                                    format="dd/MM/yyyy"
                                    dayOfWeekFormatter={dayOfWeekFormatter}
                                    slotProps={{
                                        textField: {
                                            id: 'aiFromDate',
                                            size: 'small',
                                            placeholder: 'dd/mm/yyyy',
                                            className: styles.muiDateInput,
                                        },
                                        day: {
                                            sx: {
                                                '&.Mui-selected': {
                                                    backgroundColor: '#2E37A4 !important',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#252d8a !important',
                                                    },
                                                },
                                                '&.MuiPickersDay-today': {
                                                    border: '1px solid #2E37A4',
                                                },
                                            },
                                        },
                                        popper: {
                                            sx: {
                                                zIndex: 1300,
                                                '& .MuiPaper-root': {
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.15)',
                                                    border: '1px solid #e2e8f0',
                                                },
                                            },
                                        },
                                        calendarHeader: {
                                            sx: {
                                                padding: '16px',
                                                '& .MuiPickersCalendarHeader-label': {
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    color: '#1e293b',
                                                },
                                                '& .MuiIconButton-root': {
                                                    color: '#2E37A4',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(46, 55, 164, 0.08)',
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                    sx={{
                                        width: { xs: '100%', sm: '250px' },
                                        '& .MuiInputBase-root': {
                                            height: '38px',
                                            fontSize: '0.95rem',
                                            borderRadius: '10px',
                                            border: '1.5px solid #cbd5e1',
                                            background: 'white',
                                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                borderColor: '#94a3b8',
                                                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#2E37A4',
                                                boxShadow:
                                                    '0 0 0 4px rgba(46, 55, 164, 0.12), 0 4px 12px rgba(46, 55, 164, 0.15)',
                                            },
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '11px 14px',
                                            fontWeight: 500,
                                            color: '#1e293b',
                                            cursor: 'pointer',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '& .MuiInputAdornment-root': {
                                            marginRight: '8px',
                                            '& .MuiIconButton-root': {
                                                color: '#000000',
                                                padding: '4px',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className={styles.dateRangeGroup}>
                                <label htmlFor="aiToDate" className={styles.dateLabel}>
                                    Đến ngày
                                </label>
                                <DatePicker
                                    value={aiDateRange.to}
                                    onChange={(newValue) =>
                                        setAiDateRange((prev) => ({
                                            ...prev,
                                            to: newValue,
                                        }))
                                    }
                                    disabled={isLoadingAi}
                                    minDate={aiDateRange.from || undefined}
                                    maxDate={new Date()}
                                    format="dd/MM/yyyy"
                                    dayOfWeekFormatter={dayOfWeekFormatter}
                                    slotProps={{
                                        textField: {
                                            id: 'aiToDate',
                                            size: 'small',
                                            placeholder: 'dd/mm/yyyy',
                                            className: styles.muiDateInput,
                                        },
                                        day: {
                                            sx: {
                                                '&.Mui-selected': {
                                                    backgroundColor: '#2E37A4 !important',
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#252d8a !important',
                                                    },
                                                },
                                                '&.MuiPickersDay-today': {
                                                    border: '1px solid #2E37A4',
                                                },
                                            },
                                        },
                                        popper: {
                                            sx: {
                                                zIndex: 1300,
                                                '& .MuiPaper-root': {
                                                    borderRadius: '12px',
                                                    boxShadow: '0 10px 40px rgba(15, 23, 42, 0.15)',
                                                    border: '1px solid #e2e8f0',
                                                },
                                            },
                                        },
                                        calendarHeader: {
                                            sx: {
                                                padding: '16px',
                                                '& .MuiPickersCalendarHeader-label': {
                                                    fontWeight: 600,
                                                    fontSize: '1rem',
                                                    color: '#1e293b',
                                                },
                                                '& .MuiIconButton-root': {
                                                    color: '#2E37A4',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(46, 55, 164, 0.08)',
                                                    },
                                                },
                                            },
                                        },
                                    }}
                                    sx={{
                                        width: { xs: '100%', sm: '250px' },
                                        '& .MuiInputBase-root': {
                                            height: '38px',
                                            fontSize: '0.95rem',
                                            borderRadius: '10px',
                                            border: '1.5px solid #cbd5e1',
                                            background: 'white',
                                            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                borderColor: '#94a3b8',
                                                boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
                                            },
                                            '&.Mui-focused': {
                                                borderColor: '#2E37A4',
                                                boxShadow:
                                                    '0 0 0 4px rgba(46, 55, 164, 0.12), 0 4px 12px rgba(46, 55, 164, 0.15)',
                                            },
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '11px 14px',
                                            fontWeight: 500,
                                            color: '#1e293b',
                                            cursor: 'pointer',
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            border: 'none',
                                        },
                                        '& .MuiInputAdornment-root': {
                                            marginRight: '8px',
                                            '& .MuiIconButton-root': {
                                                color: '#000000',
                                                padding: '4px',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                                },
                                            },
                                        },
                                    }}
                                />
                            </div>
                            <div className={styles.dateRangeButton}>
                                <button
                                    className={`btn btn-primary ${styles.aiGenerateBtn}`}
                                    onClick={loadAiInsights}
                                    disabled={isLoadingAi}
                                >
                                    <i className="ti ti-sparkles"></i>
                                    <span>{isLoadingAi ? 'Đang tạo...' : 'Tạo AI Insights'}</span>
                                </button>
                                {aiInsights && !isLoadingAi && (
                                    <button
                                        className={`btn btn-outline-secondary ${styles.aiClearBtn}`}
                                        onClick={() => {
                                            setAiInsights(null);
                                            setAiDateRange({ from: null, to: null });
                                            setAiError(null);
                                        }}
                                        title="Xóa kết quả phân tích"
                                    >
                                        <i className="ti ti-x"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </LocalizationProvider>
                    <div className={styles.dateRangeInfo}>
                        <i className="ti ti-info-circle"></i>
                        <span>
                            {aiDateRange.from && aiDateRange.to
                                ? `Phân tích từ ${formatDateDisplay(aiDateRange.from)} đến ${formatDateDisplay(aiDateRange.to)}`
                                : 'Để trống để sử dụng mặc định (7 ngày gần nhất: từ 7 ngày trước đến ngày hiện tại)'}
                        </span>
                    </div>
                </div>

                {aiError && (
                    <div className={`${styles.aiError} alert alert-danger`} role="alert">
                        <i className="ti ti-alert-circle me-2"></i>
                        {aiError}
                    </div>
                )}

                <div className={styles.aiBody}>
                    {isLoadingAi ? (
                        <div className={styles.aiLoadingState}>
                            <div className={styles.aiLoadingSpinner}>
                                <div className={styles.spinner}></div>
                            </div>
                            <div className={styles.aiLoadingContent}>
                                <h6>Đang tạo AI Insights...</h6>
                                <p className={styles.aiLoadingDescription}>
                                    Đang phân tích dữ liệu và tạo báo cáo. Vui lòng đợi trong giây
                                    lát.
                                </p>
                                <div className={styles.loadingSteps}>
                                    <div
                                        className={`${styles.loadingStep} ${aiLoadingStep >= 1 ? styles.loadingStepActive : ''}`}
                                    >
                                        <div className={styles.loadingStepIcon}>
                                            {aiLoadingStep > 1 ? (
                                                <i className="ti ti-check"></i>
                                            ) : aiLoadingStep === 1 ? (
                                                <div className={styles.loadingStepSpinner}></div>
                                            ) : (
                                                <div className={styles.loadingStepDot}></div>
                                            )}
                                        </div>
                                        <span>Thu thập dữ liệu</span>
                                    </div>
                                    <div
                                        className={`${styles.loadingStep} ${aiLoadingStep >= 2 ? styles.loadingStepActive : ''}`}
                                    >
                                        <div className={styles.loadingStepIcon}>
                                            {aiLoadingStep > 2 ? (
                                                <i className="ti ti-check"></i>
                                            ) : aiLoadingStep === 2 ? (
                                                <div className={styles.loadingStepSpinner}></div>
                                            ) : (
                                                <div className={styles.loadingStepDot}></div>
                                            )}
                                        </div>
                                        <span>Phân tích AI</span>
                                    </div>
                                    <div
                                        className={`${styles.loadingStep} ${aiLoadingStep >= 3 ? styles.loadingStepActive : ''}`}
                                    >
                                        <div className={styles.loadingStepIcon}>
                                            {aiLoadingStep >= 3 ? (
                                                aiLoadingStep > 3 ? (
                                                    <i className="ti ti-check"></i>
                                                ) : (
                                                    <div
                                                        className={styles.loadingStepSpinner}
                                                    ></div>
                                                )
                                            ) : (
                                                <div className={styles.loadingStepDot}></div>
                                            )}
                                        </div>
                                        <span>Tạo báo cáo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : !aiInsights ? (
                        <div className={styles.aiEmptyState}></div>
                    ) : null}
                </div>
            </div>

            {/* Kết luận phân tích và Kết luận dự đoán - 2 Card - Style giống alertCard - Cả hai đều màu xanh */}
            {aiInsights && (aiInsights.analysisConclusion || aiInsights.predictionConclusion) && (
                <div className={styles.aiConclusionCardsWrapper}>
                    {/* Card 1: Kết luận phân tích hệ thống */}
                    {aiInsights.analysisConclusion && (
                        <div className={`${styles.aiConclusionCard} ${styles.alertInfo}`}>
                            <div className={styles.alertHeader}>
                                <div className={styles.alertIcon}>
                                    <i className="ti ti-chart-line"></i>
                                </div>
                                <div className={styles.alertTitleSection}>
                                    <h6 className={styles.alertTitle}>
                                        Kết luận phân tích hệ thống
                                    </h6>
                                    <span className={styles.alertMetric}>Phân tích hệ thống</span>
                                </div>
                            </div>
                            <p className={styles.alertMessage}>{aiInsights.analysisConclusion}</p>
                        </div>
                    )}

                    {/* Card 2: Kết luận dự đoán tương lai */}
                    {aiInsights.predictionConclusion && (
                        <div className={`${styles.aiConclusionCard} ${styles.alertInfo}`}>
                            <div className={styles.alertHeader}>
                                <div className={styles.alertIcon}>
                                    <i className="ti ti-trending-up"></i>
                                </div>
                                <div className={styles.alertTitleSection}>
                                    <h6 className={styles.alertTitle}>
                                        Kết luận dự đoán tương lai
                                    </h6>
                                    <span className={styles.alertMetric}>Dự đoán tương lai</span>
                                </div>
                            </div>
                            <p className={styles.alertMessage}>{aiInsights.predictionConclusion}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Phân tích chi tiết lý do hủy, Root Cause, Predictions - Nằm trên 1 hàng */}
            {aiInsights && (
                <div className={styles.aiInsightsRow}>
                    {/* Phân tích chi tiết lý do hủy */}
                    {aiInsights.metrics &&
                        aiInsights.metrics.detailedCancellationAnalysis &&
                        aiInsights.metrics.detailedCancellationAnalysis.topReasons &&
                        aiInsights.metrics.detailedCancellationAnalysis.topReasons.length > 0 && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>
                                        <i className="ti ti-x me-2"></i>
                                        Phân tích chi tiết lý do hủy
                                    </h5>
                                    <span>Phân loại và khuyến nghị cải thiện</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.alertsGrid}>
                                        {/* Cảnh báo tỉ lệ hủy cao */}
                                        {aiInsights.metrics.cancellationRate > 0 && (
                                            <div
                                                className={`${styles.alertCard} ${styles.alertCritical}`}
                                            >
                                                <div className={styles.alertHeader}>
                                                    <div className={styles.alertIcon}>
                                                        <i className="ti ti-alert-triangle"></i>
                                                    </div>
                                                    <div className={styles.alertTitleSection}>
                                                        <h6 className={styles.alertTitle}>
                                                            Tỉ lệ hủy cao
                                                        </h6>
                                                        <span className={styles.alertMetric}>
                                                            Tỉ lệ hủy
                                                        </span>
                                                    </div>
                                                    <span
                                                        className={styles.alertBadge}
                                                        data-severity="high"
                                                    >
                                                        Cao
                                                    </span>
                                                </div>
                                                <p className={styles.alertMessage}>
                                                    Tỉ lệ hủy cao cần có biện pháp cải thiện để giảm
                                                    thiểu số lượng hủy lịch.
                                                </p>
                                                <div className={styles.alertValues}>
                                                    <span>
                                                        Giá trị hiện tại:{' '}
                                                        <strong
                                                            style={{
                                                                color: '#ef4444',
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {aiInsights.metrics.cancellationRate.toFixed(
                                                                2
                                                            )}
                                                            %
                                                        </strong>
                                                    </span>
                                                    <span>
                                                        Ngưỡng:{' '}
                                                        <strong
                                                            style={{
                                                                color: '#64748b',
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            40%
                                                        </strong>
                                                    </span>
                                                </div>
                                                <div className={styles.alertAction}>
                                                    <i className="ti ti-lightbulb me-2"></i>
                                                    <strong>Khuyến nghị:</strong> Tăng cường công
                                                    tác tư vấn và hỗ trợ bệnh nhân, cải thiện quy
                                                    trình đặt lịch và xác nhận.
                                                </div>
                                            </div>
                                        )}

                                        {/* Top reasons */}
                                        {aiInsights.metrics.detailedCancellationAnalysis.topReasons.map(
                                            (reason: any, index: number) => (
                                                <div
                                                    key={index}
                                                    className={`${styles.alertCard} ${styles.alertCritical}`}
                                                >
                                                    <div className={styles.alertHeader}>
                                                        <div className={styles.alertIcon}>
                                                            <i className="ti ti-alert-triangle"></i>
                                                        </div>
                                                        <div className={styles.alertTitleSection}>
                                                            <h6 className={styles.alertTitle}>
                                                                {reason.reasonCategory}
                                                            </h6>
                                                            <span className={styles.alertMetric}>
                                                                <strong
                                                                    style={{
                                                                        color: '#ef4444',
                                                                        fontWeight: 700,
                                                                    }}
                                                                >
                                                                    {reason.count}
                                                                </strong>{' '}
                                                                lượt hủy
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={styles.alertBadge}
                                                            data-severity="high"
                                                        >
                                                            {reason.percentage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    {reason.commonKeywords &&
                                                        reason.commonKeywords.length > 0 && (
                                                            <p className={styles.alertMessage}>
                                                                <strong>Từ khóa phổ biến:</strong>{' '}
                                                                {reason.commonKeywords
                                                                    .slice(0, 5)
                                                                    .join(', ')}
                                                            </p>
                                                        )}
                                                    {reason.recommendedAction && (
                                                        <div className={styles.alertAction}>
                                                            <i className="ti ti-lightbulb me-2"></i>
                                                            <strong>Khuyến nghị:</strong>{' '}
                                                            {reason.recommendedAction}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Root Cause Analysis Section */}
                    {aiInsights.rootCauseAnalyses && aiInsights.rootCauseAnalyses.length > 0 && (
                        <div className={styles.trendCard}>
                            <div className={styles.cardHeader}>
                                <h5>
                                    <i className="ti ti-search me-2"></i>
                                    Phân tích nguyên nhân gốc rễ
                                </h5>
                                <span>Phân tích sâu các chỉ số bất thường để tìm nguyên nhân</span>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.alertsGrid}>
                                    {aiInsights.rootCauseAnalyses.map((rca: any, index: number) => (
                                        <div
                                            key={index}
                                            className={`${styles.alertCard} ${styles.alertWarning}`}
                                        >
                                            <div className={styles.alertHeader}>
                                                <div className={styles.alertIcon}>
                                                    <i className="ti ti-chart-line"></i>
                                                </div>
                                                <div className={styles.alertTitleSection}>
                                                    <h6 className={styles.alertTitle}>
                                                        {rca.metric}
                                                    </h6>
                                                    <span className={styles.alertMetric}>
                                                        Phân tích nguyên nhân
                                                    </span>
                                                </div>
                                                <span
                                                    className={styles.alertBadge}
                                                    data-severity={
                                                        rca.impactScore >= 70
                                                            ? 'high'
                                                            : rca.impactScore >= 40
                                                              ? 'medium'
                                                              : 'low'
                                                    }
                                                >
                                                    Tác động: {rca.impactScore.toFixed(0)}%
                                                </span>
                                            </div>
                                            <p className={styles.alertMessage}>
                                                <strong>Vấn đề:</strong> {rca.issue}
                                            </p>
                                            {rca.potentialCauses &&
                                                rca.potentialCauses.length > 0 && (
                                                    <div className={styles.alertValues}>
                                                        <strong>Nguyên nhân tiềm năng:</strong>
                                                        <ul
                                                            style={{
                                                                margin: '0.5rem 0 0 0',
                                                                paddingLeft: '1.25rem',
                                                            }}
                                                        >
                                                            {rca.potentialCauses.map(
                                                                (
                                                                    cause: string,
                                                                    causeIndex: number
                                                                ) => (
                                                                    <li
                                                                        key={causeIndex}
                                                                        style={{
                                                                            marginBottom: '0.5rem',
                                                                        }}
                                                                    >
                                                                        {cause}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            {rca.mostLikelyCause && (
                                                <div className={styles.alertAction}>
                                                    <i className="ti ti-target me-2"></i>
                                                    <strong>
                                                        Nguyên nhân có khả năng cao nhất:
                                                    </strong>{' '}
                                                    {rca.mostLikelyCause}
                                                </div>
                                            )}
                                            {rca.analysis && (
                                                <div className={styles.alertAction}>
                                                    <i className="ti ti-file-analytics me-2"></i>
                                                    <strong>Phân tích chi tiết:</strong>{' '}
                                                    {rca.analysis}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Predictions Section - Hiển thị như text card giống alert card */}
                    {aiInsights.predictions && aiInsights.predictions.length > 0 && (
                        <div className={styles.trendCard}>
                            <div className={styles.cardHeader}>
                                <h5>
                                    <i className="ti ti-chart-line me-2"></i>
                                    Dự đoán tương lai chi tiết
                                </h5>
                                <span>Dự báo dựa trên xu hướng và mô hình phân tích</span>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.alertsGrid}>
                                    {aiInsights.predictions.map(
                                        (prediction: any, index: number) => {
                                            const periodLabelMap: Record<string, string> = {
                                                next_week: 'Tuần tới',
                                                next_month: 'Tháng tới',
                                                next_quarter: 'Quý tới',
                                            };
                                            const periodLabel =
                                                periodLabelMap[prediction.period] ||
                                                prediction.period;

                                            // Tất cả predictions đều màu xanh lá cây (alertSuccess)
                                            const alertTypeClass = styles.alertSuccess;

                                            // Severity vẫn giữ nguyên từ confidence
                                            const severityMap: Record<string, string> = {
                                                high: 'low',
                                                medium: 'medium',
                                                low: 'high',
                                            };
                                            const severity =
                                                severityMap[prediction.confidence] || 'medium';

                                            const severityIconMap: Record<string, string> = {
                                                high: 'ti ti-circle-check',
                                                medium: 'ti ti-circle-check',
                                                low: 'ti ti-circle-check',
                                            };
                                            const severityIcon =
                                                severityIconMap[severity] || 'ti ti-check-circle';

                                            // Tạo message từ prediction data
                                            const predictionMessage = `Dự đoán cho ${periodLabel}: Lượt đặt dự đoán là ${numberFormatter.format(prediction.predictedAppointments)}${prediction.predictedGrowthPercent !== 0 ? ` (${prediction.predictedGrowthPercent > 0 ? '+' : ''}${prediction.predictedGrowthPercent.toFixed(1)}% so với kỳ hiện tại)` : ''}. Tỉ lệ hủy dự đoán: ${prediction.predictedCancellationRate.toFixed(1)}%.${prediction.topSpecialtyPrediction ? ` Chuyên khoa phổ biến dự kiến: ${prediction.topSpecialtyPrediction}.` : ''}${prediction.reasoning ? ` ${prediction.reasoning}` : ''}`;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`${styles.alertCard} ${alertTypeClass}`}
                                                >
                                                    <div className={styles.alertHeader}>
                                                        <div className={styles.alertIcon}>
                                                            <i className={severityIcon}></i>
                                                        </div>
                                                        <div className={styles.alertTitleSection}>
                                                            <h6 className={styles.alertTitle}>
                                                                Dự đoán {periodLabel}
                                                            </h6>
                                                            <span className={styles.alertMetric}>
                                                                Dự báo tương lai
                                                            </span>
                                                        </div>
                                                        <span
                                                            className={styles.alertBadge}
                                                            data-severity={severity}
                                                        >
                                                            {severity === 'high'
                                                                ? 'Cao'
                                                                : severity === 'medium'
                                                                  ? 'Trung bình'
                                                                  : 'Thấp'}
                                                        </span>
                                                    </div>
                                                    <p className={styles.alertMessage}>
                                                        {predictionMessage}
                                                    </p>
                                                    {(prediction.predictedAppointments !==
                                                        undefined ||
                                                        prediction.predictedCancellationRate !==
                                                            undefined) && (
                                                        <div className={styles.alertValues}>
                                                            {prediction.predictedAppointments !==
                                                                undefined && (
                                                                <span>
                                                                    Lượt đặt dự đoán:{' '}
                                                                    <strong
                                                                        style={{
                                                                            color: '#10b981',
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        {numberFormatter.format(
                                                                            prediction.predictedAppointments
                                                                        )}
                                                                    </strong>
                                                                </span>
                                                            )}
                                                            {prediction.predictedCancellationRate !==
                                                                undefined && (
                                                                <span>
                                                                    Tỉ lệ hủy dự đoán:{' '}
                                                                    <strong
                                                                        style={{
                                                                            color:
                                                                                prediction.predictedCancellationRate >
                                                                                40
                                                                                    ? '#ef4444'
                                                                                    : '#f59e0b',
                                                                            fontWeight: 700,
                                                                        }}
                                                                    >
                                                                        {prediction.predictedCancellationRate.toFixed(
                                                                            1
                                                                        )}
                                                                        %
                                                                    </strong>
                                                                </span>
                                                            )}
                                                            {prediction.predictedGrowthPercent !==
                                                                undefined &&
                                                                prediction.predictedGrowthPercent !==
                                                                    0 && (
                                                                    <span>
                                                                        Thay đổi:{' '}
                                                                        <strong
                                                                            style={{
                                                                                color:
                                                                                    prediction.predictedGrowthPercent >
                                                                                    0
                                                                                        ? '#10b981'
                                                                                        : '#ef4444',
                                                                                fontWeight: 700,
                                                                            }}
                                                                        >
                                                                            {prediction.predictedGrowthPercent >
                                                                            0
                                                                                ? '+'
                                                                                : ''}
                                                                            {prediction.predictedGrowthPercent.toFixed(
                                                                                1
                                                                            )}
                                                                            %
                                                                        </strong>
                                                                    </span>
                                                                )}
                                                        </div>
                                                    )}
                                                    {prediction.reasoning && (
                                                        <div className={styles.alertAction}>
                                                            <i className="ti ti-lightbulb me-2"></i>
                                                            <strong>Phân tích:</strong>{' '}
                                                            {prediction.reasoning}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Deep Analytics Section - Xu hướng lịch hẹn */}
            {aiInsights?.metrics?.rescheduleInsight && (
                <DeepAnalyticsSection
                    rescheduleInsight={aiInsights.metrics.rescheduleInsight}
                    styles={styles}
                />
            )}

            {/* Biểu đồ phân tích chi tiết trong AI Insights */}
            {aiInsights && (
                <div className={styles.aiChartsSection}>
                    <div className={styles.chartsRow}>
                        {/* Xu hướng lịch hẹn */}
                        {appointmentTrendPoints.length > 0 && (
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
                        )}

                        {/* Bệnh nhân mới */}
                        {newPatientTrendPoints.length > 0 && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Bệnh nhân mới</h5>
                                    <span>Theo dõi số lượt đặt lịch lần đầu</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsLine
                                        data={newPatientTrendPoints}
                                        color="#818CF8"
                                        label="Bệnh nhân mới"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.chartsRow}>
                        {/* Thống kê cuộc hẹn hoàn thành và hủy */}
                        {completedVsCancelledData.length > 0 && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Thống kê cuộc hẹn hoàn thành và hủy</h5>
                                    <span>Thống kê trạng thái lịch hẹn</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsMultiBar
                                        data={completedVsCancelledData}
                                        color1="#10b981"
                                        color2="#ef4444"
                                        label1="Hoàn thành/Xác nhận"
                                        label2="Hủy/Chờ"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Thống kê theo giờ trong ngày */}
                        {peakHoursChartData.length > 0 && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Thống kê theo giờ trong ngày</h5>
                                    <span>Phân tích giờ cao điểm đặt lịch</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsSingleBar
                                        data={peakHoursChartData}
                                        color="#f59e0b"
                                        label="Số lịch hẹn"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.chartsRow}>
                        {/* Thống kê theo loại khám */}
                        {appointmentTypeChartData.length > 0 && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Thống kê theo loại khám</h5>
                                    <span>Phân bổ lượt đặt theo hình thức khám</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsSingleBar
                                        data={appointmentTypeChartData}
                                        color="#06b6d4"
                                        label="Số lịch hẹn"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Phân bổ gói đăng ký */}
                        {subscriptionChartData.length > 0 && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Phân bổ gói đăng ký</h5>
                                    <span>
                                        Thống kê hủy, nâng cấp và tổng số đăng ký theo từng gói
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
                        )}
                    </div>

                    {/* Xu hướng tỉ lệ hủy */}
                    <div className={styles.chartsRow}>
                        {/* Xu hướng tỉ lệ hủy */}
                        {predictions && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Xu hướng tỉ lệ hủy</h5>
                                    <span>Biểu đồ vùng thể hiện tỉ lệ hủy qua các kỳ</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsArea
                                        data={[
                                            {
                                                label: 'Kỳ trước',
                                                value: Math.max(
                                                    0,
                                                    Math.min(
                                                        100,
                                                        aiInsights.metrics.cancellationRate -
                                                            (aiInsights.metrics
                                                                .cancellationDeltaPercent /
                                                                100) *
                                                                aiInsights.metrics.cancellationRate
                                                    )
                                                ),
                                            },
                                            {
                                                label: 'Kỳ này',
                                                value: aiInsights.metrics.cancellationRate,
                                            },
                                            {
                                                label: 'Dự đoán kỳ tới',
                                                value: predictions.predictedCancellationRate,
                                            },
                                        ]}
                                        color="#f59e0b"
                                        label="Tỉ lệ hủy (%)"
                                        fillOpacity={0.3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Phân bổ chuyên khoa và Phân bổ trạng thái - 2 biểu đồ tròn */}
                    <div className={styles.chartsRow}>
                        {/* Phân bổ chuyên khoa */}
                        {specialtyChartData.length > 0 && specialtyChartData[0].value > 0 && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Phân bổ chuyên khoa</h5>
                                    <span>Tỷ lệ lượt đặt theo từng chuyên khoa</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsPie data={specialtyChartData} />
                                </div>
                            </div>
                        )}

                        {/* Phân bổ trạng thái lịch hẹn */}
                        {statusChartData.length > 0 && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Phân bổ trạng thái lịch hẹn</h5>
                                    <span>Tỷ lệ các trạng thái trong kỳ hiện tại</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsPie data={statusChartData} />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Doanh thu từ đăng ký gói - Standalone section outside AI Insights */}
            {isLoadingRevenueChart ? (
                <div className={styles.trendCard}>
                    <div className={styles.cardHeader}>
                        <h5>Doanh thu từ đăng ký gói</h5>
                        <span>
                            Biểu đồ thống kê doanh thu từ các gói đăng ký (không bao gồm thanh toán
                            lịch hẹn)
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
                                    Biểu đồ thống kê doanh thu từ các gói đăng ký (không bao gồm
                                    thanh toán lịch hẹn)
                                </span>
                            </div>
                            <RevenueFilterButtons
                                selectedPeriod={revenuePeriod}
                                onPeriodChange={setRevenuePeriod}
                                isLoading={isLoadingRevenueChart}
                            />
                        </div>
                        <div className={styles.cardBody}>
                            <ChartJsBar
                                data={revenueChartData}
                                color1="#a78bfa"
                                color2="#10b981"
                                label1="Tổng doanh thu"
                                label2="Đã hoàn thành"
                                stacked={true}
                            />
                        </div>
                    </div>
                )
            )}

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

                            {/* Ẩn các biểu đồ mặc định - chỉ hiển thị khi có AI Insights */}
                            {/* Các biểu đồ này sẽ được hiển thị trong phần AI Insights */}
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
