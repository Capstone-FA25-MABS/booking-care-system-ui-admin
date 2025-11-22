import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import Select from 'react-select';
import FilterDatePicker from './components/FilterDatePicker';
import styles from './Dashboard.module.scss';
import { RootState } from '@/store';
import ActionDropdown from '@/components/ActionDropdown';
import { selectCustomStyles } from '@/constants/select.styles';
import AppointmentService from '@/services/appointment.service';
import { DoctorService } from '@/services/doctor.service';
import { HospitalService } from '@/services/hospital.service';
import ReviewService from '@/services/review.service';
import { serviceService } from '@/services/service.service';
import { StatisticsPeriod, StaffHospitalStatisticsResponse } from '@/types/statistics.types';
import { MetricCard, MetricCardSkeleton } from './components/MetricCard';
import { ChartJsLine, ChartSkeleton } from './components/ChartJsLine';
import { ChartJsMultiLine } from './components/ChartJsLine/ChartJsMultiLine';

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
    const date = typeof value === 'string' ? new Date(value) : value;
    return format(date, 'dd/MM/yyyy');
};

const formatTrendLabel = (periodStart: string, periodEnd: string): string => {
    try {
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);
        const startFormatted = format(startDate, 'dd/MM/yyyy');
        const endFormatted = format(endDate, 'dd/MM/yyyy');

        // Nếu cùng một ngày, chỉ hiển thị một ngày
        if (startFormatted === endFormatted) {
            return startFormatted;
        }

        // Hiển thị khoảng thời gian
        return `${startFormatted} - ${endFormatted}`;
    } catch {
        // Fallback nếu parse date thất bại
        return `${periodStart} - ${periodEnd}`;
    }
};

type ChartPoint = { label: string; value: number };

