import React from 'react';
import styles from './Spinner.module.scss';

interface SpinnerProps {
    size?: 'small' | 'medium' | 'large';
    variant?: 'primary' | 'success' | 'info' | 'emergency';
    className?: string;
    centered?: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({
    size = 'medium',
    variant = 'primary',
    className = '',
    centered = false,
}) => {
    const sizeClasses = {
        small: styles.small,
        medium: styles.medium,
        large: styles.large,
    };

    const variantClasses = {
        primary: styles.primary,
        success: styles.success,
        info: styles.info,
        emergency: styles.emergency,
    };

    const containerClass = centered ? styles.centered : '';

    return (
        <div className={`${containerClass} ${className}`}>
            <span
                className={`${styles.loader} ${sizeClasses[size]} ${variantClasses[variant]}`}
            ></span>
        </div>
    );
};

export default Spinner;
