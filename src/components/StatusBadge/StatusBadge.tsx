import React from 'react';

export interface StatusBadgeProps {
    status: string;
    className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
    const getStatusConfig = (status: string) => {
        const statusUpper = status.toUpperCase();

        // Doctor statuses
        if (statusUpper === 'ACTIVE') {
            return {
                class: 'fs-13 badge badge-soft-success border border-success',
                text: 'Hoạt động',
            };
        }
        if (statusUpper === 'INACTIVE') {
            return {
                class: 'fs-13 badge badge-soft-danger border border-danger',
                text: 'Không hoạt động',
            };
        }

        // Appointment statuses
        if (
            statusUpper.includes('PENDING') ||
            statusUpper.includes('CHỜ') ||
            statusUpper.includes('ĐANG KHÁM')
        ) {
            return {
                class: 'fs-13 badge badge-soft-warning border border-warning',
                text: 'Đang khám',
            };
        }
        if (
            statusUpper.includes('COMPLETED') ||
            statusUpper.includes('HOÀN THÀNH') ||
            statusUpper.includes('ĐÃ KHÁM')
        ) {
            return {
                class: 'fs-13 badge badge-soft-primary border border-primary',
                text: 'Đã khám',
            };
        }
        if (
            statusUpper.includes('CANCELLED') ||
            statusUpper.includes('HỦY') ||
            statusUpper.includes('ĐÃ HỦY')
        ) {
            return {
                class: 'fs-13 badge badge-soft-danger border border-danger',
                text: 'Đã hủy',
            };
        }
        if (
            statusUpper.includes('SCHEDULED') ||
            statusUpper.includes('ĐẶT LỊCH') ||
            statusUpper.includes('ĐÃ ĐẶT LỊCH')
        ) {
            return {
                class: 'fs-13 badge badge-soft-info border border-info',
                text: 'Đã đặt lịch',
            };
        }

        // Default fallback
        return {
            class: 'fs-13 badge badge-soft-secondary border border-secondary',
            text: status,
        };
    };

    const config = getStatusConfig(status);

    return <span className={`badge ${config.class} ${className}`}>{config.text}</span>;
};

export default StatusBadge;
