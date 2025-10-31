import styles from './SubscriptionPlanCard.module.scss';
import Button from '@/components/Button';

interface Feature {
    icon: React.ReactNode;
    text: string;
    subtext?: string;
    iconType?: 'check' | 'plus';
}

interface SubscriptionPlanCardProps {
    title: string;
    price: string;
    priceSubtext?: string;
    buttonText: string;
    buttonVariant: 'primary' | 'secondary';
    features: Feature[];
    badge?: string;
    highlighted?: boolean;
    isCurrentPlan?: boolean;
    onUpgrade?: () => void;
    startDate?: string;
    endDate?: string;
}

const SubscriptionPlanCard = ({
    title,
    price,
    priceSubtext,
    buttonText,
    buttonVariant,
    features,
    badge,
    highlighted,
    isCurrentPlan,
    onUpgrade,
    startDate,
    endDate,
}: SubscriptionPlanCardProps) => {
    // Format date to display
    const formatDisplayDate = (dateString?: string): string => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className={`${styles.card} ${highlighted ? styles.highlighted : styles.normal}`}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <p className={styles.title}>{title}</p>
                        <div className={styles.priceContainer}>
                            <h2 className={styles.price}>{price}</h2>
                            {priceSubtext && (
                                <span className={styles.priceSubtext}>{priceSubtext}</span>
                            )}
                        </div>
                        {(startDate || endDate) && (
                            <div className={styles.dateInfo}>
                                <p className={styles.dateText}>
                                    {startDate && (
                                        <>
                                            <span className={styles.dateLabel}>Bắt đầu:</span>{' '}
                                            <span className="fs-13 badge rounded fw-medium badge-soft-info text-info">
                                                {formatDisplayDate(startDate)}
                                            </span>
                                        </>
                                    )}
                                    {startDate && endDate && (
                                        <span className={styles.dateSeparator}> • </span>
                                    )}
                                    {endDate && (
                                        <>
                                            <span className={styles.dateLabel}>Hết hạn:</span>{' '}
                                            <span className="fs-13 badge rounded fw-medium badge-soft-info text-info">
                                                {formatDisplayDate(endDate)}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {badge && <span className={styles.badge}>{badge}</span>}
            </div>

            <Button
                type="button"
                variant={buttonVariant === 'primary' ? 'primary' : 'secondary'}
                className={`${styles.upgradeButton} ${
                    buttonVariant === 'primary' ? styles.primary : styles.secondary
                }`}
                disabled={isCurrentPlan}
                onClick={onUpgrade}
            >
                {buttonText}
            </Button>

            <ul className={styles.featuresList}>
                {features.map((feature, index) => {
                    const isPlusIcon = feature.iconType === 'plus';

                    return (
                        <li key={`${feature.text}-${index}`} className={styles.featureItem}>
                            <span
                                className={`${styles.featureIcon} ${isPlusIcon ? styles.plusIcon : styles.checkIcon}`}
                            >
                                {feature.icon}
                            </span>
                            <div className={styles.featureContent}>
                                <p className={styles.featureText}>{feature.text}</p>
                                {feature.subtext && (
                                    <p className={styles.featureSubtext}>{feature.subtext}</p>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default SubscriptionPlanCard;
