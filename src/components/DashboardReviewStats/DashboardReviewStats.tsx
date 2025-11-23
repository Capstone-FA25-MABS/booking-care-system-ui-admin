import React from 'react';
import { MetricCard } from '@/components/MetricCard';

interface Metric {
    label: string;
    value: number;
    sub: string;
    className?: string;
    icon?: string;
    formatDecimal?: boolean;
}

interface DashboardReviewStatsProps {
    metrics: Metric[];
    trendCardClassName: string;
    cardHeaderClassName: string;
    cardBodyClassName: string;
    metricsGridClassName: string;
    hospitalOverviewGridClassName: string;
}

const DashboardReviewStats: React.FC<DashboardReviewStatsProps> = ({
    metrics,
    trendCardClassName,
    cardHeaderClassName,
    cardBodyClassName,
    metricsGridClassName,
    hospitalOverviewGridClassName,
}) => {
    return (
        <div className={trendCardClassName}>
            <div className={cardHeaderClassName}>
                <h5>Thống kê đánh giá</h5>
                <span>Tổng hợp đánh giá từ bệnh nhân</span>
            </div>
            <div className={cardBodyClassName}>
                <div className={`${metricsGridClassName} ${hospitalOverviewGridClassName}`}>
                    {metrics.map((metric) => (
                        <MetricCard
                            key={metric.label}
                            label={metric.label}
                            value={metric.value}
                            sub={metric.sub}
                            className={metric.className}
                            icon={metric.icon}
                            formatDecimal={metric.formatDecimal}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardReviewStats;
