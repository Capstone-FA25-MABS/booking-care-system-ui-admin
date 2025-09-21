import React from 'react';
import Spinner from '@/components/Spinner';
import styles from './FullScreenSpinner.module.scss';

interface FullScreenSpinnerProps {
    isVisible: boolean;
    message?: string;
}

const FullScreenSpinner: React.FC<FullScreenSpinnerProps> = ({
    isVisible,
    message = 'Đang xử lý...',
}) => {
    if (!isVisible) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.spinnerContainer}>
                <Spinner size="large" variant="primary" />
                {message && <p className={styles.message}>{message}</p>}
            </div>
        </div>
    );
};

export default FullScreenSpinner;
