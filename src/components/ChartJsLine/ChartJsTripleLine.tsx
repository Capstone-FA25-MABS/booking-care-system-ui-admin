import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';
import {
    createChartOptions,
    createLineDataset,
    createYScale,
    createXScale,
} from '@/utils/chartConfig';

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
                'y'
            ),
            createLineDataset(
                label3,
                trimmed.map((point) => point.value3),
                color3,
                'y'
            ),
        ];

        const scales = {
            y: createYScale('left'),
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
    }, [data, color1, color2, color3, label1, label2, label3]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
