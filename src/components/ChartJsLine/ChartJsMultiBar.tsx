import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';
import { createBarChartConfig, createBarDataset } from './barChartConfig';

type ChartDataPoint = { label: string; value1: number; value2: number };

interface ChartJsMultiBarProps {
    data: ChartDataPoint[];
    color1: string;
    color2: string;
    label1: string;
    label2: string;
}

export const ChartJsMultiBar: React.FC<ChartJsMultiBarProps> = ({
    data,
    color1,
    color2,
    label1,
    label2,
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
                    color1
                ),
                createBarDataset(
                    label2,
                    trimmed.map((point) => point.value2),
                    color2
                ),
            ]
        );

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, color1, color2, label1, label2]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
