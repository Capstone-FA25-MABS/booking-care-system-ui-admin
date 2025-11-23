import React from 'react';
import styles from './HospitalSpecialtiesManagement.module.scss';

const SpecialtyCardSkeleton: React.FC = () => {
    return (
        <div className={`${styles.specialtyCard} ${styles.skeletonCard}`}>
            <div className={styles.specialtyCardContent}>
                <div className={styles.skeletonCheckbox}></div>
                <div className={`${styles.specialtyImage} ${styles.skeletonImage}`}></div>
                <div className={`${styles.specialtyName} ${styles.skeletonText}`}></div>
            </div>
        </div>
    );
};

export default SpecialtyCardSkeleton;
