import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './ConfirmDialog.module.scss';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    icon?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'danger',
    icon,
}) => {
    // Prevent body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            // Save current overflow style
            const originalStyle = window.getComputedStyle(document.body).overflow;
            // Prevent scrolling
            document.body.style.overflow = 'hidden';

            // Cleanup function to restore scroll
            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    const getIcon = () => {
        if (icon) return icon;

        switch (type) {
            case 'danger':
                return 'fa-solid fa-triangle-exclamation';
            case 'warning':
                return 'fa-solid fa-exclamation-circle';
            case 'info':
                return 'fa-solid fa-info-circle';
            default:
                return 'fa-solid fa-question-circle';
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancel}
                    />

                    {/* Dialog */}
                    <motion.div
                        className={clsx(styles.dialog, styles[type])}
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 24,
                        }}
                    >
                        <div className={styles.header}>
                            <div className={clsx(styles.iconContainer, styles[type])}>
                                <i className={getIcon()}></i>
                            </div>
                            <h3 className={styles.title}>{title}</h3>
                        </div>

                        <div className={styles.content}>
                            <p className={styles.message}>{message}</p>
                        </div>

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={handleCancel}
                            >
                                {cancelText}
                            </button>
                            <button
                                type="button"
                                className={clsx(styles.confirmBtn, styles[type])}
                                onClick={handleConfirm}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default ConfirmDialog;
