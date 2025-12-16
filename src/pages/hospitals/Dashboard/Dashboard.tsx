import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { format } from 'date-fns';
import styles from './Dashboard.module.scss';
import { RootState } from '@/store';

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
import { DiscountService } from '@/services/discount.service';
import { getAllServiceIds } from '@/services/service.service';
import { getAllSpecialtiesSimple } from '@/services/specialty.service';
import { getAllServiceTypesSimple } from '@/services/serviceType.service';
import { getAllPositionsSimple } from '@/services/position.service';
import { getAllLanguagesSimple } from '@/services/language.service';
import { StatisticsPeriod } from '@/types/statistics.types';
import { AppointmentStatus } from '@/enums/appointment.enums';
import { calculateAdditionalStatistics as calculateAdditionalStatisticsUtil } from '@/utils/dashboardStatistics';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import { ChartJsMultiBar, ChartJsSingleBar } from '@/components/ChartJsLine';
import { ChartJsPie } from '@/components/ChartJsLine/ChartJsPie';
import { ChartJsArea } from '@/components/ChartJsLine/ChartJsArea';
import { ChartJsLine } from '@/components/ChartJsLine/ChartJsLine';
import DashboardReviewSection from '@/components/DashboardReviewSection';
import DashboardRatingDistributionChart from '@/components/DashboardRatingDistributionChart';
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
import AIService, { AiInsightResponse, GenerateAiInsightRequest } from '@/services/aiService';

interface HospitalStatistics {
    totalAppointments: number;
    completedAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    newPatients: number;
    noShowRate: number;
}

interface HospitalOverview {
    totalHospitals: number;
    totalDoctors: number;
    totalAppointments: number;
    totalUsers: number;
    totalRevenue: number;
    totalDiscounts: number;
    totalSpecialties: number;
    totalServiceTypes: number;
    totalPositions: number;
    totalLanguages: number;
}

type HospitalAdditionalStats = ReturnType<typeof calculateAdditionalStatisticsUtil>;

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

