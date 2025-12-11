import { getYAxisConfig, numberFormatter } from './chartConfig';

export interface BarDataset {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    barThickness: 'flex';
    maxBarThickness: number;
}

export interface ChartOptions {
    stacked?: boolean;
    customTooltip?: (context: any, trimmedData?: any[]) => string;
    customFooter?: (tooltipItems: any, trimmedData?: any[]) => string;
}

/**
 * Creates common chart options configuration for bar charts
 */
export const createBarChartOptions = (options: ChartOptions = {}) => {
    const { stacked = false, customTooltip, customFooter } = options;

    return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        scales: {
            x: {
                stacked,
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#94a3b8',
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                ...getYAxisConfig(),
                stacked,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
                labels: {
                    color: '#334155',
                    font: {
                        size: 13,
                        weight: '500' as const,
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: '#0f172a',
                padding: 12,
                titleColor: '#fff',
                bodyColor: '#e2e8f0',
                borderColor: '#475569',
                borderWidth: 1,
                displayColors: true,
                callbacks: {
                    label:
                        customTooltip ||
                        function (context: any) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += numberFormatter.format(context.parsed.y);
                            return label;
                        },
                    ...(customFooter && { footer: customFooter }),
                },
            },
        },
    };
};

/**
 * Creates a dataset configuration for bar charts
 */
export const createBarDataset = (
    label: string,
    data: number[],
    color: string,
    maxBarThickness: number = 35
): BarDataset => ({
    label,
    data,
    backgroundColor: color,
    borderColor: color,
    borderWidth: 0,
    borderRadius: 6,
    barThickness: 'flex' as const,
    maxBarThickness,
});

/**
 * Creates a complete bar chart configuration
 */
export const createBarChartConfig = (
    labels: string[],
    datasets: BarDataset[],
    options: ChartOptions = {}
): any => ({
    type: 'bar' as const,
    data: {
        labels,
        datasets,
    },
    options: createBarChartOptions(options),
});
