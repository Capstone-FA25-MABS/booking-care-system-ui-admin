import React from 'react';
import StatusBadge, { StatusBadgeProps } from '@/components/StatusBadge/StatusBadge';
import { HospitalSubscription } from '@/services/subscription.service';

interface SubscriptionHistoryItemProps {
    subscription: HospitalSubscription;
    formatDate: (date: string) => string;
    formatPrice: (price: number) => string;
    getBillingCycleText: (cycle: string) => string;
    getStatusColor: (status: string) => StatusBadgeProps['variant'];
    getStatusText: (status: string) => string;
    priceFormatter?: (
        price: number | null | undefined,
        billingCycle: string,
        helpers: {
            formatPrice: (price: number) => string;
            getBillingCycleText: (cycle: string) => string;
        }
    ) => React.ReactNode;
}

const SubscriptionHistoryItem: React.FC<SubscriptionHistoryItemProps> = ({
    subscription,
    formatDate,
    formatPrice,
    getBillingCycleText,
    getStatusColor,
    getStatusText,
    priceFormatter,
}) => {
    const isActive = subscription.status === 'ACTIVE';
    const planName = subscription.subscriptionPlan?.name || 'Không xác định';
    const planPrice = subscription.subscriptionPlan?.price;
    const billingCycle = subscription.subscriptionPlan?.billingCycle || '';

    const defaultPriceContent =
        planPrice !== null && planPrice !== undefined
            ? `${formatPrice(planPrice)} / ${getBillingCycleText(billingCycle)}`
            : 'N/A';

    const priceContent =
        priceFormatter?.(planPrice, billingCycle, { formatPrice, getBillingCycleText }) ??
        defaultPriceContent;

    return (
        <div
            key={subscription.hospitalSubscriptionId}
            className="p-2 bg-light rounded border-start border-primary border-3"
        >
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="fw-semibold">
                    {planName}
                    {isActive && <span className="badge bg-success ms-2 fs-11">(Hiện tại)</span>}
                </div>
                <StatusBadge
                    status={subscription.status}
                    variant={getStatusColor(subscription.status)}
                    customText={getStatusText(subscription.status)}
                />
            </div>
            <div className="row g-2 small">
                <div className="col-md-3">
                    <strong>Giá:</strong> {priceContent}
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

export default SubscriptionHistoryItem;
