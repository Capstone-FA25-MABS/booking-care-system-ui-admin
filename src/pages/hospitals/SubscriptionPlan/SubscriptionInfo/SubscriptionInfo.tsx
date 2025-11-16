import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { useCurrentUserProfile } from '@/hooks/useCurrentUserProfile';
import { HospitalSubscription } from '@/services/subscription.service';
import StatusBadge from '@/components/StatusBadge';
import Button from '@/components/Button';
import styles from './SubscriptionInfo.module.scss';

interface UsageProgressBarProps {
    label: string;
    current: number;
    max: number | null;
    isExceeded: boolean;
    percentage: number;
    icon?: string;
}

const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
    label,
    current,
    max,
    isExceeded,
    percentage,
    icon = 'ti ti-users',
}) => {
    // Xử lý unlimited: null, undefined, -1 (từ gRPC), hoặc int.MaxValue (2147483647) để tương thích ngược
    const isUnlimited =
        max === null ||
        max === undefined ||
        max === -1 ||
        max === Number.MAX_SAFE_INTEGER ||
        max === 2147483647;
    const displayPercentage = Math.min(percentage, 100);
    const displayCurrent = current.toFixed(0);
    const displayMaxFormatted = isUnlimited ? '∞' : max.toFixed(0);

    const getDescription = () => {
        if (label === 'Bác sĩ') return 'Số lượng bác sĩ đã đăng ký trong gói hiện tại.';
        if (label === 'Chuyên khoa') return 'Số lượng chuyên khoa đã đăng ký trong gói hiện tại.';
        if (label === 'Dịch vụ y tế') return 'Số lượng dịch vụ y tế đã đăng ký trong gói hiện tại.';
        if (label === 'Lịch hẹn') return 'Số lượng lịch hẹn đã được tạo trong gói hiện tại.';
        return '';
    };

    const getContainerClass = () => {
        if (isUnlimited) return `${styles.progressBarContainer} ${styles.unlimited}`;
        if (isExceeded) return `${styles.progressBarContainer} ${styles.exceeded}`;
        if (percentage >= 90) return `${styles.progressBarContainer} ${styles.warning}`;
        return `${styles.progressBarContainer} ${styles.normal}`;
    };

    return (
        <div className={getContainerClass()}>
            <div className={styles.progressBarLabel}>
                <label>
                    <i className={icon}></i>
                    {label}
                </label>
            </div>
            <div className={styles.usageDisplay}>
                {isUnlimited ? (
                    <span className={styles.unlimitedText}>Không giới hạn</span>
                ) : (
                    <span>
                        {displayCurrent} / {displayMaxFormatted} đã sử dụng
                    </span>
                )}
            </div>
            <div className={styles.usageDescription}>{getDescription()}</div>
            <div className={styles.usageRemaining}>
                <span className={styles.remainingAmount}>
                    {isUnlimited ? (
                        <span className={styles.unlimitedText}></span>
                    ) : (
                        <>Còn lại: {(max - current).toFixed(0)}</>
                    )}
                </span>
                {!isUnlimited && (
                    <span className={styles.usageSince}>
                        {displayPercentage.toFixed(1)}% đã sử dụng
                    </span>
                )}
            </div>
            {!isUnlimited && (
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressBarFill}
                        role="progressbar"
                        style={{
                            width: `${Math.min(displayPercentage, 100)}%`,
                            background: isExceeded ? '#ef4444' : '#2E37A4',
                        }}
                        aria-valuenow={displayPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    ></div>
                </div>
            )}
            {isExceeded && (
                <div className={styles.limitExceededAlert}>
                    <i className="ti ti-alert-circle"></i>
                    <span>
                        Đã đạt giới hạn sử dụng. Để tiếp tục sử dụng, vui lòng nâng cấp gói của bạn.
                    </span>
                </div>
            )}
            {percentage >= 90 && !isExceeded && (
                <small className={styles.alertText} style={{ color: '#666' }}>
                    Sắp đạt giới hạn gói đăng ký.
                </small>
            )}
        </div>
    );
};

