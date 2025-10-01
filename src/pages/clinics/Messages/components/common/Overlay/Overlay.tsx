import React from 'react';
import styles from './Overlay.module.scss';

interface OverlayProps {
    isVisible: boolean;
    onClick: () => void;
    className?: string;
}

const Overlay: React.FC<OverlayProps> = ({ isVisible, onClick, className = '' }) => {
    if (!isVisible) return null;

    return (
        <button
            className={`${styles.overlay} ${className}`}
            onClick={onClick}
            type="button"
            aria-label="Đóng"
        />
    );
};

export default Overlay;
