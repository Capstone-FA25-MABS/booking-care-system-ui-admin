import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';

type ChartPoint = { label: string; value: number };

interface ChartJsSingleBarProps {
    data: ChartPoint[];
    color: string;
    label: string;
}

const numberFormatter = new Intl.NumberFormat('vi-VN');

export const ChartJsSingleBar: React.FC<ChartJsSingleBarProps> = ({ data, color, label }) => {
    const { canvasRef, chartRef, isMountedRef } = useChartLoader();

    useEffect(() => {
        if (!canvasRef.current) return;

        const trimmed = data.length > 12 ? data.slice(-12) : data;

        const config = {
            type: 'bar' as const,
            data: {
                labels: trimmed.map((point) => point.label),
                datasets: [
                    {
                        label,
                        data: trimmed.map((point) => point.value),
                        backgroundColor: color,
                        borderColor: color,
                        borderWidth: 0,
                        borderRadius: 6,
                        barThickness: 'flex' as const,
                        maxBarThickness: 40,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index' as const,
                    intersect: false,
                },
                scales: {
                    x: {
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
                        min: 0,
                        grid: {
                            color: '#f1f5f9',
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: function (value: any) {
                                // Format large numbers
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                }
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(0) + 'K';
                                }
                                return numberFormatter.format(value);
                            },
                        },
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top' as const,
                        align: 'end' as const,
                        labels: {
                            boxWidth: 12,
                            boxHeight: 12,
                            padding: 15,
                            color: '#475569',
                            font: {
                                size: 13,
                            },
                            usePointStyle: true,
                            pointStyle: 'circle',
                        },
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        titleFont: {
                            size: 13,
                            weight: 'bold' as const,
                        },
                        bodyColor: '#fff',
                        bodyFont: {
                            size: 12,
                        },
                        displayColors: true,
                        callbacks: {
                            label: function (context: any) {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: ${numberFormatter.format(value)}`;
                            },
                        },
                    },
                },
            },
        };

        initializeChart(canvasRef, chartRef, isMountedRef, config as any);

        return () => {
            if (chartRef.current && isMountedRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [data, color, label]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
