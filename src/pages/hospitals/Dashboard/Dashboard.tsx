import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './Dashboard.module.scss';
import { RootState } from '@/store';
import AppointmentService from '@/services/appointment.service';
import { DoctorService } from '@/services/doctor.service';
import { HospitalService } from '@/services/hospital.service';
import { serviceService } from '@/services/service.service';
import { StatisticsPeriod, StaffHospitalStatisticsResponse } from '@/types/statistics.types';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import { ChartJsMultiBar, ChartJsSingleBar } from '@/components/ChartJsLine';
import { DashboardFilters } from '@/components/DashboardFilters';
import { DashboardTrendCharts } from '@/components/DashboardTrendCharts';
import DashboardOverviewMetrics from '@/components/DashboardOverviewMetrics';
import DashboardReviewSection from '@/components/DashboardReviewSection';
import { useDashboardDateRange } from '@/hooks/useDashboardDateRange';
import { useReviewInsights } from '@/hooks/useReviewInsights';
import { periodOptions, formatDateDisplay } from '@/utils/dashboard.utils';
import { AppointmentMetricKey, buildAppointmentOverviewMetrics } from '@/utils/appointmentMetrics';
import {
    buildAppointmentTrendPoints,
    buildNewPatientTrendPoints,
    ChartPoint,
} from '@/utils/dashboardChartData';
import { RevenueFilterButtons, RevenueViewPeriod } from '@/components/RevenueFilterButtons';
import { formatTimeLabel } from '@/utils/paymentChartFormatter';
import { StatisticsPeriod as PaymentStatisticsPeriod } from '@/types/payment.types';

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

