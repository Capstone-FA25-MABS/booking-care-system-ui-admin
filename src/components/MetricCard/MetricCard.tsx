import React from 'react';
import styles from './MetricCard.module.scss';

interface MetricCardProps {
    label: string;
    value: number;
    sub: string;
    className?: string;
    icon?: string;
    formatDecimal?: boolean;
}

const numberFormatter = new Intl.NumberFormat('vi-VN');
const decimalFormatter = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

export const MetricCard: React.FC<MetricCardProps> = ({
    label,
    value,
    sub,
    className,
    icon,
    formatDecimal,
}) => {
    const formattedValue = formatDecimal
        ? decimalFormatter.format(value)
        : numberFormatter.format(value);

    // Get color class from styles if className matches a predefined style
    const getColorClass = () => {
        if (!className) return '';
        // Map className string to styles module class
        const colorClassMap: Record<string, string> = {
            total: styles.total,
            completed: styles.completed,
            pending: styles.pending,
            cancelled: styles.cancelled,
            newPatients: styles.newPatients,
            cardSpecialty: styles.cardSpecialty,
            cardDoctorServices: styles.cardDoctorServices,
            cardDoctors: styles.cardDoctors,
            cardMedicalServices: styles.cardMedicalServices,
        };
        return colorClassMap[className] || className;
    };

    return (
        <div className={`${styles.metricCard} ${getColorClass()}`}>
            <div className={styles.metricHeader}>
                <span className={styles.metricBadge}>{label}</span>
                {icon && <i className={`${icon} ${styles.metricIcon}`}></i>}
            </div>
            <p className={styles.metricValue}>{formattedValue}</p>
            <p className={styles.metricSub}>{sub}</p>
        </div>
    );
};
