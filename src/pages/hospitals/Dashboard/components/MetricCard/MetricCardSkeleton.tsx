import React from 'react';
import styles from './MetricCard.module.scss';

export const MetricCardSkeleton: React.FC = () => {
    return (
        <div className={`${styles.metricCard} ${styles.skeleton}`}>
            <div className={styles.skeletonBadge}></div>
            <div className={styles.skeletonValue}></div>
            <div className={styles.skeletonSub}></div>
        </div>
    );
};
