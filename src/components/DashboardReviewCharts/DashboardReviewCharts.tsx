import React from 'react';
import { ChartJsMultiLine } from '@/components/ChartJsLine';

export interface ReviewMultiLineChart {
    key: string;
    title: string;
    subtitle: string;
    data: Array<{ label: string; value1: number; value2: number }>;
    color1?: string;
    color2?: string;
    label1: string;
    label2: string;
}

interface DashboardReviewChartsProps {
    charts: ReviewMultiLineChart[];
    trendCardClassName: string;
    cardHeaderClassName: string;
    cardBodyClassName: string;
}

const DashboardReviewCharts: React.FC<DashboardReviewChartsProps> = ({
    charts,
    trendCardClassName,
    cardHeaderClassName,
    cardBodyClassName,
}) => {
    if (!charts?.length) return null;

    return (
        <>
            {charts
                .filter((chart) => chart.data && chart.data.length > 0)
                .map((chart) => (
                    <div className={trendCardClassName} key={chart.key}>
                        <div className={cardHeaderClassName}>
                            <h5>{chart.title}</h5>
                            <span>{chart.subtitle}</span>
                        </div>
                        <div className={cardBodyClassName}>
                            <ChartJsMultiLine
                                data={chart.data}
                                color1={chart.color1 ?? '#8b5cf6'}
                                color2={chart.color2 ?? '#10b981'}
                                label1={chart.label1}
                                label2={chart.label2}
                            />
                        </div>
                    </div>
                ))}
        </>
    );
};

export default DashboardReviewCharts;
