import { useState, useEffect } from 'react';
import { X, CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import PaymentMethodService from '@/services/paymentMethod.service';
import type { PaymentMethod } from '@/types/paymentMethod.types';
import styles from './PaymentMethodSelectionModal.module.scss';

interface PaymentMethodSelectionModalProps {
    planName: string;
    planPrice: string;
    onClose: () => void;
    onConfirm: (paymentMethodId: string) => void;
}

const PaymentMethodSelectionModal: React.FC<PaymentMethodSelectionModalProps> = ({
    planName,
    planPrice,
    onClose,
    onConfirm,
}) => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        // Handle Escape key to close modal
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !submitting) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [onClose, submitting]);

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        try {
            setLoading(true);
            const response = await PaymentMethodService.getActivePaymentMethods();

            if (response.success && response.data) {
                // Filter only ACTIVE payment methods
                const activeMethods = Array.isArray(response.data)
                    ? response.data.filter((pm) => pm.status === 'ACTIVE')
                    : [];

                setPaymentMethods(activeMethods);

                // Auto-select first payment method if available
                if (activeMethods.length > 0) {
                    setSelectedPaymentMethodId(activeMethods[0].id);
                }
            } else {
                toast.error('Không thể tải danh sách phương thức thanh toán');
            }
        } catch (error: any) {
            console.error('Error loading payment methods:', error);
            toast.error(error.message || 'Có lỗi xảy ra khi tải phương thức thanh toán');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!selectedPaymentMethodId) {
            toast.error('Vui lòng chọn phương thức thanh toán');
            return;
        }

        setSubmitting(true);
        try {
            onConfirm(selectedPaymentMethodId);
        } catch {
            // Error handling is done in parent component
            setSubmitting(false);
        }
    };

    const handleBackdropClick = () => {
        if (!submitting) {
            onClose();
        }
    };

    return (
        <dialog
            open
            className="modal fade show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            aria-labelledby="payment-method-modal-title"
        >
            {/* Backdrop overlay */}
            <button
                type="button"
                onClick={handleBackdropClick}
                aria-label="Đóng modal"
                disabled={submitting}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    zIndex: 0,
                }}
            />

            <div
                className="modal-dialog modal-dialog-centered"
                style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}
            >
                <div className={`modal-content ${styles.modalContent}`}>
                    {/* Header */}
                    <div className={styles.modalHeader}>
                        <div className={styles.headerContent}>
                            <CreditCard size={24} className={styles.headerIcon} />
                            <div>
                                <h5 id="payment-method-modal-title" className={styles.modalTitle}>
                                    Chọn phương thức thanh toán
                                </h5>
                                <p className={styles.modalSubtitle}>
                                    Đăng ký gói: <strong>{planName}</strong>
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className={styles.closeButton}
                            onClick={onClose}
                            aria-label="Đóng"
                            disabled={submitting}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className={styles.modalBody}>
                        {/* Plan Summary */}
                        <div className={styles.planSummary}>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Gói dịch vụ:</span>
                                <span className={styles.summaryValue}>{planName}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Tổng thanh toán:</span>
                                <span className={styles.summaryPrice}>{planPrice}</span>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className={styles.paymentMethodsSection}>
                            <h6 className={styles.sectionTitle}>Phương thức thanh toán</h6>

                            {(() => {
                                if (loading) {
                                    return (
                                        <div className={styles.loadingContainer}>
                                            <Loader2 size={32} className={styles.spinner} />
                                            <p>Đang tải phương thức thanh toán...</p>
                                        </div>
                                    );
                                }

                                if (paymentMethods.length === 0) {
                                    return (
                                        <div className={styles.emptyContainer}>
                                            <CreditCard size={48} className={styles.emptyIcon} />
                                            <p>Không có phương thức thanh toán nào khả dụng</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div className={styles.paymentMethodsList}>
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.id}
                                                type="button"
                                                className={`${styles.paymentMethodCard} ${
                                                    selectedPaymentMethodId === method.id
                                                        ? styles.selected
                                                        : ''
                                                }`}
                                                onClick={() =>
                                                    setSelectedPaymentMethodId(method.id)
                                                }
                                                disabled={submitting}
                                            >
                                                <div className={styles.methodContent}>
                                                    {method.imageUrl ? (
                                                        <img
                                                            src={method.imageUrl}
                                                            alt={method.name}
                                                            className={styles.methodImage}
                                                        />
                                                    ) : (
                                                        <div
                                                            className={styles.methodIconPlaceholder}
                                                        >
                                                            <CreditCard size={24} />
                                                        </div>
                                                    )}
                                                    <div className={styles.methodInfo}>
                                                        <h6 className={styles.methodName}>
                                                            {method.name}
                                                        </h6>
                                                        {method.description && (
                                                            <p className={styles.methodDescription}>
                                                                {method.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {selectedPaymentMethodId === method.id && (
                                                    <CheckCircle2
                                                        size={24}
                                                        className={styles.checkIcon}
                                                    />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.modalFooter}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className={styles.confirmButton}
                            onClick={handleConfirm}
                            disabled={!selectedPaymentMethodId || loading || submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={18} className={styles.buttonSpinner} />
                                    Đang xử lý...
                                </>
                            ) : (
                                'Xác nhận thanh toán'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </dialog>
    );
};

export default PaymentMethodSelectionModal;
