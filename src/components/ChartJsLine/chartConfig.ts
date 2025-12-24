/**
 * Shared Chart.js configuration utilities
 */

const numberFormatter = new Intl.NumberFormat('vi-VN');

/**
 * Format large numbers with K/M suffixes
 */
export const formatChartNumber = (value: number): string => {
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
        return (value / 1000).toFixed(0) + 'K';
    }
    return numberFormatter.format(value);
};

/**
 * Common Y-axis scale configuration for bar charts
 */
export const getYAxisConfig = () => ({
    min: 0,
    grid: {
        color: '#f1f5f9',
    },
    ticks: {
        color: '#94a3b8',
        callback: function (value: any) {
            return formatChartNumber(value);
        },
    },
});

export { numberFormatter };
