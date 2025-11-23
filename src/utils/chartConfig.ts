/**
 * Shared chart configuration utilities
 * Extracted to reduce duplication between ChartJsMultiLine and ChartJsTripleLine
 */

export interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
    borderWidth: number;
    pointRadius: number;
    pointBackgroundColor: string;
    tension: number;
    yAxisID: string;
}

export interface ChartScaleConfig {
    type: 'linear';
    display: boolean;
    position: 'left' | 'right';
    min: number;
    grid: { color?: string; drawOnChartArea?: boolean };
    ticks: {
        color: string;
        beginAtZero: boolean;
    };
    title?: {
        display: boolean;
        text: string;
        color: string;
    };
}

/**
 * Creates common chart options configuration
 */
export const createChartOptions = (
    scales: Record<
        string,
        ChartScaleConfig | { grid: { display: boolean }; ticks: { color: string } }
    >
) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index' as const,
        intersect: false,
    },
    animations: {
        tension: {
            duration: 1000,
            easing: 'linear',
            from: 0.8,
            to: 0,
            loop: true,
        },
    },
    scales,
    plugins: {
        legend: {
            display: true,
            position: 'top' as const,
            labels: {
                usePointStyle: true,
                padding: 15,
                color: '#64748b',
            },
        },
        tooltip: {
            backgroundColor: '#0f172a',
            padding: 10,
            titleColor: '#fff',
            bodyColor: '#e2e8f0',
        },
    },
});

/**
 * Creates a dataset configuration for line charts
 */
export const createLineDataset = (
    label: string,
    data: number[],
    color: string,
    yAxisID: string = 'y'
): ChartDataset => ({
    label,
    data,
    borderColor: color,
    backgroundColor: color,
    fill: false,
    borderWidth: 3,
    pointRadius: 4,
    pointBackgroundColor: '#fff',
    tension: 0.45,
    yAxisID,
});

/**
 * Creates a Y-axis scale configuration
 */
export const createYScale = (
    position: 'left' | 'right',
    label?: string,
    labelColor?: string,
    drawOnChartArea: boolean = true
): ChartScaleConfig => ({
    type: 'linear',
    display: true,
    position,
    min: 0,
    grid: {
        color: drawOnChartArea ? '#f1f5f9' : undefined,
        drawOnChartArea,
    },
    ticks: {
        color: '#94a3b8',
        beginAtZero: true,
    },
    ...(label && labelColor
        ? {
              title: {
                  display: true,
                  text: label,
                  color: labelColor,
              },
          }
        : {}),
});

/**
 * Creates X-axis scale configuration
 */
export const createXScale = () => ({
    grid: { display: false },
    ticks: { color: '#94a3b8' },
});
