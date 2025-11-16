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
    originalPrice?: string;
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
    originalPrice,
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

    // Determine badge to show on top right
    const getTopBadge = () => {
        if (badge) return { text: badge, type: 'popular' };
        if (originalPrice) return { text: 'Giảm giá', type: 'discount' };
        if (price === '0 VNĐ') return { text: 'Miễn phí', type: 'free' };
        return null;
    };

    const topBadge = getTopBadge();

    return (
        <div className={`${styles.card} ${highlighted ? styles.highlighted : styles.normal}`}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <div className={styles.titleSection}>
                        <span
                            className={`${styles.titleBadge} badge rounded fw-bold badge-soft-info text-info`}
                        >
                            {title}
                        </span>
                        <div className={styles.priceContainer}>
                            {originalPrice && (
                                <div className={styles.originalPriceWrapper}>
                                    <span className={styles.originalPriceLabel}>Giá gốc:</span>
                                    <h2 className={styles.originalPrice}>{originalPrice}</h2>
                                    <span className={styles.originalPriceBadge}>Tiết kiệm</span>
                                </div>
                            )}
                            <h2 className={styles.price}>{price}</h2>
                            {priceSubtext && (
                                <span className={styles.priceSubtext}>{priceSubtext}</span>
                            )}
                        </div>
                        {(startDate || endDate) && (
                            <div className={styles.dateInfo}>
                                <div className={styles.dateText}>
                                    {startDate && (
                                        <div>
                                            <span className={styles.dateLabel}>Ngày bắt đầu:</span>{' '}
                                            <span className="fs-13 badge rounded fw-medium badge-soft-info text-info">
                                                {formatDisplayDate(startDate)}
                                            </span>
                                        </div>
                                    )}
                                    {endDate && (
                                        <div>
                                            <span className={styles.dateLabel}>Ngày hết hạn:</span>{' '}
                                            <span className="fs-13 badge rounded fw-medium badge-soft-info text-info">
                                                {formatDisplayDate(endDate)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {topBadge && (
                    <span
                        className={`${styles.badge} ${
                            topBadge.type === 'free'
                                ? styles.badgeFree
                                : topBadge.type === 'discount'
                                  ? styles.badgeDiscount
                                  : ''
                        }`}
                    >
                        {topBadge.text}
                    </span>
                )}
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
