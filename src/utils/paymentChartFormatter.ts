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
            return formatDailyLabel(timeLabel);
        }

        // Weekly format: Use periodStart and periodEnd if available
        if (period === 'Weekly') {
            return formatWeeklyLabel(timeLabel, periodStart, periodEnd);
        }

        // Monthly format: "2025-11" -> "Th11/2025"
        if (period === 'Monthly') {
            return formatMonthlyLabel(timeLabel);
        }

        // Quarterly format: "Q4-2025" or "2025-Q4" -> "Quý 4/2025"
        if (period === 'Quarterly') {
            return formatQuarterlyLabel(timeLabel);
        }

        // Yearly format: "2025" -> "Năm 2025"
        if (period === 'Yearly') {
            return formatYearlyLabel(timeLabel);
        }

        // Fallback: return original
        return timeLabel;
    } catch (error) {
        console.error('Error formatting time label:', error);
        return timeLabel;
    }
}

/**
 * Format daily label: "2025-11-15" -> "15/11"
 */
function formatDailyLabel(timeLabel: string): string {
    const regex = /(\d{4})-(\d{2})-(\d{2})/;
    const match = regex.exec(timeLabel);
    if (match) {
        const [, , month, day] = match;
        return `${Number.parseInt(day, 10)}/${Number.parseInt(month, 10)}`;
    }
    return timeLabel;
}

/**
 * Format weekly label using date range
 */
function formatWeeklyLabel(timeLabel: string, periodStart?: string, periodEnd?: string): string {
    if (periodStart && periodEnd) {
        return formatDateRange(periodStart, periodEnd);
    }
    return timeLabel;
}

/**
 * Format monthly label: "2025-11" -> "Th11/2025"
 */
function formatMonthlyLabel(timeLabel: string): string {
    const regex = /(\d{4})-(\d{2})/;
    const match = regex.exec(timeLabel);
    if (match) {
        const [, year, month] = match;
        return `Th${Number.parseInt(month, 10)}/${year}`;
    }
    return timeLabel;
}

/**
 * Format quarterly label: "Q4-2025" or "2025-Q4" -> "Quý 4/2025"
 */
function formatQuarterlyLabel(timeLabel: string): string {
    const regex = /Q(\d)-?(\d{4})|(\d{4})-?Q(\d)/;
    const qMatch = regex.exec(timeLabel);
    if (qMatch) {
        const quarter = qMatch[1] || qMatch[4];
        const year = qMatch[2] || qMatch[3];
        return `Quý ${quarter}/${year}`;
    }
    return timeLabel;
}

/**
 * Format yearly label: "2025" -> "Năm 2025"
 */
function formatYearlyLabel(timeLabel: string): string {
    const regex = /(\d{4})/;
    const match = regex.exec(timeLabel);
    if (match) {
        return `Năm ${match[1]}`;
    }
    return timeLabel;
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
