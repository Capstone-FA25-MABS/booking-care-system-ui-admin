import React from 'react';

export interface TopRankingItem {
    id: string;
    name: string;
    rating: number;
    reviews: number;
}

interface DashboardTopRankingsProps {
    topDoctors?: TopRankingItem[];
    topServices?: TopRankingItem[];
    containerClassName?: string;
    cardClassName?: string;
    cardHeaderClassName?: string;
    cardBodyClassName?: string;
    listClassName?: string;
    itemClassName?: string;
    rankClassName?: string;
    infoClassName?: string;
    nameClassName?: string;
    statsClassName?: string;
    ratingClassName?: string;
    reviewsClassName?: string;
    doctorTitle?: string;
    doctorSubtitle?: string;
    serviceTitle?: string;
    serviceSubtitle?: string;
}

const DashboardTopRankings: React.FC<DashboardTopRankingsProps> = ({
    topDoctors = [],
    topServices = [],
    containerClassName,
    cardClassName,
    cardHeaderClassName,
    cardBodyClassName,
    listClassName,
    itemClassName,
    rankClassName,
    infoClassName,
    nameClassName,
    statsClassName,
    ratingClassName,
    reviewsClassName,
    doctorTitle = 'Top bác sĩ được đánh giá cao',
    doctorSubtitle = 'Top 5 bác sĩ có điểm đánh giá tốt nhất',
    serviceTitle = 'Top dịch vụ được đánh giá cao',
    serviceSubtitle = 'Top 5 dịch vụ có điểm đánh giá tốt nhất',
}) => {
    if (topDoctors.length === 0 && topServices.length === 0) {
        return null;
    }

    const renderList = (items: TopRankingItem[], title: string, subtitle: string) => (
        <div className={cardClassName}>
            <div className={cardHeaderClassName}>
                <h5>{title}</h5>
                <span>{subtitle}</span>
            </div>
            <div className={cardBodyClassName}>
                <div className={listClassName}>
                    {items.map((item, index) => (
                        <div key={item.id} className={itemClassName}>
                            <div className={rankClassName}>#{index + 1}</div>
                            <div className={infoClassName}>
                                <div className={nameClassName}>{item.name}</div>
                                <div className={statsClassName}>
                                    <span className={ratingClassName}>
                                        ⭐ {item.rating.toFixed(1)}
                                    </span>
                                    <span className={reviewsClassName}>
                                        ({item.reviews} đánh giá)
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className={containerClassName}>
            {topDoctors.length > 0 && renderList(topDoctors, doctorTitle, doctorSubtitle)}
            {topServices.length > 0 && renderList(topServices, serviceTitle, serviceSubtitle)}
        </div>
    );
};

export default DashboardTopRankings;
