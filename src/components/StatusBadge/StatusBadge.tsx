import React, { useMemo } from 'react';

export interface StatusBadgeProps {
    status: string;
    className?: string;
}

type StatusKey =
    | 'ACTIVE'
    | 'INACTIVE'
    | 'PENDING'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'SCHEDULED'
    | 'UPCOMING';

interface StatusConfig {
    className: string;
    text: string;
}

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
    ACTIVE: {
        className: 'badge-soft-success text-success',
        text: 'Hoạt động',
    },
    INACTIVE: {
        className: 'badge-soft-danger text-danger',
        text: 'Không hoạt động',
    },
    PENDING: {
        className: 'badge-soft-warning text-warning',
        text: 'Đang xử lí',
    },
    COMPLETED: {
        className: 'badge-soft-primary text-primary',
        text: 'Hoàn thành',
    },
    CANCELLED: {
        className: 'badge-soft-danger text-danger',
        text: 'Đã hủy',
    },
    SCHEDULED: {
        className: 'badge-soft-info text-info',
        text: 'Đã đặt lịch',
    },
    UPCOMING: {
        className: 'badge-soft-secondary text-secondary',
        text: 'Sắp tới',
    },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const statusConfig = useMemo<StatusConfig>(() => {
        const key = status.toUpperCase() as StatusKey;
        return (
            STATUS_CONFIG[key] || {
                className: 'badge-soft-secondary text-secondary border border-secondary',
                text: status,
            }
        );
    }, [status]);

    return (
        <span className={`fs-13 badge rounded fw-medium ${statusConfig.className} ${className}`}>
            {statusConfig.text}
        </span>
    );
};

export default StatusBadge;
