import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';

type ChartDataPoint = { label: string; value1: number; value2: number; value3: number };

interface ChartJsTripleLineProps {
    data: ChartDataPoint[];
    color1: string;
    color2: string;
    color3: string;
    label1: string;
    label2: string;
    label3: string;
}

export const ChartJsTripleLine: React.FC<ChartJsTripleLineProps> = ({
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
            type: 'line',
            data: {
                labels: trimmed.map((point) => point.label),
                datasets: [
                    {
                        label: label1,
                        data: trimmed.map((point) => point.value1),
                        borderColor: color1,
                        backgroundColor: color1,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff',
                        tension: 0.45,
                        yAxisID: 'y',
                    },
                    {
                        label: label2,
                        data: trimmed.map((point) => point.value2),
                        borderColor: color2,
                        backgroundColor: color2,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff',
                        tension: 0.45,
                        yAxisID: 'y',
                    },
                    {
                        label: label3,
                        data: trimmed.map((point) => point.value3),
                        borderColor: color3,
                        backgroundColor: color3,
                        fill: false,
                        borderWidth: 3,
                        pointRadius: 4,
                        pointBackgroundColor: '#fff',
                        tension: 0.45,
                        yAxisID: 'y',
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
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                        min: 0,
                        grid: { color: '#f1f5f9' },
                        ticks: {
                            color: '#94a3b8',
                            beginAtZero: true,
                        },
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
