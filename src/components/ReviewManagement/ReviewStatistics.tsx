import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import { ReviewService, ReviewDetailedStatisticsResponse } from '@/services/review.service';

import styles from './ReviewStatistics.module.scss';

interface ReviewStatisticsProps {
    entityType: 'hospital' | 'doctor';
    entityId: string;
}

const ReviewStatistics: React.FC<ReviewStatisticsProps> = ({ entityType, entityId }) => {
    const [statistics, setStatistics] = useState<ReviewDetailedStatisticsResponse | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                const response =
                    entityType === 'hospital'
                        ? await ReviewService.getHospitalStatistics(entityId)
                        : await ReviewService.getDoctorStatistics(entityId);

                if (response.success && response.data) {
                    setStatistics(response.data);
                }
            } catch (error) {
                console.error(`Failed to fetch ${entityType} statistics:`, error);
            } finally {
                setLoading(false);
            }
        };

        if (entityId) {
            fetchStatistics();
        }
    }, [entityType, entityId]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeleton}></div>
            </div>
        );
    }

    if (!statistics) {
        return null;
    }

    // Convert ratingDistribution from object to array format
    const ratingDistribution = (() => {
        if (Array.isArray(statistics.ratingDistribution)) {
            return statistics.ratingDistribution;
        }

        // If it's an object like { "1": 0, "2": 0, "3": 0, "4": 0, "5": 2 }
        if (statistics.ratingDistribution && typeof statistics.ratingDistribution === 'object') {
            const total = statistics.totalReviews || 1;
            return [5, 4, 3, 2, 1].map((rating) => {
                const count = (statistics.ratingDistribution as any)[rating] || 0;
                return {
                    rating,
                    count,
                    percentage: total > 0 ? (count / total) * 100 : 0,
                };
            });
        }

        return [];
    })();

    const renderStars = (rating: number) => {
        return (
            <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className={clsx('ti ti-star-filled', {
                            [styles.filled]: star <= Math.round(rating),
                            [styles.empty]: star > Math.round(rating),
                        })}
                    ></i>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.mainStats}>
                    <div className={styles.ratingDisplay}>
                        <div className={styles.ratingNumber}>
                            {statistics.averageRating.toFixed(1)}
                        </div>
                        {renderStars(statistics.averageRating)}
                        <div className={styles.totalReviews}>
                            {statistics.totalReviews} đánh giá
                        </div>
                    </div>
                </div>

                <div className={styles.distribution}>
                    <div className={styles.distributionTitle}>Phân bố đánh giá</div>
                    {ratingDistribution.length > 0 ? (
                        ratingDistribution.map((dist) => (
                            <div key={dist.rating} className={styles.distributionRow}>
                                <div className={styles.ratingLabel}>
                                    {dist.rating} <i className="ti ti-star-filled"></i>
                                </div>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${dist.percentage}%` }}
                                    ></div>
                                </div>
                                <div className={styles.count}>
                                    {dist.count} ({dist.percentage.toFixed(0)}%)
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.noData}>Chưa có dữ liệu phân bố</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewStatistics;
