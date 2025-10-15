import React, { useMemo } from 'react';

export interface StatusBadgeProps {
    status: string;
    className?: string;
    customText?: string;
    variant?:
        | 'primary'
        | 'secondary'
        | 'success'
        | 'danger'
        | 'warning'
        | 'info'
        | 'light'
        | 'dark';
}

type StatusKey =
    | 'ACTIVE'
    | 'INACTIVE'
    | 'PENDING'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'SCHEDULED'
    | 'CONFIRMED';

interface StatusConfig {
    className: string;
    text: string;
}

interface VariantConfig {
    className: string;
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
    CONFIRMED: {
        className: 'badge-soft-success text-success',
        text: 'Đã xác nhận',
    },
};

const VARIANT_CONFIG: Record<string, VariantConfig> = {
    primary: {
        className: 'badge-soft-primary text-primary',
    },
    secondary: {
        className: 'badge-soft-secondary text-secondary',
    },
    success: {
        className: 'badge-soft-success text-success',
    },
    danger: {
        className: 'badge-soft-danger text-danger',
    },
    warning: {
        className: 'badge-soft-warning text-warning',
    },
    info: {
        className: 'badge-soft-info text-info',
    },
    light: {
        className: 'badge-soft-light text-light',
    },
    dark: {
        className: 'badge-soft-dark text-dark',
    },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    className = '',
    customText,
    variant,
}) => {
    const badgeConfig = useMemo(() => {
        // If variant is provided, use variant config
        if (variant && VARIANT_CONFIG[variant]) {
            return {
                className: VARIANT_CONFIG[variant].className,
                text: customText || status,
            };
        }

        // Otherwise use status config
        const key = status.toUpperCase() as StatusKey;
        return (
            STATUS_CONFIG[key] || {
                className: 'badge-soft-secondary text-secondary border border-secondary',
                text: customText || status,
            }
        );
    }, [status, customText, variant]);

    return (
        <span
            className={`fs-13 badge rounded fw-medium ${badgeConfig.className} ${className}`}
            style={{ padding: '0.25rem 0.5rem' }}
        >
            {badgeConfig.text}
        </span>
    );
};

export default StatusBadge;
