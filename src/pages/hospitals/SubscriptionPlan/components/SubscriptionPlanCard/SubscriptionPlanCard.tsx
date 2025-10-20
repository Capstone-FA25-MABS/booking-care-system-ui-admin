import styles from './SubscriptionPlanCard.module.scss';
import Button from '@/components/Button';

interface Feature {
    icon: React.ReactNode;
    text: string;
    subtext?: string;
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
}: SubscriptionPlanCardProps) => {
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
            >
                {buttonText}
            </Button>

            <ul className={styles.featuresList}>
                {features.map((feature, index) => (
                    <li key={`${feature.text}-${index}`} className={styles.featureItem}>
                        <span className={styles.featureIcon}>{feature.icon}</span>
                        <div className={styles.featureContent}>
                            <p className={styles.featureText}>{feature.text}</p>
                            {feature.subtext && (
                                <p className={styles.featureSubtext}>{feature.subtext}</p>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubscriptionPlanCard;
