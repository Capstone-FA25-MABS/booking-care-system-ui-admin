import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';

type ChartPoint = { label: string; value: number };

interface ChartJsAreaProps {
    data: ChartPoint[];
    color: string;
    label: string;
    fillOpacity?: number;
}

const numberFormatter = new Intl.NumberFormat('vi-VN');

export const ChartJsArea: React.FC<ChartJsAreaProps> = ({
    data,
    color,
    label,
    fillOpacity = 0.2,
}) => {
    const { canvasRef, chartRef, isMountedRef } = useChartLoader();

    useEffect(() => {
        if (!canvasRef.current) return;

        const trimmed = data.length > 12 ? data.slice(-12) : data;

        const config = {
            type: 'line' as const,
            data: {
                labels: trimmed.map((point) => point.label),
                datasets: [
                    {
                        label,
                        data: trimmed.map((point) => point.value),
                        borderColor: color,
                        backgroundColor: color.startsWith('#')
                            ? `${color}${Math.round(fillOpacity * 255)
                                  .toString(16)
                                  .padStart(2, '0')}`
                            : color.replace('rgb', 'rgba').replace(')', `, ${fillOpacity})`),
                        fill: true,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: color,
                        pointBorderWidth: 2,
                        tension: 0.4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#94a3b8' },
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' },
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top' as const,
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                        },
                    },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        padding: 10,
                        titleColor: '#fff',
                        bodyColor: '#e2e8f0',
                        callbacks: {
                            label: function (context: any) {
                                return `${label}: ${numberFormatter.format(context.parsed.y)}`;
                            },
                        },
                    },
                },
            },
        };

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, color, label, fillOpacity]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
