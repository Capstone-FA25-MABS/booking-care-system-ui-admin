import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';
import {
    createChartOptions,
    createLineDataset,
    createYScale,
    createXScale,
} from '@/utils/chartConfig';

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
    const { canvasRef, chartRef, isMountedRef } = useChartLoader();

    useEffect(() => {
        if (!canvasRef.current) return;

        const trimmed = data.length > 12 ? data.slice(-12) : data;

        const datasets = [
            createLineDataset(
                label1,
                trimmed.map((point) => point.value1),
                color1,
                'y'
            ),
            createLineDataset(
                label2,
                trimmed.map((point) => point.value2),
                color2,
                'y1'
            ),
        ];

        const scales = {
            y: createYScale('left', label1, color1, true),
            y1: createYScale('right', label2, color2, false),
            x: createXScale(),
        };

        const config = {
            type: 'line' as const,
            data: {
                labels: trimmed.map((point) => point.label),
                datasets,
            },
            options: createChartOptions(scales),
        };

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, color1, color2, label1, label2]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
