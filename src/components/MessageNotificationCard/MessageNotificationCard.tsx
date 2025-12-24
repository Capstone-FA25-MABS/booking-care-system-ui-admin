import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './MessageNotificationCard.module.scss';

interface MessageNotificationCardProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: () => void;
    duration?: number;
}

const MessageNotificationCard: React.FC<MessageNotificationCardProps> = ({
    isOpen,
    onClose,
    onNavigate,
    duration = 6000,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    const handleClick = () => {
        onNavigate();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={containerRef}
                    className={styles.container}
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                    }}
                >
                    <div className={styles.cardWrapper}>
                        <button className={styles.card} onClick={handleClick} type="button">
                            {/* Icon Badge */}
                            <div className={styles.iconBadge}>
                                <i className="fa-solid fa-envelope"></i>
                            </div>

                            {/* Content */}
                            <div className={styles.content}>
                                <h6 className={styles.title}>💬 Bạn có tin nhắn mới!</h6>
                                <p className={styles.subtitle}>Nhấp để xem chi tiết</p>
                            </div>
                        </button>

                        {/* Close button - positioned absolutely outside the card button */}
                        <button
                            className={styles.closeButton}
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            type="button"
                            aria-label="Đóng thông báo"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>

                    {/* Progress bar */}
                    {duration > 0 && (
                        <motion.div
                            className={styles.progressBar}
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{
                                duration: duration / 1000,
                                ease: 'linear',
                            }}
                        />
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MessageNotificationCard;
