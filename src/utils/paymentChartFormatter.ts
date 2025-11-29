import { StatisticsPeriod as PaymentStatisticsPeriod } from '@/types/payment.types';

/**
 * Format date range from ISO strings
 */
function formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const formatDay = (date: Date) => {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}`;
    };

    return `${formatDay(start)} - ${formatDay(end)}`;
}

/**
 * Format time label to Vietnamese format based on period
 * Converts English time labels (e.g., "W44-2025") to Vietnamese-friendly format
 */
export function formatTimeLabel(
    timeLabel: string,
    period: PaymentStatisticsPeriod,
    periodStart?: string,
    periodEnd?: string
): string {
    try {
        // Daily format: "2025-11-15" -> "15/11"
        if (period === 'Daily') {
            const match = timeLabel.match(/(\d{4})-(\d{2})-(\d{2})/);
            if (match) {
                const [, , month, day] = match;
                return `${parseInt(day)}/${parseInt(month)}`;
            }
        }

        // Weekly format: Use periodStart and periodEnd if available
        if (period === 'Weekly') {
            if (periodStart && periodEnd) {
                return formatDateRange(periodStart, periodEnd);
            }
            // Fallback
            return timeLabel;
        }

        // Monthly format: "2025-11" -> "Th11/2025"
        if (period === 'Monthly') {
            const match = timeLabel.match(/(\d{4})-(\d{2})/);
            if (match) {
                const [, year, month] = match;
                return `Th${parseInt(month)}/${year}`;
            }
        }

        // Quarterly format: "Q4-2025" or "2025-Q4" -> "Quý 4/2025"
        if (period === 'Quarterly') {
            const qMatch = timeLabel.match(/Q(\d)-?(\d{4})|(\d{4})-?Q(\d)/);
            if (qMatch) {
                const quarter = qMatch[1] || qMatch[4];
                const year = qMatch[2] || qMatch[3];
                return `Quý ${quarter}/${year}`;
            }
        }

        // Yearly format: "2025" -> "Năm 2025"
        if (period === 'Yearly') {
            const match = timeLabel.match(/(\d{4})/);
            if (match) {
                return `Năm ${match[1]}`;
            }
        }

        // Fallback: return original
        return timeLabel;
    } catch (error) {
        console.error('Error formatting time label:', error);
        return timeLabel;
    }
}

/**
 * Format currency amount to Vietnamese format
 * Example: 1000000 -> "1.000.000 ₫"
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
}

/**
 * Format large numbers with abbreviations
 * Example: 1000000 -> "1M", 1500000 -> "1.5M"
 */
export function formatShortCurrency(amount: number): string {
    if (amount >= 1_000_000_000) {
        return `${(amount / 1_000_000_000).toFixed(1)}B`;
    }
    if (amount >= 1_000_000) {
        return `${(amount / 1_000_000).toFixed(1)}M`;
    }
    if (amount >= 1_000) {
        return `${(amount / 1_000).toFixed(1)}K`;
    }
    return amount.toString();
}
