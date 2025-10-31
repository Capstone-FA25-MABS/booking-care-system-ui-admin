import styles from './SubscriptionPlanSkeletonCard.module.scss';

interface SubscriptionPlanSkeletonCardProps {
    highlighted?: boolean;
}

const SubscriptionPlanSkeletonCard = ({ highlighted }: SubscriptionPlanSkeletonCardProps) => {
    return (
        <div className={`${styles.card} ${highlighted ? styles.highlighted : styles.normal}`}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        {/* Title skeleton */}
                        <div className={styles.skeletonTitle}></div>

                        {/* Price container skeleton */}
                        <div className={styles.priceContainer}>
                            <div className={styles.skeletonPrice}></div>
                            <div className={styles.skeletonPriceSubtext}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Button skeleton */}
            <div className={styles.skeletonButton}></div>

            {/* Features list skeleton */}
            <ul className={styles.featuresList}>
                {[...Array(6)].map((_, index) => (
                    <li key={index} className={styles.featureItem}>
                        <div className={styles.skeletonFeatureIcon}></div>
                        <div className={styles.featureContent}>
                            <div className={styles.skeletonFeatureText}></div>
                            {index < 2 && <div className={styles.skeletonFeatureSubtext}></div>}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubscriptionPlanSkeletonCard;
