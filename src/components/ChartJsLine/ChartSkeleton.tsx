import React from 'react';
import styles from './ChartJsLine.module.scss';

export const ChartSkeleton: React.FC = () => {
    return (
        <div className={styles.chartJsWrapper}>
            <div className={styles.skeletonChart}>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine}></div>
                <div className={styles.skeletonLine}></div>
            </div>
            <div className={styles.chartLegend}>
                <div className={styles.skeletonLegend}></div>
            </div>
        </div>
    );
};
