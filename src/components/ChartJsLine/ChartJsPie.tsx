import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';

type ChartDataPoint = { label: string; value: number };

interface ChartJsPieProps {
    data: ChartDataPoint[];
    colors?: string[];
}

const numberFormatter = new Intl.NumberFormat('vi-VN');

export const ChartJsPie: React.FC<ChartJsPieProps> = ({ data, colors }) => {
    const { canvasRef, chartRef, isMountedRef } = useChartLoader();

    const defaultColors = [
        '#6366f1',
        '#8b5cf6',
        '#ec4899',
        '#f59e0b',
        '#10b981',
        '#06b6d4',
        '#f97316',
        '#ef4444',
    ];

    const chartColors = colors || defaultColors;

    useEffect(() => {
        if (!canvasRef.current) return;

        const config = {
            type: 'pie' as const,
            data: {
                labels: data.map((point) => point.label),
                datasets: [
                    {
                        data: data.map((point) => point.value),
                        backgroundColor: data.map(
                            (_, index) => chartColors[index % chartColors.length]
                        ),
                        borderColor: '#fff',
                        borderWidth: 2,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom' as const,
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12,
                            },
                        },
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#e2e8f0',
                        callbacks: {
                            label: function (context: any) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce(
                                    (a: number, b: number) => a + b,
                                    0
                                );
                                const percentage =
                                    total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${numberFormatter.format(value)} (${percentage}%)`;
                            },
                        },
                    },
                },
            },
        };

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, chartColors]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
