import React from 'react';
import DashboardReviewStats from '@/components/DashboardReviewStats';
import DashboardTopRankings from '@/components/DashboardTopRankings/DashboardTopRankings';

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
    rankingsClassNames,
}) => {
    if (!reviewStats) {
        return null;
    }

    return (
        <>
            <DashboardReviewStats
                metrics={metrics}
                trendCardClassName={trendCardClassName}
                cardHeaderClassName={cardHeaderClassName}
                cardBodyClassName={cardBodyClassName}
                metricsGridClassName={metricsGridClassName}
                hospitalOverviewGridClassName={overviewGridClassName}
            />

            <DashboardTopRankings
                topDoctors={reviewStats.topDoctors}
                topServices={reviewStats.topServices}
                containerClassName={rankingsClassNames.containerClassName}
                cardClassName={rankingsClassNames.cardClassName}
                cardHeaderClassName={rankingsClassNames.cardHeaderClassName}
                cardBodyClassName={rankingsClassNames.cardBodyClassName}
                listClassName={rankingsClassNames.listClassName}
                itemClassName={rankingsClassNames.itemClassName}
                rankClassName={rankingsClassNames.rankClassName}
                infoClassName={rankingsClassNames.infoClassName}
                nameClassName={rankingsClassNames.nameClassName}
                statsClassName={rankingsClassNames.statsClassName}
                ratingClassName={rankingsClassNames.ratingClassName}
                reviewsClassName={rankingsClassNames.reviewsClassName}
            />
        </>
    );
};

export default DashboardReviewSection;
