import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import styles from './Dashboard.module.scss';
import { RootState } from '@/store';
import AppointmentService from '@/services/appointment.service';
import { DoctorService } from '@/services/doctor.service';
import { HospitalService } from '@/services/hospital.service';
import ReviewService from '@/services/review.service';
import { serviceService } from '@/services/service.service';
import { StatisticsPeriod, StaffHospitalStatisticsResponse } from '@/types/statistics.types';
import { MetricCard, MetricCardSkeleton } from '@/components/MetricCard';
import { ChartJsMultiLine } from '@/components/ChartJsLine';
import { DashboardFilters } from '@/components/DashboardFilters';
import { DashboardTrendCharts } from '@/components/DashboardTrendCharts';
import DashboardOverviewMetrics from '@/components/DashboardOverviewMetrics';
import DashboardReviewStats from '@/components/DashboardReviewStats';
import DashboardTopRankings from '@/components/DashboardTopRankings/DashboardTopRankings';
import { useDashboardDateRange } from '@/hooks/useDashboardDateRange';
import { periodOptions, formatDateDisplay } from '@/utils/dashboard.utils';
import { buildDoctorReviewInsights, buildServiceReviewInsights } from '@/utils/reviewStats';
import { AppointmentMetricKey, buildAppointmentOverviewMetrics } from '@/utils/appointmentMetrics';
import {
    buildAppointmentTrendPoints,
    buildNewPatientTrendPoints,
    ChartPoint,
} from '@/utils/dashboardChartData';

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
    const [reviewStats, setReviewStats] = useState<{
        doctorTotalReviews: number;
        doctorAverageRating: number;
        serviceTotalReviews: number;
        serviceAverageRating: number;
        topDoctors: Array<{ id: string; name: string; rating: number; reviews: number }>;
        topServices: Array<{ id: string; name: string; rating: number; reviews: number }>;
        doctorChartData: Array<{ label: string; value1: number; value2: number }>;
        serviceChartData: Array<{ label: string; value1: number; value2: number }>;
    } | null>(null);
    const [isLoadingReviewStats, setIsLoadingReviewStats] = useState(false);

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
            const [specialtiesRes, serviceTypesRes, doctorsRes, servicesRes] = await Promise.all([
                HospitalService.getHospitalSpecialtyIds(hospitalProfile.id).catch(() => ({
                    data: [],
                })),
                HospitalService.getHospitalServiceTypeIds(hospitalProfile.id).catch(() => ({
                    data: [],
                })),
                DoctorService.getDoctorsByHospital(hospitalProfile.id, 1, 1).catch(() => ({
                    data: { totalCount: 0 },
                })),
                serviceService
                    .getServicesByHospital(hospitalProfile.id)
                    .catch(() => ({ data: [] })),
            ]);

            const specialtiesCount =
                specialtiesRes.data?.length ?? hospitalProfile.specialties?.length ?? 0;
            const serviceTypesCount =
                serviceTypesRes.data?.length ?? hospitalProfile.serviceTypes?.length ?? 0;
            const doctorsCount = doctorsRes.data?.totalCount ?? 0;
            const serviceMedicalsCount = servicesRes.data?.length ?? 0;

            setHospitalOverview({
                specialtiesCount,
                serviceTypesCount,
                doctorsCount,
                serviceMedicalsCount,
            });
        } catch (err: any) {
            console.error('Failed to load hospital overview:', err);
            // Fallback to hospitalProfile data
            setHospitalOverview({
                specialtiesCount: hospitalProfile.specialties?.length ?? 0,
                serviceTypesCount: hospitalProfile.serviceTypes?.length ?? 0,
                doctorsCount: 0,
                serviceMedicalsCount: 0,
            });
        } finally {
            setIsLoadingHospitalOverview(false);
        }
    }, [hospitalProfile?.id, hospitalProfile?.specialties, hospitalProfile?.serviceTypes]);

    useEffect(() => {
        loadHospitalOverview();
    }, [loadHospitalOverview]);

    const loadReviewStatistics = useCallback(async () => {
        if (!hospitalProfile?.id) return;

        setIsLoadingReviewStats(true);
        try {
            // Lấy danh sách doctors và services của hospital
            const [doctorsRes, servicesRes] = await Promise.all([
                DoctorService.getDoctorsByHospital(hospitalProfile.id, 1, 1000).catch(() => ({
                    data: { doctors: [], totalCount: 0 },
                })),
                serviceService.getServicesByHospital(hospitalProfile.id).catch(() => ({
                    data: [],
                })),
            ]);

            const doctors = doctorsRes.data?.doctors || [];
            // servicesRes is ApiResponse<Service[]>, so servicesRes.data is Service[]
            const services = Array.isArray(servicesRes.data) ? servicesRes.data : [];

            // Lấy statistics cho doctors và services
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

            const doctorsStats = doctorsStatsRes.data?.doctorStatistics || {};
            const servicesStats = servicesStatsRes.data?.serviceStatistics || {};

            const doctorInsights = buildDoctorReviewInsights(doctors, doctorsStats);
            const serviceInsights = buildServiceReviewInsights(services, servicesStats);

            setReviewStats({
                doctorTotalReviews: doctorInsights.totalReviews,
                doctorAverageRating: doctorInsights.averageRating,
                serviceTotalReviews: serviceInsights.totalReviews,
                serviceAverageRating: serviceInsights.averageRating,
                topDoctors: doctorInsights.topEntities,
                topServices: serviceInsights.topEntities,
                doctorChartData: doctorInsights.chartData,
                serviceChartData: serviceInsights.chartData,
            });
        } catch (err: any) {
            console.error('Failed to load review statistics:', err);
            setReviewStats(null);
        } finally {
            setIsLoadingReviewStats(false);
        }
    }, [hospitalProfile?.id]);

    useEffect(() => {
        loadReviewStatistics();
    }, [loadReviewStatistics]);

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
                                <>
                                    <DashboardReviewStats
                                        metrics={reviewMetrics}
                                        trendCardClassName={styles.trendCard}
                                        cardHeaderClassName={styles.cardHeader}
                                        cardBodyClassName={styles.cardBody}
                                        metricsGridClassName={styles.metricsGrid}
                                        hospitalOverviewGridClassName={styles.hospitalOverviewGrid}
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
                                </>
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
                                        <span>Điểm đánh giá và số cuộc hẹn của từng bác sĩ</span>
                                    </div>
                                    <div className={styles.cardBody}>
                                        <ChartJsMultiLine
                                            data={reviewStats.doctorChartData}
                                            color1="#8b5cf6"
                                            color2="#10b981"
                                            label1="Điểm đánh giá"
                                            label2="Số cuộc hẹn"
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