const SubscriptionInfo: React.FC = () => {
    const navigate = useNavigate();
    const { profile, hospitalProfile } = useCurrentUserProfile();
    const hospitalId = hospitalProfile?.id || (profile as any)?.id;

    const {
        hospitalSubscriptions,
        usageData,
        loading,
        error,
        loadHospitalSubscriptions,
        loadUsageData,
    } = useSubscription();

    const [activeSubscription, setActiveSubscription] = useState<HospitalSubscription | null>(null);
    const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);

    useEffect(() => {
        if (hospitalId) {
            // Load tất cả subscriptions (bao gồm cả active) - chỉ gọi một lần để tránh race condition
            const loadData = async () => {
                setIsLoadingSubscriptions(true);
                try {
                    await Promise.all([
                        loadHospitalSubscriptions(hospitalId),
                        loadUsageData(hospitalId),
                    ]);
                } finally {
                    setIsLoadingSubscriptions(false);
                }
            };
            loadData();
        }
    }, [hospitalId, loadHospitalSubscriptions, loadUsageData]);

    useEffect(() => {
        if (hospitalSubscriptions && hospitalSubscriptions.length > 0) {
            // Find active subscription - sắp xếp để đảm bảo active luôn được ưu tiên
            const sorted = [...hospitalSubscriptions].sort((a, b) => {
                const aIsActive =
                    a.status === 'ACTIVE' ||
                    (a.status === 'TRIAL' && new Date(a.endDate) > new Date());
                const bIsActive =
                    b.status === 'ACTIVE' ||
                    (b.status === 'TRIAL' && new Date(b.endDate) > new Date());
                if (aIsActive && !bIsActive) return -1;
                if (!aIsActive && bIsActive) return 1;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            const active = sorted.find(
                (sub) =>
                    sub.status === 'ACTIVE' ||
                    (sub.status === 'TRIAL' && new Date(sub.endDate) > new Date())
            );
            setActiveSubscription(active || sorted[0]);
        } else if (
            hospitalSubscriptions &&
            hospitalSubscriptions.length === 0 &&
            !isLoadingSubscriptions
        ) {
            // Chỉ set null khi đã load xong và không có subscription
            setActiveSubscription(null);
        }
    }, [hospitalSubscriptions]);

    if (loading) {
        return (
            <div className={`content ${styles.subscriptionInfoPage}`}>
                <div className={styles.contentWrapper}>
                    <div className={styles.loadingContainer}>
                        <div
                            className="spinner-border text-primary"
                            role="status"
                            style={{ width: '3rem', height: '3rem' }}
                        >
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`content ${styles.subscriptionInfoPage}`}>
                <div className={styles.contentWrapper}>
                    <div className={styles.errorContainer} role="alert">
                        <i className="ti ti-alert-circle me-2"></i>
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatPrice = (price: number) => {
        return price.toLocaleString('vi-VN') + ' VNĐ';
    };

    const getBillingCycleText = (cycle: string) => {
        switch (cycle) {
            case 'MONTHLY':
                return 'Tháng';
            case 'QUARTERLY':
                return 'Quý';
            case 'YEARLY':
                return 'Năm';
            default:
                return cycle;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'success';
            case 'TRIAL':
                return 'info';
            case 'EXPIRED':
                return 'danger';
            case 'CANCELLED':
                return 'danger';
            case 'PENDING':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang hoạt động';
            case 'TRIAL':
                return 'Dùng thử';
            case 'EXPIRED':
                return 'Đã hết hạn';
            case 'CANCELLED':
                return 'Đã hủy';
            case 'PENDING':
                return 'Chờ xử lý';
            default:
                return status;
        }
    };

    const renderSubscriptionHistoryItem = (subscription: HospitalSubscription) => {
        const isActive = subscription.status === 'ACTIVE';
        const planName = subscription.subscriptionPlan?.name || 'Không xác định';
        const planPrice = subscription.subscriptionPlan?.price;
        const billingCycle = subscription.subscriptionPlan?.billingCycle || '';

        return (
            <div
                key={subscription.hospitalSubscriptionId}
                className="p-2 bg-light rounded border-start border-primary border-3"
            >
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="fw-semibold">
                        {planName}
                        {isActive && (
                            <span className="badge bg-success ms-2 fs-11">(Hiện tại)</span>
                        )}
                    </div>
                    <StatusBadge
                        status={subscription.status}
                        variant={getStatusColor(subscription.status)}
                        customText={getStatusText(subscription.status)}
                    />
                </div>
                <div className="row g-2 small">
                    <div className="col-md-3">
                        <strong>Giá:</strong>{' '}
                        {planPrice !== null && planPrice !== undefined && planPrice > 0
                            ? formatPrice(planPrice) + ' / ' + getBillingCycleText(billingCycle)
                            : '0 VNĐ'}
                    </div>
                    <div className="col-md-3">
                        <strong>Bắt đầu:</strong>{' '}
                        <span className="badge badge-soft-info fs-12">
                            {formatDate(subscription.startDate)}
                        </span>
                    </div>
                    <div className="col-md-3">
                        <strong>Hết hạn:</strong>{' '}
                        <span className="badge badge-soft-warning fs-12">
                            {formatDate(subscription.endDate)}
                        </span>
                    </div>
                    <div className="col-md-3">
                        <strong>Đăng ký:</strong>{' '}
                        <span className="badge badge-soft-secondary fs-12">
                            {formatDate(subscription.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={`content ${styles.subscriptionInfoPage}`}>
            <div className={styles.contentWrapper}>
                {/* Header */}
                <div className={styles.headerSection}>
                    <h4>Thông tin gói đăng ký</h4>
                    <p className="text-muted mt-2 mb-0">
                        Xem thông tin chi tiết về gói đăng ký và mức sử dụng của bệnh viện
                    </p>
                </div>

                <div className="row">
                    {/* Left Column: Subscription Info */}
                    <div className="col-md-4">
                        {activeSubscription ? (
                            <div className={styles.subscriptionCard}>
                                <div className={styles.cardHeader}>
                                    <h5>
                                        <i className="ti ti-package me-2"></i>
                                        Gói đăng ký hiện tại
                                    </h5>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.infoItem}>
                                        <small>Tên gói</small>
                                        <h4>
                                            {activeSubscription.subscriptionPlan?.name || 'N/A'}
                                        </h4>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <small>Chu kỳ thanh toán</small>
                                        <span
                                            className="badge"
                                            style={{ background: '#2E37A4', color: 'white' }}
                                        >
                                            {activeSubscription.subscriptionPlan?.billingCycle ===
                                                'MONTHLY' && 'Hàng tháng'}
                                            {activeSubscription.subscriptionPlan?.billingCycle ===
                                                'QUARTERLY' && 'Hàng quý'}
                                            {activeSubscription.subscriptionPlan?.billingCycle ===
                                                'YEARLY' && 'Hàng năm'}
                                        </span>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <small>Giá</small>
                                        <h5 style={{ color: '#2E37A4' }}>
                                            {activeSubscription.subscriptionPlan?.price &&
                                            activeSubscription.subscriptionPlan.price > 0
                                                ? formatPrice(
                                                      activeSubscription.subscriptionPlan.price
                                                  )
                                                : '0'}{' '}
                                            VNĐ
                                        </h5>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <small>Thời hạn</small>
                                        <div className={styles.dateRow}>
                                            <span className="badge badge-soft-info fs-12 me-2">
                                                {formatDate(activeSubscription.startDate)}
                                            </span>
                                            <span className="text-muted me-2">-</span>
                                            <span className="badge badge-soft-warning fs-12">
                                                {formatDate(activeSubscription.endDate)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className={styles.infoItem}>
                                        <small>Trạng thái</small>
                                        <StatusBadge
                                            status={activeSubscription.status}
                                            variant={getStatusColor(activeSubscription.status)}
                                            customText={getStatusText(activeSubscription.status)}
                                        />
                                    </div>

                                    {/* Features */}
                                    {activeSubscription.subscriptionPlan?.features &&
                                        (() => {
                                            try {
                                                const features = JSON.parse(
                                                    activeSubscription.subscriptionPlan.features
                                                );
                                                if (
                                                    Array.isArray(features) &&
                                                    features.length > 0
                                                ) {
                                                    return (
                                                        <div className={styles.infoItem}>
                                                            <small>Tính năng</small>
                                                            <ul className={styles.featuresList}>
                                                                {features.map(
                                                                    (
                                                                        feature: any,
                                                                        index: number
                                                                    ) => (
                                                                        <li key={index}>
                                                                            <i className="ti ti-check text-success me-2"></i>
                                                                            <span>
                                                                                {feature.text ||
                                                                                    feature}
                                                                            </span>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </div>
                                                    );
                                                }
                                            } catch (e) {
                                                console.error('Error parsing features:', e);
                                            }
                                            return null;
                                        })()}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.subscriptionCard}>
                                <div className={styles.cardHeader}>
                                    <h5>
                                        <i className="ti ti-package me-2"></i>
                                        Gói đăng ký hiện tại
                                    </h5>
                                </div>
                                <div className={styles.cardBody}>
                                    <div className={styles.emptyState}>
                                        <i className="ti ti-package-off"></i>
                                        <p>Chưa có gói đăng ký</p>
                                        <button
                                            className={styles.upgradeButton}
                                            onClick={() => navigate('/hospitals/subscription-plan')}
                                        >
                                            Đăng ký ngay
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Usage Information */}
                    <div className="col-md-8">
                        <div className={styles.usageCard}>
                            <div className={styles.usageHeader}>
                                <h5>Sử dụng gói đăng ký</h5>
                            </div>
                            <div className={styles.cardBody}>
                                {usageData && usageData.hasActiveSubscription ? (
                                    <>
                                        {/* Doctor Usage */}
                                        <UsageProgressBar
                                            label="Bác sĩ"
                                            current={usageData.currentDoctorCount}
                                            max={usageData.maxDoctors ?? null}
                                            isExceeded={usageData.isDoctorLimitExceeded ?? false}
                                            percentage={usageData.doctorUsagePercentage ?? 0}
                                            icon="ti ti-user"
                                        />

                                        {/* Specialty Usage */}
                                        <UsageProgressBar
                                            label="Chuyên khoa"
                                            current={usageData.currentSpecialtyCount}
                                            max={usageData.maxSpecialties ?? null}
                                            isExceeded={usageData.isSpecialtyLimitExceeded ?? false}
                                            percentage={usageData.specialtyUsagePercentage ?? 0}
                                            icon="ti ti-stethoscope"
                                        />

                                        {/* Service Usage */}
                                        <UsageProgressBar
                                            label="Dịch vụ y tế"
                                            current={usageData.currentServiceCount}
                                            max={usageData.maxServices ?? null}
                                            isExceeded={usageData.isServiceLimitExceeded ?? false}
                                            percentage={usageData.serviceUsagePercentage ?? 0}
                                            icon="ti ti-medical-cross"
                                        />

                                        {/* Appointment Usage */}
                                        <UsageProgressBar
                                            label="Lịch hẹn"
                                            current={usageData.currentAppointmentCount}
                                            max={usageData.maxAppointments ?? null}
                                            isExceeded={
                                                usageData.isAppointmentLimitExceeded ?? false
                                            }
                                            percentage={usageData.appointmentUsagePercentage ?? 0}
                                            icon="ti ti-calendar-event"
                                        />
                                    </>
                                ) : (
                                    <div className={styles.emptyState}>
                                        <i className="ti ti-chart-bar-off"></i>
                                        <p>{usageData?.message || 'Không có dữ liệu sử dụng'}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upgrade Information */}
                {usageData && usageData.hasActiveSubscription && (
                    <div className={styles.upgradeCard}>
                        <div className={styles.cardBody}>
                            <p className={styles.upgradeText}>
                                Khi đạt đến giới hạn sử dụng, bạn vẫn có thể tiếp tục sử dụng các
                                tính năng cơ bản. Để tiếp tục sử dụng các tính năng cao cấp, vui
                                lòng nâng cấp gói của bạn.
                            </p>
                            <Button
                                variant="outline-primary"
                                onClick={() => navigate('/hospitals/subscription-plan')}
                                icon="ti ti-arrow-up-circle"
                                iconPosition="left"
                            >
                                Nâng cấp gói
                            </Button>
                        </div>
                    </div>
                )}

                {/* Subscription History */}
                {hospitalSubscriptions && hospitalSubscriptions.length > 0 && (
                    <div className="mt-4">
                        <div className="p-3 bg-white rounded border">
                            <h6 className="fw-bold mb-3 pb-2 border-bottom">
                                Lịch sử đăng ký/nâng cấp gói
                            </h6>
                            <div className="d-flex flex-column gap-2">
                                {[...hospitalSubscriptions]
                                    .sort(
                                        (a, b) =>
                                            new Date(b.createdAt).getTime() -
                                            new Date(a.createdAt).getTime()
                                    )
                                    .map(renderSubscriptionHistoryItem)}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SubscriptionInfo;
