import React from 'react';
import styles from './HospitalServiceTypesManagement.module.scss';

const ServiceTypeCardSkeleton: React.FC = () => {
    return (
        <div className={`${styles.serviceTypeCard} ${styles.skeletonCard}`}>
            <div className={styles.serviceTypeCardContent}>
                <div className={styles.skeletonCheckbox}></div>
                <div className={`${styles.serviceTypeImage} ${styles.skeletonImage}`}></div>
                <div className={`${styles.serviceTypeName} ${styles.skeletonText}`}></div>
            </div>
        </div>
    );
};

export default ServiceTypeCardSkeleton;
