import React from 'react';
import styles from './SubscriptionInfo.module.scss';

interface SkeletonInfoItemProps {
    labelWidth: string;
    contentWidth: string;
    contentHeight?: string;
    contentType?: 'text' | 'badge';
}

const SkeletonInfoItem: React.FC<SkeletonInfoItemProps> = ({
    labelWidth,
    contentWidth,
    contentHeight = '24px',
    contentType = 'text',
}) => {
    const ContentComponent = contentType === 'badge' ? styles.skeletonBadge : styles.skeletonText;
    return (
        <div className={styles.infoItem}>
            <div className={styles.skeletonLabel} style={{ width: labelWidth }}></div>
            <div
                className={ContentComponent}
                style={{
                    width: contentWidth,
                    height: contentHeight,
                    marginTop: '0.5rem',
                }}
            ></div>
        </div>
    );
};

const SubscriptionInfoSkeleton: React.FC = () => {
    return (
        <div className={`content ${styles.subscriptionInfoPage}`}>
            <div className={styles.contentWrapper}>
                {/* Header Skeleton */}
                <div className={styles.headerSection}>
                    <div
                        className={styles.skeletonTitle}
                        style={{ width: '250px', height: '28px' }}
                    ></div>
                    <div
                        className={styles.skeletonText}
                        style={{ width: '400px', height: '16px', marginTop: '0.5rem' }}
                    ></div>
                </div>

                <div className="row">
                    {/* Left Column: Subscription Card Skeleton */}
                    <div className="col-md-4">
                        <div className={styles.subscriptionCard}>
                            <div className={styles.cardHeader}>
                                <div
                                    className={styles.skeletonTitle}
                                    style={{ width: '180px', height: '24px' }}
                                ></div>
                            </div>
                            <div className={styles.cardBody}>
                                {/* Package Name */}
                                <SkeletonInfoItem labelWidth="80px" contentWidth="150px" />

                                {/* Billing Cycle */}
                                <SkeletonInfoItem
                                    labelWidth="120px"
                                    contentWidth="100px"
                                    contentType="badge"
                                />

                                {/* Price */}
                                <SkeletonInfoItem labelWidth="50px" contentWidth="120px" />

                                {/* Date Range */}
                                <div className={styles.infoItem}>
                                    <div
                                        className={styles.skeletonLabel}
                                        style={{ width: '80px' }}
                                    ></div>
                                    <div className="d-flex align-items-center gap-2 mt-2">
                                        <div
                                            className={styles.skeletonBadge}
                                            style={{ width: '100px', height: '20px' }}
                                        ></div>
                                        <div
                                            className={styles.skeletonText}
                                            style={{ width: '10px', height: '16px' }}
                                        ></div>
                                        <div
                                            className={styles.skeletonBadge}
                                            style={{ width: '100px', height: '20px' }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Status */}
                                <SkeletonInfoItem
                                    labelWidth="80px"
                                    contentWidth="100px"
                                    contentType="badge"
                                />

                                {/* Features */}
                                <div className={styles.infoItem}>
                                    <div
                                        className={styles.skeletonLabel}
                                        style={{ width: '80px' }}
                                    ></div>
                                    <div className="mt-2">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <div
                                                key={`subscription-feature-${index}`}
                                                className="d-flex align-items-center mb-2"
                                            >
                                                <div
                                                    className={styles.skeletonIcon}
                                                    style={{
                                                        width: '16px',
                                                        height: '16px',
                                                        marginRight: '0.5rem',
                                                    }}
                                                ></div>
                                                <div
                                                    className={styles.skeletonText}
                                                    style={{
                                                        width: `${150 + index * 20}px`,
                                                        height: '16px',
                                                    }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Usage Card Skeleton */}
                    <div className="col-md-8">
                        <div className={styles.usageCard}>
                            <div className={styles.usageHeader}>
                                <div
                                    className={styles.skeletonTitle}
                                    style={{ width: '200px', height: '24px' }}
                                ></div>
                            </div>
                            <div className={styles.cardBody}>
                                {/* Usage Progress Bars */}
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div
                                        key={`usage-progress-${index}`}
                                        className={styles.skeletonProgressBar}
                                    >
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div
                                                className={styles.skeletonLabel}
                                                style={{ width: '120px', height: '18px' }}
                                            ></div>
                                            <div
                                                className={styles.skeletonText}
                                                style={{ width: '150px', height: '16px' }}
                                            ></div>
                                        </div>
                                        <div
                                            className={styles.skeletonText}
                                            style={{
                                                width: '250px',
                                                height: '14px',
                                                marginBottom: '0.5rem',
                                            }}
                                        ></div>
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <div
                                                className={styles.skeletonText}
                                                style={{ width: '100px', height: '14px' }}
                                            ></div>
                                            <div
                                                className={styles.skeletonText}
                                                style={{ width: '80px', height: '14px' }}
                                            ></div>
                                        </div>
                                        <div className={styles.skeletonProgress}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upgrade Card Skeleton */}
                <div className={styles.upgradeCard}>
                    <div className={styles.cardBody}>
                        <div
                            className={styles.skeletonText}
                            style={{ width: '100%', height: '16px', marginBottom: '1rem' }}
                        ></div>
                        <div
                            className={styles.skeletonText}
                            style={{ width: '80%', height: '16px', marginBottom: '1rem' }}
                        ></div>
                        <div
                            className={styles.skeletonButton}
                            style={{ width: '150px', height: '38px' }}
                        ></div>
                    </div>
                </div>

                {/* Subscription History Skeleton */}
                <div className="mt-4">
                    <div className="p-3 bg-white rounded border">
                        <div
                            className={styles.skeletonTitle}
                            style={{ width: '250px', height: '20px', marginBottom: '1rem' }}
                        ></div>
                        <div className="d-flex flex-column gap-2">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div
                                    key={`subscription-history-${index}`}
                                    className={styles.skeletonHistoryItem}
                                >
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center gap-3">
                                            <div
                                                className={styles.skeletonBadge}
                                                style={{ width: '120px', height: '24px' }}
                                            ></div>
                                            <div
                                                className={styles.skeletonText}
                                                style={{ width: '150px', height: '16px' }}
                                            ></div>
                                            <div
                                                className={styles.skeletonText}
                                                style={{ width: '100px', height: '16px' }}
                                            ></div>
                                        </div>
                                        <div
                                            className={styles.skeletonBadge}
                                            style={{ width: '80px', height: '24px' }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionInfoSkeleton;