const HospitalDashboard: React.FC = () => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const [period, setPeriod] = useState<StatisticsPeriod>(StatisticsPeriod.Weekly);
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
        const end = new Date();
        return {
            end,
            start: subDays(end, 29),
        };
    });

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

    const isoRange = useMemo(() => {
        const start = dateRange.start ? startOfDay(dateRange.start).toISOString() : undefined;
        const end = dateRange.end ? endOfDay(dateRange.end).toISOString() : undefined;
        return { fromDate: start, toDate: end };
    }, [dateRange]);

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

            // Tính tổng số reviews và điểm trung bình cho doctors
            let doctorTotalReviews = 0;
            let doctorRatingSum = 0;
            let doctorReviewCount = 0;

            Object.values(doctorsStats).forEach((stat: any) => {
                if (stat.totalReviews > 0) {
                    doctorTotalReviews += stat.totalReviews;
                    doctorRatingSum += stat.averageRating * stat.totalReviews;
                    doctorReviewCount += stat.totalReviews;
                }
            });

            const doctorAverageRating =
                doctorReviewCount > 0 ? doctorRatingSum / doctorReviewCount : 0;

            // Tính tổng số reviews và điểm trung bình cho services
            let serviceTotalReviews = 0;
            let serviceRatingSum = 0;
            let serviceReviewCount = 0;

            Object.values(servicesStats).forEach((stat: any) => {
                if (stat.totalReviews > 0) {
                    serviceTotalReviews += stat.totalReviews;
                    serviceRatingSum += stat.averageRating * stat.totalReviews;
                    serviceReviewCount += stat.totalReviews;
                }
            });

            const serviceAverageRating =
                serviceReviewCount > 0 ? serviceRatingSum / serviceReviewCount : 0;

            // Tìm top doctors (top 5)
            const topDoctors = doctors
                .map((doctor: any) => {
                    const stat = (doctorsStats as Record<string, any>)[doctor.id];
                    return {
                        id: doctor.id,
                        name:
                            `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Bác sĩ',
                        rating: stat?.averageRating || 0,
                        reviews: stat?.totalReviews || 0,
                    };
                })
                .filter((d: any) => d.reviews > 0)
                .sort((a: any, b: any) => {
                    // Sắp xếp theo rating, sau đó theo số reviews
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return b.reviews - a.reviews;
                })
                .slice(0, 5);

            // Tìm top services (top 5)
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
                    // Sắp xếp theo rating, sau đó theo số reviews
                    if (b.rating !== a.rating) return b.rating - a.rating;
                    return b.reviews - a.reviews;
                })
                .slice(0, 5);

            // Tạo dữ liệu biểu đồ cho doctors (top 10) với rating và số cuộc hẹn
            // Số cuộc hẹn = số reviews (tạm thời, có thể cải thiện bằng cách query appointment statistics)
            const doctorChartData = doctors
                .map((doctor: any) => {
                    const stat = (doctorsStats as Record<string, any>)[doctor.id];
                    return {
                        label:
                            `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Bác sĩ',
                        rating: stat?.averageRating || 0,
                        appointments: stat?.totalReviews || 0, // Sử dụng số reviews làm proxy cho số cuộc hẹn
                    };
                })
                .filter((d: any) => d.rating > 0)
                .sort((a: any, b: any) => b.rating - a.rating)
                .slice(0, 10)
                .map((d: any) => ({
                    label: d.label,
                    value1: d.rating,
                    value2: d.appointments,
                }));

            // Tạo dữ liệu biểu đồ cho services (top 10) với rating và số reviews
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

            setReviewStats({
                doctorTotalReviews,
                doctorAverageRating,
                serviceTotalReviews,
                serviceAverageRating,
                topDoctors,
                topServices,
                doctorChartData,
                serviceChartData,
            });
        } catch (err: any) {
            console.error('Failed to load review statistics:', err);
            setReviewStats(null);
        } finally {
            setIsLoadingReviewStats(false);
        }
    }, [hospitalProfile?.id, hospitalProfile?.serviceMedicals]);

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
        const { overview } = stats;
        return [
            {
                label: 'Tổng lịch hẹn',
                value: overview.totalAppointments,
                sub: `${formatPercent(overview.noShowRate)} vắng/huỷ`,
                className: `${styles.metricCard} ${styles.total}`,
                icon: 'ti ti-calendar-event',
            },
            {
                label: 'Hoàn thành',
                value: overview.completedAppointments,
                sub: `${numberFormatter.format(overview.confirmedAppointments)} đã xác nhận`,
                className: `${styles.metricCard} ${styles.completed}`,
                icon: 'ti ti-circle-check',
            },
            {
                label: 'Đang chờ',
                value: overview.pendingAppointments,
                sub: `${numberFormatter.format(overview.rescheduledAppointments)} đã đổi lịch`,
                className: `${styles.metricCard} ${styles.pending}`,
                icon: 'ti ti-clock-hour-4',
            },
            {
                label: 'Huỷ / Vắng',
                value: overview.cancelledAppointments,
                sub: `Tỷ lệ vắng: ${formatPercent(overview.noShowRate)}`,
                className: `${styles.metricCard} ${styles.cancelled}`,
                icon: 'ti ti-circle-x',
            },
            {
                label: 'Bệnh nhân mới',
                value: overview.newPatients,
                sub: `Tỷ lệ đổi lịch: ${formatPercent(overview.rescheduleRate)}`,
                className: `${styles.metricCard} ${styles.newPatients}`,
                icon: 'ti ti-user-plus',
            },
        ];
    }, [stats]);

    const appointmentTrendPoints = useMemo<ChartPoint[]>(() => {
        if (!stats) return [];
        return stats.appointmentTrend.map((point) => ({
            label: formatTrendLabel(point.periodStart, point.periodEnd),
            value: point.totalAppointments,
        }));
    }, [stats]);

    const newPatientPoints = useMemo<ChartPoint[]>(() => {
        if (!stats) return [];
        return stats.newPatientTrend.map((point) => ({
            label: formatTrendLabel(point.periodStart, point.periodEnd),
            value: point.newPatients,
        }));
    }, [stats]);

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

    if (!hospitalProfile?.id) {
        return (
            <div className="content">
                <div className="alert alert-warning" role="alert">
                    <i className="ti ti-alert-triangle me-2" />
                    Không tìm thấy thông tin bệnh viện. Vui lòng đăng nhập lại.
                </div>
            </div>
        );
    }

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

            <div className={`card shadow-sm mb-4 ${styles.filtersCard}`}>
                <div className="card-body">
                    <div className={styles.filtersHeader}>
                        <div className={styles.filtersRow}>
                            <div className={styles.filterControl}>
                                <label>Từ ngày</label>
                                <FilterDatePicker
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
                                <label>Đến ngày</label>
                                <FilterDatePicker
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
                                <label>Chu kỳ thống kê</label>
                                <Select
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
                                <>
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
                                                        formatDecimal={
                                                            (metric as any).formatDecimal
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

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
                                </>
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
                            <i className="ti ti-database-search mb-2 fs-4 d-block" />
                            Chưa có dữ liệu thống kê. Vui lòng điều chỉnh bộ lọc hoặc thử lại sau.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HospitalDashboard;
