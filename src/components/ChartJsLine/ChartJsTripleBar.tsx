import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';
import { createBarChartConfig, createBarDataset } from './barChartConfig';

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

        const config = createBarChartConfig(
            trimmed.map((point) => point.label),
            [
                createBarDataset(
                    label1,
                    trimmed.map((point) => point.value1),
                    color1,
                    30
                ),
                createBarDataset(
                    label2,
                    trimmed.map((point) => point.value2),
                    color2,
                    30
                ),
                createBarDataset(
                    label3,
                    trimmed.map((point) => point.value3),
                    color3,
                    30
                ),
            ]
        );

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, color1, color2, color3, label1, label2, label3]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