const hospitalMetricOverrides: Partial<Record<AppointmentMetricKey, AppointmentMetricOverride>> = {
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

const HospitalDashboard: React.FC = () => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const [period] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const { isoRange } = useDashboardDateRange();

    const [systemOverview, setSystemOverview] = useState<HospitalOverview | null>(null);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [aiInsights, setAiInsights] = useState<AiInsightResponse | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiDateRange, setAiDateRange] = useState<{ from: Date | null; to: Date | null }>({
        from: null,
        to: null,
    });
    const [aiLoadingStep, setAiLoadingStep] = useState<number>(0); // 0: idle, 1: collecting, 2: analyzing, 3: generating
    const fetchHospitalReviewEntities = useCallback(async () => {
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
        fetchEntities: fetchHospitalReviewEntities,
        includeRatingDistribution: true,
    });

    // Doanh thu lịch hẹn
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
        if (!hospitalProfile?.id) {
            setSystemOverview(null);
            return;
        }
        setIsLoadingOverview(true);
        try {
            const [
                doctorsRes,
                appointmentsRes,
                discountsRes,
                specialtiesRes,
                serviceTypesRes,
                positionsRes,
                languagesRes,
            ] = await Promise.all([
                DoctorService.filterDoctors({
                    hospitalId: hospitalProfile.id,
                    pageNumber: 1,
                    pageSize: 1,
                }).catch(() => ({
                    data: { totalCount: 0 },
                })),
                AppointmentService.getAppointmentsForManagement({
                    hospitalId: hospitalProfile.id,
                    fromDate: undefined,
                    toDate: undefined,
                    pageNumber: 1,
                    pageSize: 1,
                    includeStatusCounts: true,
                }).catch(() => ({ data: { totalCount: 0 } })),
                DiscountService.getDiscounts({ page: 1, limit: 1 }).catch(() => ({
                    data: { pagination: { total: 0 } },
                })),
                getAllSpecialtiesSimple().catch(() => ({ data: [] })),
                getAllServiceTypesSimple().catch(() => ({ data: [] })),
                getAllPositionsSimple().catch(() => ({ data: [] })),
                getAllLanguagesSimple().catch(() => ({ data: [] })),
            ]);

            const totalHospitals = 1;
            const totalDoctors = (doctorsRes.data as any)?.totalCount || 0;
            const totalAppointments = (appointmentsRes.data as any)?.totalCount || 0;
            const totalDiscounts = (discountsRes.data as any)?.pagination?.total || 0;
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
                totalUsers: 0,
                totalRevenue: 0,
                totalDiscounts,
                totalSpecialties,
                totalServiceTypes,
                totalPositions,
                totalLanguages,
            });
        } catch (err: any) {
            console.error('Failed to load system overview:', err);
            setSystemOverview({
                totalHospitals: 1,
                totalDoctors: 0,
                totalAppointments: 0,
                totalUsers: 0,
                totalRevenue: 0,
                totalDiscounts: 0,
                totalSpecialties: 0,
                totalServiceTypes: 0,
                totalPositions: 0,
                totalLanguages: 0,
            });
        } finally {
            setIsLoadingOverview(false);
        }
    }, [hospitalProfile?.id]);

    useEffect(() => {
        loadSystemOverview();
    }, [loadSystemOverview]);

    // Tự động tải AI insights khi vào trang (giống admin), dùng tuần gần nhất nếu chưa chọn range
    useEffect(() => {
        if (hospitalProfile?.id && !isLoadingAi && !aiInsights) {
            void loadAiInsights();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hospitalProfile?.id, isLoadingAi, aiInsights]);

    const activeDateRange = useMemo(() => {
        if (aiInsights?.periodStart && aiInsights?.periodEnd) {
            const fromDate = new Date(aiInsights.periodStart).toISOString().split('T')[0];
            const toDate = new Date(aiInsights.periodEnd).toISOString().split('T')[0];
            return {
                fromDate,
                toDate,
            };
        }
        return {
            fromDate: isoRange.fromDate,
            toDate: isoRange.toDate,
        };
    }, [aiInsights?.periodStart, aiInsights?.periodEnd, isoRange.fromDate, isoRange.toDate]);

    const loadRevenueChart = useCallback(
        async (range?: { fromDate?: string; toDate?: string }) => {
            if (!hospitalProfile?.id) return;
            setIsLoadingRevenueChart(true);
            try {
                const formatLocalDate = (date: Date): string => {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                let fromDateStr: string;
                let toDateStr: string;
                let apiPeriod: PaymentStatisticsPeriod;

                if (range?.fromDate && range?.toDate) {
                    fromDateStr = range.fromDate;
                    toDateStr = range.toDate;
                } else if (activeDateRange.fromDate && activeDateRange.toDate) {
                    fromDateStr = activeDateRange.fromDate.split('T')[0];
                    toDateStr = activeDateRange.toDate.split('T')[0];
                } else {
                    const now = new Date();
                    const defaultFrom = new Date(now);
                    defaultFrom.setDate(now.getDate() - 27);
                    fromDateStr = formatLocalDate(defaultFrom);
                    toDateStr = formatLocalDate(now);
                }

                const fromDate = new Date(fromDateStr + 'T00:00:00');
                const toDate = new Date(toDateStr + 'T00:00:00');
                const daysDiff = Math.ceil(
                    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysDiff <= 7) {
                    apiPeriod = PaymentStatisticsPeriod.Daily;
                } else if (daysDiff <= 28) {
                    apiPeriod = PaymentStatisticsPeriod.Weekly;
                } else if (daysDiff <= 180) {
                    apiPeriod = PaymentStatisticsPeriod.Monthly;
                } else {
                    apiPeriod = PaymentStatisticsPeriod.Quarterly;
                }

                const request: GetPaymentStatisticsRequest = {
                    fromDate: fromDateStr,
                    toDate: toDateStr,
                    period: apiPeriod,
                };

                const response = await PaymentMethodService.getPaymentStatistics(request);
                const statistics: PaymentStatisticsResponse = response.data;

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
                toast.error(
                    `Không thể tải dữ liệu doanh thu: ${err?.response?.data?.message || err?.message || 'Lỗi không xác định'}`
                );
                setRevenueChartData([]);
            } finally {
                setIsLoadingRevenueChart(false);
            }
        },
        [activeDateRange.fromDate, activeDateRange.toDate, hospitalProfile?.id]
    );

    const loadAiInsights = useCallback(async () => {
        if (!hospitalProfile?.id) {
            toast.error('Không tìm thấy thông tin bệnh viện.');
            return;
        }
        setIsLoadingAi(true);
        setAiError(null);
        setAiLoadingStep(1); // Start collecting data
        try {
            const request: GenerateAiInsightRequest =
                aiDateRange.from && aiDateRange.to
                    ? {
                          fromDate: aiDateRange.from.toISOString().split('T')[0],
                          toDate: aiDateRange.to.toISOString().split('T')[0],
                      }
                    : { period: 'week' };

            await new Promise((resolve) => setTimeout(resolve, 500));
            setAiLoadingStep(2); // Analyzing AI
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setAiLoadingStep(3); // Generating report

            const response = await AIService.generateInsightsForHospital(
                hospitalProfile.id,
                request
            );
            if (response.success && response.data) {
                setAiInsights(response.data);
                // Sau khi có AI insights, tải luôn doanh thu lịch hẹn theo cùng khoảng thời gian
                const fromDateParam = response.data.periodStart
                    ? new Date(response.data.periodStart).toISOString().split('T')[0]
                    : undefined;
                const toDateParam = response.data.periodEnd
                    ? new Date(response.data.periodEnd).toISOString().split('T')[0]
                    : undefined;
                await loadRevenueChart({
                    fromDate: fromDateParam,
                    toDate: toDateParam,
                });
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
    }, [aiDateRange.from, aiDateRange.to, hospitalProfile?.id, loadRevenueChart]);

    // Calculate statistics from appointments
    const calculateStatistics = useCallback(
        async (appointments: any[]): Promise<HospitalStatistics> => {
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

    const fetchHospitalAppointments = useCallback(async () => {
        if (!activeDateRange.fromDate || !activeDateRange.toDate) {
            return null;
        }
        const response = await AppointmentService.getAppointmentsForManagement({
            hospitalId: hospitalProfile?.id,
            fromDate: activeDateRange.fromDate,
            toDate: activeDateRange.toDate,
            pageNumber: 1,
            pageSize: 10000, // Get all appointments
            includeStatusCounts: false,
        });

        return response.data?.appointments ?? [];
    }, [activeDateRange.fromDate, activeDateRange.toDate, hospitalProfile?.id]);

    const handleStatisticsError = useCallback((message: string) => {
        toast.error(message);
    }, []);

    const { stats, appointmentTrendPoints, newPatientTrendPoints, additionalStats, isLoading } =
        useAppointmentStatistics<HospitalStatistics, HospitalAdditionalStats>({
            period,
            fetchAppointments: fetchHospitalAppointments,
            calculateStatistics,
            calculateAdditionalStatistics,
            onError: handleStatisticsError,
        });

    // Hospital dashboard không hiển thị thống kê gói đăng ký / doanh thu gói,
    // nên bỏ phần loadSubscriptionChart và loadRevenueChart để tránh gọi API không cần thiết.

    const systemOverviewMetrics = useMemo(() => {
        if (!systemOverview) return [];
        return [
            {
                label: 'Bệnh viện',
                value: systemOverview.totalHospitals,
                sub: hospitalProfile?.name || 'Thông tin bệnh viện',
                className: `${styles.metricCard} ${styles.cardHospitals}`,
                icon: 'ti ti-building-hospital',
            },
            {
                label: 'Tổng số bác sĩ',
                value: systemOverview.totalDoctors,
                sub: 'Bác sĩ trong bệnh viện',
                className: `${styles.metricCard} ${styles.cardDoctors}`,
                icon: 'ti ti-user',
            },
            {
                label: 'Tổng số cuộc hẹn',
                value: systemOverview.totalAppointments,
                sub: 'Tất cả cuộc hẹn trong bệnh viện',
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
    }, [systemOverview, hospitalProfile?.name]);

    const overviewMetrics = useMemo(() => {
        if (!stats) return [];
        return buildAppointmentOverviewMetrics(stats, hospitalMetricOverrides).map((metric) => {
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
            predictedRevenue: 0,
            specialtyTrend: aiInsights.metrics.topSpecialtyName || 'Chưa xác định',
            specialtyGrowth: growth > 0 ? 'Tăng' : growth < 0 ? 'Giảm' : 'Ổn định',
        };
    }, [aiInsights, stats]);

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

    const statusChartData = useMemo(() => {
        if (!stats) return [];
        return [
            { label: 'Hoàn thành', value: stats.completedAppointments },
            { label: 'Đã xác nhận', value: stats.confirmedAppointments },
            { label: 'Chờ xác nhận', value: stats.pendingAppointments },
            { label: 'Đã hủy', value: stats.cancelledAppointments },
        ];
    }, [stats]);

    // Fallback data to vẫn hiển thị chart khi chưa có dữ liệu
    const fallbackLineData: ChartPoint[] = [{ label: 'Chưa có dữ liệu', value: 0 }];
    const fallbackMultiBarData = [{ label: 'Chưa có dữ liệu', value1: 0, value2: 0 }];
    const fallbackPieData = [{ label: 'Chưa có dữ liệu', value: 0 }];
    const fallbackRevenueData = [{ label: 'Chưa có dữ liệu', value: 0 }];
    const appointmentTrendSafe = appointmentTrendPoints.length
        ? appointmentTrendPoints
        : fallbackLineData;
    const newPatientTrendSafe = newPatientTrendPoints.length
        ? newPatientTrendPoints
        : fallbackLineData;
    const completedVsCancelledSafe = completedVsCancelledData.length
        ? completedVsCancelledData
        : fallbackMultiBarData;
    const peakHoursSafe = peakHoursChartData.length ? peakHoursChartData : fallbackLineData;
    const appointmentTypeSafe = appointmentTypeChartData.length
        ? appointmentTypeChartData
        : fallbackLineData;
    const specialtySafe = specialtyChartData.length ? specialtyChartData : fallbackPieData;
    const statusSafe = statusChartData.length ? statusChartData : fallbackPieData;
    const revenueSafe = revenueChartData.length ? revenueChartData : fallbackRevenueData;
    const cancellationAreaSafe = predictions
        ? [
              {
                  label: 'Kỳ trước',
                  value: Math.max(
                      0,
                      Math.min(
                          100,
                          aiInsights!.metrics.cancellationRate -
                              (aiInsights!.metrics.cancellationDeltaPercent / 100) *
                                  aiInsights!.metrics.cancellationRate
                      )
                  ),
              },
              {
                  label: 'Kỳ này',
                  value: aiInsights!.metrics.cancellationRate,
              },
              {
                  label: 'Dự đoán kỳ tới',
                  value: predictions.predictedCancellationRate,
              },
          ]
        : [
              { label: 'Kỳ trước', value: 0 },
              { label: 'Kỳ này', value: 0 },
              { label: 'Dự đoán kỳ tới', value: 0 },
          ];

    return (
        <div className={`content ${styles.dashboardPage}`} id="hospitalDashboardPage">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-0">Bảng điều khiển bệnh viện</h4>
                </div>
            </div>

            <div className={styles.trendCard}>
                <div className={styles.cardHeader}>
                    <h5>AI phân tích bệnh viện, dự đoán tương lai</h5>
                </div>

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
                                    maxDate={aiDateRange.to || undefined}
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
                                        width: '100%',
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
                                        width: '100%',
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
                            </div>
                        </div>
                    </LocalizationProvider>
                    <div className={styles.dateRangeInfo}>
                        <i className="ti ti-info-circle"></i>
                        <span>
                            {aiDateRange.from && aiDateRange.to
                                ? `Phân tích từ ${formatDateDisplay(aiDateRange.from)} đến ${formatDateDisplay(aiDateRange.to)}`
                                : 'Để trống để sử dụng mặc định (tuần gần nhất)'}
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
                                        <span>Bước 1: Thu thập dữ liệu</span>
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
                                        <span>Bước 2: Phân tích AI</span>
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
                                        <span>Bước 3: Tạo báo cáo</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : !aiInsights ? (
                        <div className={styles.aiEmptyState}></div>
                    ) : (
                        <>
                            <div className={styles.aiSummaryRow}>
                                <div className={styles.aiBadge}>
                                    <span className={styles.aiBadgeLabel}>Đang lọc từ:</span>
                                    <span className={styles.aiBadgeDateRange}>
                                        {aiInsights.periodStart
                                            ? new Date(aiInsights.periodStart)
                                                  .toLocaleDateString('vi-VN', {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                      year: 'numeric',
                                                  })
                                                  .replace(/\//g, '-')
                                            : '--'}
                                        {' đến '}
                                        {aiInsights.periodEnd
                                            ? new Date(aiInsights.periodEnd)
                                                  .toLocaleDateString('vi-VN', {
                                                      day: '2-digit',
                                                      month: '2-digit',
                                                      year: 'numeric',
                                                  })
                                                  .replace(/\//g, '-')
                                            : '--'}
                                    </span>
                                </div>
                                <span className={styles.aiMeta}>
                                    <i className="ti ti-clock me-1"></i>
                                    <span className={styles.aiMetaLabel}>Cập nhật:</span>
                                    <span className={styles.aiMetaTime}>
                                        {new Date(aiInsights.generatedAt).toLocaleString('vi-VN')}
                                    </span>
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {aiInsights && (aiInsights.analysisConclusion || aiInsights.predictionConclusion) && (
                <div className={styles.aiConclusionCardsWrapper}>
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

            {aiInsights && (
                <div className={styles.aiInsightsRow}>
                    <div className={styles.trendCard}>
                        <div className={styles.cardHeader}>
                            <h5>
                                <i className="ti ti-alert-circle me-2"></i>
                                Cảnh báo & Thông báo
                            </h5>
                            <span>Phát hiện các chỉ số bất thường cần chú ý</span>
                        </div>
                        <div className={styles.cardBody}>
                            {aiInsights.alerts && aiInsights.alerts.length > 0 ? (
                                <div className={styles.alertsGrid}>
                                    {aiInsights.alerts.map((alert: any, index: number) => {
                                        const alertTypeClass = styles.alertCritical;
                                        const severityIconMap: Record<string, string> = {
                                            high: 'ti ti-alert-triangle',
                                            medium: 'ti ti-alert-triangle',
                                            low: 'ti ti-alert-triangle',
                                        };
                                        const severityIcon =
                                            severityIconMap[alert.severity] ||
                                            'ti ti-alert-triangle';
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
                                                            {alert.title}
                                                        </h6>
                                                        {alert.metric && (
                                                            <span className={styles.alertMetric}>
                                                                {alert.metric}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={styles.alertBadge}
                                                        data-severity={alert.severity}
                                                    >
                                                        {alert.severity === 'high'
                                                            ? 'Cao'
                                                            : alert.severity === 'medium'
                                                              ? 'Trung bình'
                                                              : 'Thấp'}
                                                    </span>
                                                </div>
                                                <p className={styles.alertMessage}>
                                                    {alert.message}
                                                </p>
                                                {(alert.currentValue !== undefined ||
                                                    alert.thresholdValue !== undefined) && (
                                                    <div className={styles.alertValues}>
                                                        {alert.currentValue !== undefined && (
                                                            <span>
                                                                Giá trị hiện tại:{' '}
                                                                <strong>
                                                                    {alert.currentValue}
                                                                </strong>
                                                            </span>
                                                        )}
                                                        {alert.thresholdValue !== undefined && (
                                                            <span>
                                                                Ngưỡng:{' '}
                                                                <strong>
                                                                    {alert.thresholdValue}
                                                                </strong>
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {alert.recommendedAction && (
                                                    <div className={styles.alertAction}>
                                                        <i className="ti ti-lightbulb me-2"></i>
                                                        <strong>Khuyến nghị:</strong>{' '}
                                                        {alert.recommendedAction}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className={styles.emptyState}>
                                    Chưa có cảnh báo trong kỳ này.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.trendCard}>
                        <div className={styles.cardHeader}>
                            <h5>
                                <i className="ti ti-search me-2"></i>
                                Phân tích nguyên nhân gốc rễ
                            </h5>
                            <span>Phân tích sâu các chỉ số bất thường để tìm nguyên nhân</span>
                        </div>
                        <div className={styles.cardBody}>
                            {aiInsights.rootCauseAnalyses &&
                            aiInsights.rootCauseAnalyses.length > 0 ? (
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
                            ) : (
                                <div className={styles.emptyState}>
                                    Chưa có phân tích nguyên nhân gốc rễ trong kỳ này.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={styles.trendCard}>
                        <div className={styles.cardHeader}>
                            <h5>
                                <i className="ti ti-chart-line me-2"></i>
                                Dự đoán tương lai chi tiết
                            </h5>
                            <span>Dự báo dựa trên xu hướng và mô hình phân tích</span>
                        </div>
                        <div className={styles.cardBody}>
                            {aiInsights.predictions && aiInsights.predictions.length > 0 ? (
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

                                            const alertTypeClass = styles.alertSuccess;

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
                                                                    <strong>
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
                                                                    <strong>
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
                                                                        <strong>
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
                            ) : (
                                <div className={styles.emptyState}>Chưa có dự đoán cho kỳ này.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {aiInsights && (
                <div className={styles.aiChartsSection}>
                    <div className={styles.chartsRow}>
                        {appointmentTrendSafe && (
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
                                        data={appointmentTrendSafe}
                                        color="#36B6C5"
                                        label="Xu hướng lịch hẹn"
                                    />
                                </div>
                            </div>
                        )}

                        {newPatientTrendSafe && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Bệnh nhân mới</h5>
                                    <span>Theo dõi số lượt đặt lịch lần đầu</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsLine
                                        data={newPatientTrendSafe}
                                        color="#818CF8"
                                        label="Bệnh nhân mới"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.chartsRow}>
                        {completedVsCancelledSafe && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Thống kê cuộc hẹn hoàn thành và hủy</h5>
                                    <span>Thống kê trạng thái lịch hẹn</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsMultiBar
                                        data={completedVsCancelledSafe}
                                        color1="#10b981"
                                        color2="#ef4444"
                                        label1="Hoàn thành/Xác nhận"
                                        label2="Hủy/Chờ"
                                    />
                                </div>
                            </div>
                        )}

                        {peakHoursSafe && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Thống kê theo giờ trong ngày</h5>
                                    <span>Phân tích giờ cao điểm đặt lịch</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsSingleBar
                                        data={peakHoursSafe}
                                        color="#f59e0b"
                                        label="Số lịch hẹn"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hàng 3: loại khám + chuyên khoa (2 chart cột/tròn) */}
                    {/* Hàng 3: 2 chart dạng cột (loại khám + doanh thu lịch hẹn) */}
                    <div className={styles.chartsRow}>
                        {appointmentTypeSafe && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Thống kê theo loại khám</h5>
                                    <span>Phân bổ lượt đặt theo hình thức khám</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsSingleBar
                                        data={appointmentTypeSafe}
                                        color="#06b6d4"
                                        label="Số lịch hẹn"
                                    />
                                </div>
                            </div>
                        )}

                        <div className={styles.trendCard}>
                            <div className={styles.cardHeader}>
                                <div>
                                    <h5>Doanh thu lịch hẹn</h5>
                                    <span>Thống kê doanh thu từ các lượt đặt trong kỳ</span>
                                </div>
                                <RevenueFilterButtons
                                    selectedPeriod={revenuePeriod}
                                    onPeriodChange={setRevenuePeriod}
                                    isLoading={isLoadingRevenueChart}
                                />
                            </div>
                            <div className={styles.cardBody}>
                                <ChartJsSingleBar
                                    data={revenueSafe}
                                    color="#10b981"
                                    label="Tổng doanh thu"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hàng 4: 2 chart dạng tròn (chuyên khoa + trạng thái) */}
                    <div className={styles.chartsRow}>
                        {specialtySafe && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Phân bổ chuyên khoa</h5>
                                    <span>Tỷ lệ lượt đặt theo từng chuyên khoa</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsPie data={specialtySafe} />
                                </div>
                            </div>
                        )}

                        {statusSafe && (
                            <div className={styles.trendCard}>
                                <div className={styles.cardHeader}>
                                    <h5>Phân bổ trạng thái lịch hẹn</h5>
                                    <span>Tỷ lệ các trạng thái trong kỳ hiện tại</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <ChartJsPie data={statusSafe} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Hàng 5: 1 chart vùng (tỉ lệ hủy) - vẫn hiển thị với fallback */}
                    <div className={styles.chartsRow}>
                        <div className={styles.trendCard}>
                            <div className={styles.cardHeader}>
                                <h5>Xu hướng tỉ lệ hủy</h5>
                                <span>Biểu đồ vùng thể hiện tỉ lệ hủy qua các kỳ</span>
                            </div>
                            <div className={styles.cardBody}>
                                <ChartJsArea
                                    data={cancellationAreaSafe}
                                    color="#f59e0b"
                                    label="Tỉ lệ hủy (%)"
                                    fillOpacity={0.3}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isLoadingOverview ? (
                <div className={styles.trendCard}>
                    <div className={styles.cardHeader}>
                        <h5>Tổng quan bệnh viện</h5>
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
                            <h5>Tổng quan bệnh viện</h5>
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

export default HospitalDashboard;
