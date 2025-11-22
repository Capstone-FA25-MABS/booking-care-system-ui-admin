import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';

type ChartPoint = { label: string; value: number };

interface ChartJsLineProps {
    data: ChartPoint[];
    color: string;
    label: string;
}

const numberFormatter = new Intl.NumberFormat('vi-VN');

export const ChartJsLine: React.FC<ChartJsLineProps> = ({ data, color, label }) => {
    const { canvasRef, chartRef, isMountedRef } = useChartLoader();

    useEffect(() => {
        if (!canvasRef.current) return;

        const trimmed = data.length > 12 ? data.slice(-12) : data;

        const config = {
            type: 'line',
            data: {
                labels: trimmed.map((point) => point.label),
                datasets: [
                    {
                        label,
                        data: trimmed.map((point) => point.value),
                        borderColor: color,
                        backgroundColor: color,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff',
                        tension: 0.45,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear',
                        from: 0.8,
                        to: 0,
                        loop: true,
                    },
                },
                scales: {
                    y: {
                        min: 0,
                        grid: { color: '#f1f5f9' },
                        ticks: { color: '#94a3b8' },
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' },
                    },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#0f172a',
                        padding: 10,
                        titleColor: '#fff',
                        bodyColor: '#e2e8f0',
                    },
                },
            },
        };

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, color, label]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
            <div className={styles.chartLegend}>
                <div className={styles.chartLegendItem}>
                    <span>{label}</span>
                    <strong>{numberFormatter.format(data[data.length - 1]?.value ?? 0)}</strong>
                </div>
            </div>
        </div>
    );
};
