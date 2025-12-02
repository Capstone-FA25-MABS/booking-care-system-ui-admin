import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';

type ChartDataPoint = { label: string; value1: number; value2: number };

interface ChartJsBarProps {
    data: ChartDataPoint[];
    color1: string;
    color2: string;
    label1: string;
    label2: string;
    stacked?: boolean;
}

const numberFormatter = new Intl.NumberFormat('vi-VN');

export const ChartJsBar: React.FC<ChartJsBarProps> = ({
    data,
    color1,
    color2,
    label1,
    label2,
    stacked = true,
}) => {
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
                        label: label2,
                        data: trimmed.map((point) => point.value2),
                        backgroundColor: color2,
                        borderColor: color2,
                        borderWidth: 0,
                        borderRadius: 6,
                        barThickness: 'flex' as const,
                        maxBarThickness: 40,
                    },
                    {
                        label: label1,
                        data: trimmed.map((point) => point.value1 - point.value2),
                        backgroundColor: color1,
                        borderColor: color1,
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
                        stacked: stacked,
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
                        stacked: stacked,
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
                            label: function (context: any) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }

                                // For stacked chart, show actual values
                                const dataIndex = context.dataIndex;
                                const value1 = trimmed[dataIndex].value1;
                                const value2 = trimmed[dataIndex].value2;

                                if (context.datasetIndex === 0) {
                                    // Completed amount
                                    label += numberFormatter.format(value2) + ' ₫';
                                } else {
                                    // Pending amount (difference)
                                    const pending = value1 - value2;
                                    label += numberFormatter.format(pending) + ' ₫';
                                }

                                return label;
                            },
                            footer: function (tooltipItems: any) {
                                const dataIndex = tooltipItems[0].dataIndex;
                                const total = trimmed[dataIndex].value1;
                                return 'Tổng: ' + numberFormatter.format(total) + ' ₫';
                            },
                        },
                    },
                },
            },
        };

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, color1, color2, label1, label2, stacked]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
