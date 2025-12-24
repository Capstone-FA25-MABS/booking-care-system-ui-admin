import React, { useState, useEffect } from 'react';

import { ReviewService, ReviewDetailedStatisticsResponse } from '@/services/review.service';
import styles from './ReviewStatistics.module.scss';
import clsx from 'clsx';
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
            <div className="card mb-3">
                <div className="card-body">
                    <div
                        className="placeholder-glow"
                        style={{ height: '150px', background: '#f8f9fa', borderRadius: '8px' }}
                    ></div>
                </div>
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
            <div className={clsx(styles.stars, 'd-flex gap-1 justify-content-center mb-2')}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <i
                        key={star}
                        className="ti ti-star-filled"
                        style={{
                            fontSize: '1.25rem',
                            color: star <= Math.round(rating) ? '#ffc107' : '#e9ecef',
                        }}
                    ></i>
                ))}
            </div>
        );
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="row align-items-center">
                    {/* Main Rating Display */}
                    <div className="col-md-3 text-center border-end">
                        <div
                            className="fw-bold mb-1"
                            style={{ fontSize: '3rem', color: '#ffc107', lineHeight: 1 }}
                        >
                            {statistics.averageRating.toFixed(1)}
                        </div>
                        {renderStars(statistics.averageRating)}
                        <div className="text-muted small">{statistics.totalReviews} đánh giá</div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="col-md-9">
                        <h6 className="fw-semibold mb-3">Phân bố đánh giá</h6>
                        {ratingDistribution.length > 0 ? (
                            ratingDistribution.map((dist) => (
                                <div
                                    key={dist.rating}
                                    className="d-flex align-items-center gap-2 mb-2"
                                >
                                    <div
                                        className="d-flex align-items-center gap-1"
                                        style={{ minWidth: '50px' }}
                                    >
                                        <span className="fw-medium">{dist.rating}</span>
                                        <i
                                            className="ti ti-star-filled"
                                            style={{ color: '#ffc107', fontSize: '0.875rem' }}
                                        ></i>
                                    </div>
                                    <div className="progress flex-grow-1" style={{ height: '8px' }}>
                                        <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{
                                                width: `${dist.percentage}%`,
                                                background:
                                                    'linear-gradient(90deg, #ffc107 0%, #ff9800 100%)',
                                            }}
                                            aria-valuenow={dist.percentage}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        ></div>
                                    </div>
                                    <div
                                        className="text-muted small text-end"
                                        style={{ minWidth: '80px' }}
                                    >
                                        {dist.count} ({dist.percentage.toFixed(0)}%)
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted py-3">
                                Chưa có dữ liệu phân bố
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewStatistics;
