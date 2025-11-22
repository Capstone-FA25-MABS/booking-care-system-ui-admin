import React, { useEffect, useRef } from 'react';
import styles from './ChartJsLine.module.scss';

type ChartDataPoint = { label: string; value1: number; value2: number };

interface ChartJsMultiLineProps {
    data: ChartDataPoint[];
    color1: string;
    color2: string;
    label1: string;
    label2: string;
}

export const ChartJsMultiLine: React.FC<ChartJsMultiLineProps> = ({
    data,
    color1,
    color2,
    label1,
    label2,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        let isMounted = true;

        const loadChart = async () => {
            const module = await import('@/assets/plugins/chartjs/chart.min.js');
            const ChartCtor = (module as any)?.default ?? (window as any).Chart;
            if (!ChartCtor || !canvasRef.current || !isMounted) return;

            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            if (chartRef.current) {
                chartRef.current.destroy();
            }

            const trimmed = data.length > 12 ? data.slice(-12) : data;

            chartRef.current = new ChartCtor(ctx, {
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
                            yAxisID: 'y1',
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
                            max: 5,
                            grid: { color: '#f1f5f9' },
                            ticks: { color: '#94a3b8' },
                            title: {
                                display: true,
                                text: label1,
                                color: color1,
                            },
                        },
                        y1: {
                            type: 'linear' as const,
                            display: true,
                            position: 'right' as const,
                            min: 0,
                            grid: {
                                drawOnChartArea: false,
                            },
                            ticks: { color: '#94a3b8' },
                            title: {
                                display: true,
                                text: label2,
                                color: color2,
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
            });
        };

        loadChart();

        return () => {
            isMounted = false;
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [data, color1, color2, label1, label2]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
