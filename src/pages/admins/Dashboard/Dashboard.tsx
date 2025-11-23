import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { subDays, startOfDay, endOfDay } from 'date-fns';
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
import { DashboardFilters } from '@/components/DashboardFilters';
import { DashboardTrendCharts } from '@/components/DashboardTrendCharts';
import DashboardOverviewMetrics from '@/components/DashboardOverviewMetrics';
import {
    periodOptions,
    numberFormatter,
    formatPercent,
    formatDateDisplay,
    formatTrendLabel,
    getPeriodKey,
} from '@/utils/dashboard.utils';

type ChartPoint = { label: string; value: number };

interface AdminStatistics {
    totalAppointments: number;
    completedAppointments: number;
    confirmedAppointments: number;
    pendingAppointments: number;
    cancelledAppointments: number;
    newPatients: number;
    noShowRate: number;
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

const AdminDashboard: React.FC = () => {
    const [period, setPeriod] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
        const end = new Date();
        return {
            end,
            start: subDays(end, 29),
        };
    });

    const [stats, setStats] = useState<AdminStatistics | null>(null);
    const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
    const [appointmentTrend, setAppointmentTrend] = useState<AppointmentTrendPoint[]>([]);
    const [newPatientTrend, setNewPatientTrend] = useState<NewPatientTrendPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
    const [additionalStats, setAdditionalStats] = useState<{
        peakHours: Array<{ hour: string; count: number }>;
        appointmentTypeStats: { telehealth: number; inPerson: number };
        returningPatients: number;
        completionRate: number;
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

    const isoRange = useMemo(() => {
        const start = dateRange.start ? startOfDay(dateRange.start).toISOString() : undefined;
        const end = dateRange.end ? endOfDay(dateRange.end).toISOString() : undefined;
        return { fromDate: start, toDate: end };
    }, [dateRange]);

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

    // Calculate trend data based on period
    const calculateTrends = useCallback((appointments: any[], period: StatisticsPeriod) => {
        const appointmentTrendPoints: AppointmentTrendPoint[] = [];
        const newPatientTrendPoints: NewPatientTrendPoint[] = [];

        // Group appointments by period
        const grouped: Record<string, any[]> = {};
        const patientGroups: Record<string, Set<string>> = {};

        appointments.forEach((apt) => {
            if (!apt.appointmentDate) return;

            const date = new Date(apt.appointmentDate);
            if (Number.isNaN(date.getTime())) {
                console.warn('Invalid appointmentDate:', apt.appointmentDate);
                return;
            }

            const key = getPeriodKey(date, period);

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

                if (key.includes('Q')) {
                    const [year, quarter] = key.split('-Q');
                    const quarterNum = Number.parseInt(quarter, 10);
                    const month = (quarterNum - 1) * 3;
                    periodStart = new Date(Number.parseInt(year, 10), month, 1);
                } else if (key.match(/^\d{4}-\d{2}$/)) {
                    periodStart = new Date(`${key}-01`);
                } else if (key.match(/^\d{4}$/)) {
                    periodStart = new Date(`${key}-01-01`);
                } else if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    periodStart = new Date(key);
                } else {
                    periodStart = new Date(key);
                }

                if (Number.isNaN(periodStart.getTime())) {
                    console.warn(`Invalid date key: ${key}`);
                    return;
                }

                const periodEnd = new Date(periodStart);

                switch (period) {
                    case StatisticsPeriod.Daily:
                        break;
                    case StatisticsPeriod.Weekly:
                        periodEnd.setDate(periodEnd.getDate() + 6);
                        break;
                    case StatisticsPeriod.Monthly:
                        periodEnd.setMonth(periodEnd.getMonth() + 1);
                        periodEnd.setDate(0);
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

                if (!Number.isNaN(periodEnd.getTime())) {
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
        if (!isoRange.fromDate || !isoRange.toDate) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Fetch all appointments in the date range
            const response = await AppointmentService.getAppointmentsForManagement({
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
    }, [isoRange.fromDate, isoRange.toDate, period, calculateStatistics, calculateTrends]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

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
                // Get batch statistics for doctors and services
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

                // Calculate totals for doctors
                let doctorTotalReviews = 0;
                let doctorRatingSum = 0;

                Object.values(doctorsStats).forEach((stat: any) => {
                    if (stat.totalReviews > 0) {
                        doctorTotalReviews += stat.totalReviews;
                        doctorRatingSum += stat.averageRating * stat.totalReviews;
                    }
                });

                // Calculate totals for services
                let serviceTotalReviews = 0;
                let serviceRatingSum = 0;

                Object.values(servicesStats).forEach((stat: any) => {
                    if (stat.totalReviews > 0) {
                        serviceTotalReviews += stat.totalReviews;
                        serviceRatingSum += stat.averageRating * stat.totalReviews;
                    }
                });

                // Combined totals (not used anymore, but kept for reference)

                // Find top doctors (top 5)
                const topDoctors = doctors
                    .map((doctor: any) => {
                        const stat = (doctorsStats as Record<string, any>)[doctor.id];
                        return {
                            id: doctor.id,
                            name:
                                `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() ||
                                'Bác sĩ',
                            rating: stat?.averageRating || 0,
                            reviews: stat?.totalReviews || 0,
                        };
                    })
                    .filter((d: any) => d.reviews > 0)
                    .sort((a: any, b: any) => {
                        if (b.rating !== a.rating) return b.rating - a.rating;
                        return b.reviews - a.reviews;
                    })
                    .slice(0, 5);

                // Find top services (top 5)
                const topServices = services
                    .map((service: any) => {
                        const stat = (servicesStats as Record<string, any>)[service.id];
                        return {
                            id: service.id,
                            name: service.name || 'Dịch vụ',
                            rating: stat?.averageRating || 0,
                            reviews: stat?.totalReviews || 0,
                        };
                    })
                    .filter((s: any) => s.reviews > 0)
                    .sort((a: any, b: any) => {
                        if (b.rating !== a.rating) return b.rating - a.rating;
                        return b.reviews - a.reviews;
                    })
                    .slice(0, 5);

                // Create chart data for doctors (top 10)
                const doctorChartData = doctors
                    .map((doctor: any) => {
                        const stat = (doctorsStats as Record<string, any>)[doctor.id];
                        return {
                            label:
                                `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() ||
                                'Bác sĩ',
                            rating: stat?.averageRating || 0,
                            reviews: stat?.totalReviews || 0,
                        };
                    })
                    .filter((d: any) => d.rating > 0)
                    .sort((a: any, b: any) => b.rating - a.rating)
                    .slice(0, 10)
                    .map((d: any) => ({
                        label: d.label,
                        value1: d.rating,
                        value2: d.reviews,
                    }));

                // Create chart data for services (top 10)
                const serviceChartData = services
                    .map((service: any) => {
                        const stat = (servicesStats as Record<string, any>)[service.id];
                        return {
                            label: service.name || 'Dịch vụ',
                            rating: stat?.averageRating || 0,
                            reviews: stat?.totalReviews || 0,
                        };
                    })
                    .filter((s: any) => s.rating > 0)
                    .sort((a: any, b: any) => b.rating - a.rating)
                    .slice(0, 10)
                    .map((s: any) => ({
                        label: s.label,
                        value1: s.rating,
                        value2: s.reviews,
                    }));

                // Combine rating distribution from all doctors and services
                const extractRatingDistributions = (
                    statsObj: Record<string, any>
                ): Array<{ rating: number; count: number }> => {
                    const stats = Object.values(statsObj) as any[];
                    return stats
                        .filter(
                            (stat: any) =>
                                stat.ratingDistribution && Array.isArray(stat.ratingDistribution)
                        )
                        .flatMap((stat: any) => stat.ratingDistribution);
                };

                const updateRatingDistributionMap = (
                    map: Record<number, { count: number }>,
                    dist: { rating: number; count?: number }
                ): void => {
                    if (!map[dist.rating]) {
                        map[dist.rating] = { count: 0 };
                    }
                    map[dist.rating].count += dist.count || 0;
                };

                const ratingDistributionMap: Record<number, { count: number }> = {};
                const allDistributions = [
                    ...extractRatingDistributions(doctorsStats),
                    ...extractRatingDistributions(servicesStats),
                ];

                allDistributions.forEach((dist) => {
                    updateRatingDistributionMap(ratingDistributionMap, dist);
                });

                const totalRatingCount = Object.values(ratingDistributionMap).reduce(
                    (sum, dist) => sum + dist.count,
                    0
                );

                const ratingDistribution = Object.entries(ratingDistributionMap)
                    .map(([rating, dist]) => ({
                        rating: Number.parseInt(rating, 10),
                        count: dist.count,
                        percentage:
                            totalRatingCount > 0 ? (dist.count / totalRatingCount) * 100 : 0,
                    }))
                    .sort((a, b) => b.rating - a.rating);

                const doctorAverageRating =
                    doctorTotalReviews > 0 ? doctorRatingSum / doctorTotalReviews : 0;
                const serviceAverageRating =
                    serviceTotalReviews > 0 ? serviceRatingSum / serviceTotalReviews : 0;

                setReviewStats({
                    doctorTotalReviews,
                    serviceTotalReviews,
                    doctorAverageRating,
                    serviceAverageRating,
                    ratingDistribution,
                    topDoctors,
                    topServices,
                    doctorChartData,
                    serviceChartData,
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

    const handleDateChange = (key: 'start' | 'end', value: string) => {
        if (!value) return;
        setDateRange((prev) => ({
            ...prev,
            [key]: new Date(value),
        }));
    };

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
        return [
            {
                label: 'Tổng lịch hẹn',
                value: stats.totalAppointments,
                sub: `Trong khoảng thời gian đã chọn | ${formatPercent(stats.noShowRate)} vắng/huỷ`,
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
                sub: 'Chờ xác nhận',
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
                sub: 'Bệnh nhân đặt lịch lần đầu',
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

    const ratingChartData = useMemo(() => {
        if (!reviewStats?.ratingDistribution) return [];

        const ratingDistribution = Array.isArray(reviewStats.ratingDistribution)
            ? reviewStats.ratingDistribution
            : [];

        if (ratingDistribution.length === 0) return [];

        return ratingDistribution
            .slice()
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
        if (!appointmentTrend || appointmentTrend.length === 0) return [];
        return appointmentTrend.map((point) => ({
            label: formatTrendLabel(point.periodStart, point.periodEnd),
            value1: point.completedAppointments,
            value2: point.cancelledAppointments,
        }));
    }, [appointmentTrend]);

    const appointmentTypeChartData = useMemo<ChartPoint[]>(() => {
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

                                    {(reviewStats.topDoctors.length > 0 ||
                                        reviewStats.topServices.length > 0) && (
                                        <div className={styles.topRankingsContainer}>
                                            {reviewStats.topDoctors.length > 0 && (
                                                <div className={styles.trendCard}>
                                                    <div className={styles.cardHeader}>
                                                        <h5>Top bác sĩ được đánh giá cao</h5>
                                                        <span>
                                                            Top 5 bác sĩ có điểm đánh giá tốt nhất
                                                        </span>
                                                    </div>
                                                    <div className={styles.cardBody}>
                                                        <div className={styles.topList}>
                                                            {reviewStats.topDoctors.map(
                                                                (doctor, index) => (
                                                                    <div
                                                                        key={doctor.id}
                                                                        className={styles.topItem}
                                                                    >
                                                                        <div
                                                                            className={
                                                                                styles.topRank
                                                                            }
                                                                        >
                                                                            #{index + 1}
                                                                        </div>
                                                                        <div
                                                                            className={
                                                                                styles.topInfo
                                                                            }
                                                                        >
                                                                            <div
                                                                                className={
                                                                                    styles.topName
                                                                                }
                                                                            >
                                                                                {doctor.name}
                                                                            </div>
                                                                            <div
                                                                                className={
                                                                                    styles.topStats
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        styles.topRating
                                                                                    }
                                                                                >
                                                                                    ⭐{' '}
                                                                                    {doctor.rating.toFixed(
                                                                                        1
                                                                                    )}
                                                                                </span>
                                                                                <span
                                                                                    className={
                                                                                        styles.topReviews
                                                                                    }
                                                                                >
                                                                                    (
                                                                                    {doctor.reviews}{' '}
                                                                                    đánh giá)
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {reviewStats.topServices.length > 0 && (
                                                <div className={styles.trendCard}>
                                                    <div className={styles.cardHeader}>
                                                        <h5>Top dịch vụ được đánh giá cao</h5>
                                                        <span>
                                                            Top 5 dịch vụ có điểm đánh giá tốt nhất
                                                        </span>
                                                    </div>
                                                    <div className={styles.cardBody}>
                                                        <div className={styles.topList}>
                                                            {reviewStats.topServices.map(
                                                                (service, index) => (
                                                                    <div
                                                                        key={service.id}
                                                                        className={styles.topItem}
                                                                    >
                                                                        <div
                                                                            className={
                                                                                styles.topRank
                                                                            }
                                                                        >
                                                                            #{index + 1}
                                                                        </div>
                                                                        <div
                                                                            className={
                                                                                styles.topInfo
                                                                            }
                                                                        >
                                                                            <div
                                                                                className={
                                                                                    styles.topName
                                                                                }
                                                                            >
                                                                                {service.name}
                                                                            </div>
                                                                            <div
                                                                                className={
                                                                                    styles.topStats
                                                                                }
                                                                            >
                                                                                <span
                                                                                    className={
                                                                                        styles.topRating
                                                                                    }
                                                                                >
                                                                                    ⭐{' '}
                                                                                    {service.rating.toFixed(
                                                                                        1
                                                                                    )}
                                                                                </span>
                                                                                <span
                                                                                    className={
                                                                                        styles.topReviews
                                                                                    }
                                                                                >
                                                                                    (
                                                                                    {
                                                                                        service.reviews
                                                                                    }{' '}
                                                                                    đánh giá)
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
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
