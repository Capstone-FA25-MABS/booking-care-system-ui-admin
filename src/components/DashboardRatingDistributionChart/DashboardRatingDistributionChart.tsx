import React from 'react';
import { ChartJsMultiBar } from '@/components/ChartJsLine';

interface DashboardRatingDistributionChartProps {
    data: Array<{ label: string; value1: number; value2: number }>;
    trendCardClassName: string;
    cardHeaderClassName: string;
    cardBodyClassName: string;
    title?: string;
    subtitle?: string;
}

const DashboardRatingDistributionChart: React.FC<DashboardRatingDistributionChartProps> = ({
    data,
    trendCardClassName,
    cardHeaderClassName,
    cardBodyClassName,
    title = 'Phân bổ đánh giá',
    subtitle = 'Phân bổ số lượng và phần trăm đánh giá theo điểm',
}) => {
    if (!data || data.length === 0) {
        return null;
    }

    return (
        <div className={trendCardClassName}>
            <div className={cardHeaderClassName}>
                <h5>{title}</h5>
                <span>{subtitle}</span>
            </div>
            <div className={cardBodyClassName}>
                <ChartJsMultiBar
                    data={data}
                    color1="#8b5cf6"
                    color2="#10b981"
                    label1="Số đánh giá"
                    label2="Phần trăm (%)"
                />
            </div>
        </div>
    );
};

export default DashboardRatingDistributionChart;
