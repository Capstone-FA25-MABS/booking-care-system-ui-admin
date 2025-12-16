import React from 'react';
import clsx from 'clsx';

import { ReviewFilters as ReviewFiltersType } from '@/types/review.types';

import styles from './ReviewFilters.module.scss';

interface ReviewFiltersProps {
    filters: ReviewFiltersType;
    onFilterChange: (filters: Partial<ReviewFiltersType>) => void;
}

const ReviewFilters: React.FC<ReviewFiltersProps> = ({ filters, onFilterChange }) => {
    const handleRatingFilterChange = (minRating?: number, maxRating?: number) => {
        onFilterChange({ minRating, maxRating });
    };

    const handleClearFilters = () => {
        onFilterChange({
            minRating: undefined,
            maxRating: undefined,
        });
    };

    const hasActiveFilters = filters.minRating !== undefined || filters.maxRating !== undefined;

    return (
        <div className={styles.container}>
            <div className={styles.filterCard}>
                {/* Rating Filters */}
                <div className={styles.ratingSection}>
                    <div className={styles.label}>Lọc theo đánh giá:</div>
                    <div className={styles.ratingButtons}>
                        <button
                            className={clsx(styles.ratingBtn, {
                                [styles.active]:
                                    filters.minRating === undefined &&
                                    filters.maxRating === undefined,
                            })}
                            onClick={() => handleRatingFilterChange()}
                            type="button"
                        >
                            Tất cả
                        </button>
                        <button
                            className={clsx(styles.ratingBtn, {
                                [styles.active]: filters.minRating === 5 && filters.maxRating === 5,
                            })}
                            onClick={() => handleRatingFilterChange(5, 5)}
                            type="button"
                        >
                            <i className="ti ti-star-filled"></i> 5
                        </button>
                        <button
                            className={clsx(styles.ratingBtn, {
                                [styles.active]: filters.minRating === 4 && filters.maxRating === 4,
                            })}
                            onClick={() => handleRatingFilterChange(4, 4)}
                            type="button"
                        >
                            <i className="ti ti-star-filled"></i> 4
                        </button>
                        <button
                            className={clsx(styles.ratingBtn, {
                                [styles.active]: filters.minRating === 3 && filters.maxRating === 3,
                            })}
                            onClick={() => handleRatingFilterChange(3, 3)}
                            type="button"
                        >
                            <i className="ti ti-star-filled"></i> 3
                        </button>
                        <button
                            className={clsx(styles.ratingBtn, {
                                [styles.active]: filters.minRating === 1 && filters.maxRating === 2,
                            })}
                            onClick={() => handleRatingFilterChange(1, 2)}
                            type="button"
                        >
                            <i className="ti ti-star-filled"></i> 1-2
                        </button>
                    </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <div className={styles.clearSection}>
                        <button
                            className={styles.clearFiltersBtn}
                            onClick={handleClearFilters}
                            type="button"
                        >
                            <i className="ti ti-filter-off"></i> Xóa bộ lọc
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewFilters;