const HospitalDashboard: React.FC = () => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const [period, setPeriod] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const { dateRange, isoRange, handleDateChange } = useDashboardDateRange();

    const [stats, setStats] = useState<StaffHospitalStatisticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hospitalOverview, setHospitalOverview] = useState<{
        specialtiesCount: number;
        serviceTypesCount: number;
        doctorsCount: number;
        serviceMedicalsCount: number;
    } | null>(null);
    const [isLoadingHospitalOverview, setIsLoadingHospitalOverview] = useState(false);

    // Revenue chart states
    const [revenuePeriod, setRevenuePeriod] = useState<RevenueViewPeriod>('4weeks');
    const [revenueChartData, setRevenueChartData] = useState<ChartPoint[]>([]);
    const [isLoadingRevenueChart, setIsLoadingRevenueChart] = useState(false);

    const fetchHospitalReviewEntities = useCallback(async () => {
        if (!hospitalProfile?.id) {
            return { doctors: [], services: [] };
        }

        // Optimized: fetch only IDs instead of full objects (reduces payload from 500KB-2MB to ~5KB)
        const [doctorIdsRes, serviceIdsRes] = await Promise.all([
            DoctorService.getDoctorIdsByHospital(hospitalProfile.id).catch(() => ({
                data: [],
            })),
            serviceService.getServiceIdsByHospital(hospitalProfile.id).catch(() => ({
                data: [],
            })),
        ]);

        const doctors = (doctorIdsRes.data || []).map((id: string) => ({ id }));
        const services = (serviceIdsRes.data || []).map((id: string) => ({ id }));

        return { doctors, services };
    }, [hospitalProfile?.id]);

    const { reviewStats, isLoadingReviewStats } = useReviewInsights({
        fetchEntities: fetchHospitalReviewEntities,
        enabled: !!hospitalProfile?.id,
    });

    const loadStatistics = useCallback(async () => {
        if (!hospitalProfile?.id || !isoRange.fromDate || !isoRange.toDate) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await AppointmentService.getHospitalStaffStatistics({
                hospitalId: hospitalProfile.id,
                period,
                fromDate: isoRange.fromDate,
                toDate: isoRange.toDate,
            });

            setStats(response.data ?? null);
        } catch (err: any) {
            const message = err?.message || 'Không thể tải dữ liệu thống kê';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, [hospitalProfile?.id, isoRange.fromDate, isoRange.toDate, period]);

    useEffect(() => {
        loadStatistics();
    }, [loadStatistics]);

    const loadHospitalOverview = useCallback(async () => {
        if (!hospitalProfile?.id) return;

        setIsLoadingHospitalOverview(true);
        try {
            // Optimized: single aggregate endpoint instead of 4 separate calls
            const overviewRes = await HospitalService.getHospitalOverview(hospitalProfile.id);

            if (overviewRes.data) {
                setHospitalOverview(overviewRes.data);
            }
        } catch (err: any) {
            console.error('Failed to load hospital overview:', err);
            // Fallback to hospitalProfile data
            setHospitalOverview({
                specialtiesCount: hospitalProfile?.specialties?.length ?? 0,
                serviceTypesCount: hospitalProfile?.serviceTypes?.length ?? 0,
                doctorsCount: 0,
                serviceMedicalsCount: 0,
            });
        } finally {
            setIsLoadingHospitalOverview(false);
        }
    }, [hospitalProfile?.id]);

    useEffect(() => {
        loadHospitalOverview();
    }, [loadHospitalOverview]);

    // Load revenue chart from appointment statistics API
    const loadRevenueChart = useCallback(async () => {
        if (!hospitalProfile?.id) return;

        setIsLoadingRevenueChart(true);
        try {
            // Calculate date range and period based on selected revenue period
            const now = new Date();
            let fromDateStr: string;
            let toDateStr: string;
            let period: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly';
            let displayPeriod: PaymentStatisticsPeriod;

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
                    period = 'Daily';
                    displayPeriod = PaymentStatisticsPeriod.Daily;
                    break;
                }
                case '4weeks': {
                    // Last 4 weeks: 27 days back to today (28 days total)
                    const fourWeeksAgo = new Date(now);
                    fourWeeksAgo.setDate(now.getDate() - 27);
                    fromDateStr = formatLocalDate(fourWeeksAgo);
                    toDateStr = formatLocalDate(now);
                    period = 'Weekly';
                    displayPeriod = PaymentStatisticsPeriod.Weekly;
                    break;
                }
                case '6months': {
                    // Last 6 months: from start of 5 months ago to today
                    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
                    fromDateStr = formatLocalDate(sixMonthsAgo);
                    toDateStr = formatLocalDate(now);
                    period = 'Monthly';
                    displayPeriod = PaymentStatisticsPeriod.Monthly;
                    break;
                }
                case '4quarters': {
                    // Last 4 quarters including current quarter
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
                    period = 'Quarterly';
                    displayPeriod = PaymentStatisticsPeriod.Quarterly;
                    break;
                }
                default: {
                    const defaultFrom = new Date(now);
                    defaultFrom.setDate(now.getDate() - 27);
                    fromDateStr = formatLocalDate(defaultFrom);
                    toDateStr = formatLocalDate(now);
                    period = 'Weekly';
                    displayPeriod = PaymentStatisticsPeriod.Weekly;
                }
            }

            // Call appointment statistics API
            const response = await AppointmentService.getAppointmentStatistics({
                hospitalId: hospitalProfile.id,
                fromDate: fromDateStr,
                toDate: toDateStr,
                period,
            });

            // Convert API response to chart data format with Vietnamese time labels (only revenue)
            const chartData: ChartPoint[] = (response.data?.timeSeries || []).map((item: any) => ({
                label: formatTimeLabel(
                    item.timeLabel,
                    displayPeriod,
                    item.periodStart,
                    item.periodEnd
                ),
                value: item.totalRevenue,
            }));

            setRevenueChartData(chartData);
        } catch (err: any) {
            console.error('Failed to load revenue chart:', err);
            toast.error(`Không thể tải dữ liệu doanh thu: ${err?.message || 'Lỗi không xác định'}`);
            setRevenueChartData([]);
        } finally {
            setIsLoadingRevenueChart(false);
        }
    }, [hospitalProfile?.id, revenuePeriod]);

    useEffect(() => {
        loadRevenueChart();
    }, [loadRevenueChart]);

    const overviewMetrics = useMemo(() => {
        if (!stats) return [];
        return buildAppointmentOverviewMetrics(stats.overview).map((metric) => {
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
        () => buildAppointmentTrendPoints(stats?.appointmentTrend ?? []),
        [stats?.appointmentTrend]
    );

    const newPatientPoints = useMemo<ChartPoint[]>(
        () => buildNewPatientTrendPoints(stats?.newPatientTrend ?? []),
        [stats?.newPatientTrend]
    );

    const hospitalOverviewMetrics = useMemo(() => {
        if (!hospitalOverview) return [];
        return [
            {
                label: 'Số chuyên khoa',
                value: hospitalOverview.specialtiesCount,
                sub: 'Chuyên khoa hiện có',
                className: `${styles.metricCard} ${styles.cardSpecialty}`,
                icon: 'ti ti-stethoscope',
            },
            {
                label: 'Số dịch vụ bác sĩ',
                value: hospitalOverview.serviceTypesCount,
                sub: 'Loại dịch vụ bác sĩ',
                className: `${styles.metricCard} ${styles.cardDoctorServices}`,
                icon: 'ti ti-briefcase',
            },
            {
                label: 'Số bác sĩ',
                value: hospitalOverview.doctorsCount,
                sub: 'Bác sĩ đang hoạt động',
                className: `${styles.metricCard} ${styles.cardDoctors}`,
                icon: 'ti ti-users',
            },
            {
                label: 'Số dịch vụ y tế',
                value: hospitalOverview.serviceMedicalsCount,
                sub: 'Dịch vụ y tế hiện có',
                className: `${styles.metricCard} ${styles.cardMedicalServices}`,
                icon: 'ti ti-medical-cross',
            },
        ];
    }, [hospitalOverview]);

    const reviewMetrics = useMemo(() => {
        if (!reviewStats) return [];
        return [
            {
                label: 'Tổng đánh giá bác sĩ',
                value: reviewStats.doctorTotalReviews,
                sub: `${reviewStats.doctorAverageRating.toFixed(1)}⭐ điểm trung bình`,
                className: `${styles.metricCard} ${styles.cardSpecialty}`,
                icon: 'ti ti-user-star',
            },
            {
                label: 'Điểm trung bình bác sĩ',
                value: reviewStats.doctorAverageRating,
                sub: `${reviewStats.doctorTotalReviews} đánh giá`,
                className: `${styles.metricCard} ${styles.cardDoctorServices}`,
                icon: 'ti ti-star-filled',
                formatDecimal: true,
            },
            {
                label: 'Tổng đánh giá dịch vụ',
                value: reviewStats.serviceTotalReviews,
                sub: `${reviewStats.serviceAverageRating.toFixed(1)}⭐ điểm trung bình`,
                className: `${styles.metricCard} ${styles.cardDoctors}`,
                icon: 'ti ti-star',
            },
            {
                label: 'Điểm trung bình dịch vụ',
                value: reviewStats.serviceAverageRating,
                sub: `${reviewStats.serviceTotalReviews} đánh giá`,
                className: `${styles.metricCard} ${styles.cardMedicalServices}`,
                icon: 'ti ti-star-filled',
                formatDecimal: true,
            },
        ];
    }, [reviewStats]);

    return (
        <div className={`content ${styles.dashboardPage}`} id="hospitalDashboardPage">
            <div className={styles.pageHeader}>
                <h5 className={styles.pageTitle}>Thống kê & báo cáo</h5>
                <p className={styles.pageSubtitle}>
                    <span className={styles.hospitalName}>
                        {hospitalProfile?.name || 'Bệnh viện'}
                    </span>
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

            {isLoading || isLoadingHospitalOverview || isLoadingReviewStats ? (
                <>
                    <div className={styles.trendCard}>
                        <div className={styles.cardHeader}>
                            <h5>Tổng quan bệnh viện</h5>
                            <span>Thông tin tổng hợp</span>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={`${styles.metricsGrid} ${styles.hospitalOverviewGrid}`}>
                                {[1, 2, 3, 4].map((i) => (
                                    <MetricCardSkeleton key={i} />
                                ))}
                            </div>
                        </div>
                    </div>
                    {isLoading && (
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
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <MetricCardSkeleton key={i} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <DashboardTrendCharts
                                period={period}
                                appointmentTrendPoints={[]}
                                newPatientPoints={[]}
                                isLoading={true}
                            />
                        </>
                    )}
                </>
            ) : (
                <>
                    {hospitalOverview && (
                        <div className={styles.trendCard}>
                            <div className={styles.cardHeader}>
                                <h5>Tổng quan bệnh viện</h5>
                                <span>Thông tin tổng hợp</span>
                            </div>
                            <div className={styles.cardBody}>
                                <div
                                    className={`${styles.metricsGrid} ${styles.hospitalOverviewGrid}`}
                                >
                                    {hospitalOverviewMetrics.map((metric) => (
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
                    )}

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
                                <DashboardReviewSection
                                    metrics={reviewMetrics}
                                    reviewStats={reviewStats}
                                    trendCardClassName={styles.trendCard}
                                    cardHeaderClassName={styles.cardHeader}
                                    cardBodyClassName={styles.cardBody}
                                    metricsGridClassName={styles.metricsGrid}
                                    overviewGridClassName={styles.hospitalOverviewGrid}
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
                            )}

                            <DashboardTrendCharts
                                period={period}
                                appointmentTrendPoints={appointmentTrendPoints}
                                newPatientPoints={newPatientPoints}
                                isLoading={false}
                            />
                        </>
                    )}

                    {reviewStats && (
                        <>
                            {reviewStats.doctorChartData.length > 0 && (
                                <div className={styles.trendCard}>
                                    <div className={styles.cardHeader}>
                                        <h5>Đánh giá theo bác sĩ</h5>
                                        <span>Điểm đánh giá và số đánh giá của từng bác sĩ</span>
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
                                        <span>Điểm đánh giá và số đánh giá của từng dịch vụ</span>
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

                    {/* Revenue Chart from Completed Appointments */}
                    {isLoadingRevenueChart ? (
                        <div className={styles.trendCard}>
                            <div className={styles.cardHeader}>
                                <h5>Doanh thu từ lịch hẹn</h5>
                                <span>
                                    Biểu đồ thống kê doanh thu từ các lịch hẹn đã hoàn thành
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
                                        <h5>Doanh thu từ lịch hẹn</h5>
                                        <span>
                                            Biểu đồ thống kê doanh thu từ các lịch hẹn đã hoàn thành
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
                                        color="#a78bfa"
                                        label="Tổng doanh thu"
                                    />
                                </div>
                            </div>
                        )
                    )}

                    {!stats && !hospitalOverview && (
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
