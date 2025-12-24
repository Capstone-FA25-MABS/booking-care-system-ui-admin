import React from 'react';
import { Button } from 'react-bootstrap';
import { FiPlus, FiList } from 'react-icons/fi';

import { BankAccount } from '@/types/wallet.types';
import styles from './WalletSummary.module.scss';

interface WalletSummaryProps {
    defaultAccount: BankAccount | null;
    onAddCard: () => void;
    onEditDetails: () => void;
    onOtherAccounts: () => void;
    accountsCount?: number;
    loading?: boolean;
}

const WalletSummary: React.FC<WalletSummaryProps> = ({
    defaultAccount,
    onAddCard,
    onEditDetails,
    onOtherAccounts,
    accountsCount = 0,
    loading = false,
}) => {
    const hasCardDetails = defaultAccount !== null;

    const getValue = (value: string | undefined | null, fallback = 'Chưa được thêm') => {
        if (loading) return { text: 'Đang tải...', isPlaceholder: true };
        const hasValue = value !== null && value !== undefined && value !== '';
        return { text: hasValue ? value : fallback, isPlaceholder: !hasValue };
    };

    const renderValue = (value: string | undefined | null) => {
        const { text, isPlaceholder } = getValue(value);
        return (
            <span className={`${styles.value} ${isPlaceholder ? styles.placeholder : ''}`}>
                {text}
            </span>
        );
    };

    return (
        <div className={styles.walletSummaryCard}>
            <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.indicator}></div>
                    <h5 className={styles.title}>Tài khoản ngân hàng</h5>
                </div>
                <button
                    className={styles.setupButton}
                    onClick={hasCardDetails ? onEditDetails : onAddCard}
                >
                    {hasCardDetails ? 'Chỉnh sửa' : 'Chưa thiết lập'}
                </button>
            </div>

            <div className={styles.cardContent}>
                <div className={styles.accountDetails}>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Tên chủ tài khoản:</span>
                        {renderValue(defaultAccount?.accountName)}
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Số tài khoản:</span>
                        {renderValue(defaultAccount?.accountNumber)}
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Tên ngân hàng:</span>
                        {renderValue(defaultAccount?.bankName)}
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.label}>Chi nhánh:</span>
                        {renderValue(defaultAccount?.bankCode)}
                    </div>
                </div>

                <div className={styles.illustration}>
                    <div className={styles.iconWrapper}>
                        <i className="ti ti-building-bank"></i>
                    </div>
                    <p className={styles.illustrationText}>
                        Liên kết tài khoản ngân hàng để nhận thanh toán nhanh chóng và an toàn.
                    </p>
                </div>
            </div>

            <div className={styles.cardActions}>
                <Button variant="primary" size="sm" onClick={onAddCard} className={styles.addBtn}>
                    <FiPlus className="me-1" />
                    Thêm tài khoản ngân hàng
                </Button>
                <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={onOtherAccounts}
                    className={styles.viewAllBtn}
                >
                    <FiList className="me-1" />
                    Tất cả các tài khoản {accountsCount > 0 && `(${accountsCount})`}
                </Button>
            </div>
        </div>
    );
};

export default WalletSummary;
