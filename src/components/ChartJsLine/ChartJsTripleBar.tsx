import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';
import { getYAxisConfig, numberFormatter } from './chartConfig';

type ChartDataPoint = { label: string; value1: number; value2: number; value3: number };

interface ChartJsTripleBarProps {
    data: ChartDataPoint[];
    color1: string;
    color2: string;
    color3: string;
    label1: string;
    label2: string;
    label3: string;
}

export const ChartJsTripleBar: React.FC<ChartJsTripleBarProps> = ({
    data,
    color1,
    color2,
    color3,
    label1,
    label2,
    label3,
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
                        label: label1,
                        data: trimmed.map((point) => point.value1),
                        backgroundColor: color1,
                        borderColor: color1,
                        borderWidth: 0,
                        borderRadius: 6,
                        barThickness: 'flex' as const,
                        maxBarThickness: 30,
                    },
                    {
                        label: label2,
                        data: trimmed.map((point) => point.value2),
                        backgroundColor: color2,
                        borderColor: color2,
                        borderWidth: 0,
                        borderRadius: 6,
                        barThickness: 'flex' as const,
                        maxBarThickness: 30,
                    },
                    {
                        label: label3,
                        data: trimmed.map((point) => point.value3),
                        backgroundColor: color3,
                        borderColor: color3,
                        borderWidth: 0,
                        borderRadius: 6,
                        barThickness: 'flex' as const,
                        maxBarThickness: 30,
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
                    y: getYAxisConfig(),
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
                                label += numberFormatter.format(context.parsed.y);
                                return label;
                            },
                        },
                    },
                },
            },
        };

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, color1, color2, color3, label1, label2, label3]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
