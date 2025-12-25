import React from 'react';
import DashboardReviewStats from '@/components/DashboardReviewStats';

interface RankingsClassNames {
    containerClassName: string;
    cardClassName: string;
    cardHeaderClassName: string;
    cardBodyClassName: string;
    listClassName: string;
    itemClassName: string;
    rankClassName: string;
    infoClassName: string;
    nameClassName: string;
    statsClassName: string;
    ratingClassName: string;
    reviewsClassName: string;
}

interface DashboardReviewSectionProps {
    metrics: Array<{
        label: string;
        value: number;
        sub?: string;
        className: string;
        icon: string;
        formatDecimal?: boolean;
    }>;
    reviewStats: {
        topDoctors: Array<{ id: string; name: string; rating: number; reviews: number }>;
        topServices: Array<{ id: string; name: string; rating: number; reviews: number }>;
    };
    trendCardClassName: string;
    cardHeaderClassName: string;
    cardBodyClassName: string;
    metricsGridClassName: string;
    overviewGridClassName: string;
    rankingsClassNames: RankingsClassNames;
}

const DashboardReviewSection: React.FC<DashboardReviewSectionProps> = ({
    metrics,
    reviewStats,
    trendCardClassName,
    cardHeaderClassName,
    cardBodyClassName,
    metricsGridClassName,
    overviewGridClassName,
}) => {
    if (!reviewStats) {
        return null;
    }

    const normalizedMetrics = metrics.map((metric) => ({
        ...metric,
        sub: metric.sub ?? '',
    }));

    return (
        <>
            <DashboardReviewStats
                metrics={normalizedMetrics}
                trendCardClassName={trendCardClassName}
                cardHeaderClassName={cardHeaderClassName}
                cardBodyClassName={cardBodyClassName}
                metricsGridClassName={metricsGridClassName}
                hospitalOverviewGridClassName={overviewGridClassName}
            />
        </>
    );
};

export default DashboardReviewSection;
