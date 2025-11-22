import React from 'react';
import styles from './DoctorFormSkeleton.module.scss';

const DoctorFormSkeleton: React.FC = () => {
    return (
        <div className={styles.skeletonForm}>
            {/* Basic Info Card */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <div className={styles.skeletonTitle}></div>
                    <div className="row">
                        {/* Avatar Skeleton */}
                        <div className="col-md-3 mb-3">
                            <div className={styles.skeletonAvatar}></div>
                        </div>
                        {/* Basic Info Fields */}
                        <div className="col-md-9">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <div className={styles.skeletonLabel}></div>
                                    <div className={styles.skeletonInput}></div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className={styles.skeletonLabel}></div>
                                    <div className={styles.skeletonInput}></div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className={styles.skeletonLabel}></div>
                                    <div className={styles.skeletonInput}></div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className={styles.skeletonLabel}></div>
                                    <div className={styles.skeletonSelect}></div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className={styles.skeletonLabel}></div>
                                    <div className={styles.skeletonInput}></div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <div className={styles.skeletonLabel}></div>
                                    <div className={styles.skeletonInput}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Bio Editor Skeleton */}
                    <div className="row">
                        <div className="col-12">
                            <div className={styles.skeletonLabel}></div>
                            <div className={styles.skeletonEditor}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Professional Info Card */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <div className={styles.skeletonTitle}></div>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <div className={styles.skeletonLabel}></div>
                            <div className={styles.skeletonSelect}></div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <div className={styles.skeletonLabel}></div>
                            <div className={styles.skeletonSelect}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Languages Section Card */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonLanguageGrid}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div
                                key={`skeleton-language-${index}`}
                                className={styles.skeletonLanguageItem}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Service Prices Section Card */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className={styles.skeletonTitle} style={{ width: '200px' }}></div>
                        <div
                            className={styles.skeletonButton}
                            style={{ width: '120px', height: '38px' }}
                        ></div>
                    </div>
                    <div className={styles.skeletonServicePriceList}>
                        {Array.from({ length: 2 }).map((_, index) => (
                            <div
                                key={`skeleton-service-price-${index}`}
                                className={styles.skeletonServicePriceItem}
                            >
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <div className={styles.skeletonLabel}></div>
                                        <div className={styles.skeletonSelect}></div>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <div className={styles.skeletonLabel}></div>
                                        <div className={styles.skeletonInput}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons Card */}
            <div className="card mb-4">
                <div className={`card-body ${styles.sectionBorder}`}>
                    <div className="text-end">
                        <div
                            className={styles.skeletonButton}
                            style={{
                                width: '100px',
                                height: '38px',
                                display: 'inline-block',
                                marginRight: '0.5rem',
                            }}
                        ></div>
                        <div
                            className={styles.skeletonButton}
                            style={{ width: '150px', height: '38px', display: 'inline-block' }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorFormSkeleton;
