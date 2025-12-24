/**
 * Utility functions for wallet and payment operations
 */

import { PayoutStatus } from '@/types/hospitalPayout.types';

/**
 * Generate bank logo URL from VietQR CDN
 * @param bankCode - Bank code (e.g., 'VCB', 'TCB')
 * @returns URL to bank logo image
 */
export const getBankLogoUrl = (bankCode: string): string => {
    return `https://api.vietqr.io/img/${bankCode}.png`;
};

/**
 * Format currency amount to Vietnamese Dong
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

/**
 * Get status badge configuration for payout status
 * @param status - Payout status enum
 * @returns Object with badge class and label
 */
export const getPayoutStatusBadge = (
    status: PayoutStatus
): { className: string; label: string } => {
    switch (status) {
        case PayoutStatus.PENDING:
            return { className: 'badge bg-warning', label: 'Chờ thanh toán' };
        case PayoutStatus.COMPLETED:
            return { className: 'badge bg-success', label: 'Đã thanh toán' };
        default:
            return { className: 'badge bg-secondary', label: 'Không xác định' };
    }
};
