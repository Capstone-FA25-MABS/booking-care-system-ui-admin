import React, { useEffect } from 'react';
import styles from './ChartJsLine.module.scss';
import { useChartLoader, initializeChart } from '@/hooks/useChartLoader';
import { createBarChartConfig, createBarDataset } from './barChartConfig';
import { numberFormatter } from './chartConfig';

type ChartDataPoint = { label: string; value1: number; value2: number };

interface ChartJsBarProps {
    data: ChartDataPoint[];
    color1: string;
    color2: string;
    label1: string;
    label2: string;
    stacked?: boolean;
}

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

        const config = createBarChartConfig(
            trimmed.map((point) => point.label),
            [
                createBarDataset(
                    label2,
                    trimmed.map((point) => point.value2),
                    color2,
                    40
                ),
                createBarDataset(
                    label1,
                    trimmed.map((point) => point.value1 - point.value2),
                    color1,
                    40
                ),
            ],
            {
                stacked,
                customTooltip: function (context: any) {
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
                customFooter: function (tooltipItems: any) {
                    const dataIndex = tooltipItems[0].dataIndex;
                    const total = trimmed[dataIndex].value1;
                    return 'Tổng: ' + numberFormatter.format(total) + ' ₫';
                },
            }
        );

        initializeChart(canvasRef, chartRef, isMountedRef, config);
    }, [data, color1, color2, label1, label2, stacked]);

    return (
        <div className={styles.chartJsWrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
};
