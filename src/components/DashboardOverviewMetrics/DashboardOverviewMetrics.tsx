import React from 'react';
import { StatisticsPeriod } from '@/types/statistics.types';
import { periodOptions } from '@/utils/dashboard.utils';
import { MetricCard } from '@/components/MetricCard';

interface Metric {
    label: string;
    value: number;
    sub: string;
    className?: string;
    icon?: string;
}

interface DashboardOverviewMetricsProps {
    period: StatisticsPeriod;
    metrics: Metric[];
    trendCardClassName: string;
    cardHeaderClassName: string;
    cardBodyClassName: string;
    metricsGridClassName: string;
    overviewGridClassName: string;
}

const DashboardOverviewMetrics: React.FC<DashboardOverviewMetricsProps> = ({
    period,
    metrics,
    trendCardClassName,
    cardHeaderClassName,
    cardBodyClassName,
    metricsGridClassName,
    overviewGridClassName,
}) => {
    return (
        <div className={trendCardClassName}>
            <div className={cardHeaderClassName}>
                <h5>Tổng quan lịch hẹn</h5>
                <span>Số liệu theo: {periodOptions.find((p) => p.value === period)?.label}</span>
            </div>
            <div className={cardBodyClassName}>
                <div className={`${metricsGridClassName} ${overviewGridClassName}`}>
                    {metrics.map((metric) => (
                        <MetricCard
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                            sub={metric.sub}
                            className={metric.className}
                            icon={metric.icon}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardOverviewMetrics;
