import React, { useState } from 'react';
import clsx from 'clsx';

import BaseModal from '@/components/Modal/BaseModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import Button from '@/components/Button';
import { BankAccount } from '@/types/wallet.types';
import { getBankLogoUrl } from '@/utils/wallet.utils';
import styles from './OtherAccountsModal.module.scss';

interface OtherAccountsModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: BankAccount[];
    onSetDefault: (accountId: string) => void;
    onDelete: (accountId: string) => void;
    loading?: boolean;
}

const OtherAccountsModal: React.FC<OtherAccountsModalProps> = ({
    isOpen,
    onClose,
    accounts,
    onSetDefault,
    onDelete,
    loading = false,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
    const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

    const handleLogoError = (accountId: string) => {
        setFailedLogos((prev) => new Set(prev).add(accountId));
    };

    const handleSetDefault = (accountId: string) => {
        onSetDefault(accountId);
    };

    const handleDelete = (accountId: string) => {
        const account = accounts.find((acc) => acc.id === accountId);
        if (account?.isDefault) {
            alert(
                'Không thể xóa tài khoản mặc định. Vui lòng đặt tài khoản khác làm mặc định trước.'
            );
            return;
        }

        setAccountToDelete(accountId);
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = () => {
        if (accountToDelete) {
            onDelete(accountToDelete);
        }
        setAccountToDelete(null);
        setShowDeleteConfirm(false);
    };

    const handleCloseDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setAccountToDelete(null);
    };

    return (
        <>
            <BaseModal
                isOpen={isOpen}
                onClose={onClose}
                title="Tất cả các tài khoản ngân hàng"
                titleId="other-accounts-modal"
                size="lg"
            >
                <div className="modal-body">
                    {accounts.length === 0 ? (
                        <div className={styles.emptyState}>
                            <i className="fas fa-wallet fa-3x mb-3"></i>
                            <p>Không tìm thấy tài khoản ngân hàng</p>
                        </div>
                    ) : (
                        <div className={styles.accountsList}>
                            {accounts.map((account) => (
                                <div
                                    key={account.id}
                                    className={clsx(styles.accountCard, {
                                        [styles.defaultAccount]: account.isDefault,
                                    })}
                                >
                                    {/* Header with badge */}
                                    <div className={styles.accountHeader}>
                                        <div className={styles.bankInfo}>
                                            <div className={styles.bankIconWrapper}>
                                                {failedLogos.has(account.id) ? (
                                                    <i className="fas fa-university"></i>
                                                ) : (
                                                    <img
                                                        src={getBankLogoUrl(account.bankCode)}
                                                        alt={account.bankName}
                                                        className={styles.bankLogo}
                                                        onError={() => handleLogoError(account.id)}
                                                    />
                                                )}
                                            </div>
                                            <div className={styles.bankDetails}>
                                                <h5 className={styles.bankName}>
                                                    {account.bankName}
                                                </h5>
                                                <div className={styles.bankMeta}>
                                                    <span className={styles.bankCodeBadge}>
                                                        {account.bankCode}
                                                    </span>
                                                    <span className={styles.separator}>•</span>
                                                    <span className={styles.bankId}>
                                                        ID: {account.id.slice(0, 8)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {account.isDefault && (
                                            <span className={styles.defaultBadge}>
                                                <i className="fas fa-star me-1"></i>
                                                Mặc định
                                            </span>
                                        )}
                                    </div>

                                    {/* Divider */}
                                    <div className={styles.divider}></div>

                                    {/* Account Details */}
                                    <div className={styles.accountDetails}>
                                        <div className={styles.detailRow}>
                                            <div className={styles.detailLabel}>
                                                <i className="fas fa-hashtag"></i>
                                                <span>Số tài khoản</span>
                                            </div>
                                            <div className={styles.detailValue}>
                                                {account.accountNumber}
                                            </div>
                                        </div>

                                        <div className={styles.detailRow}>
                                            <div className={styles.detailLabel}>
                                                <i className="fas fa-user"></i>
                                                <span>Tên tài khoản</span>
                                            </div>
                                            <div className={styles.detailValue}>
                                                {account.accountName}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className={styles.accountActions}>
                                        {!account.isDefault && (
                                            <button
                                                type="button"
                                                className={styles.setDefaultBtn}
                                                onClick={() => handleSetDefault(account.id)}
                                                disabled={loading}
                                            >
                                                <i className="fas fa-star me-2"></i>
                                                {loading ? 'Đang xử lý...' : 'Đặt làm mặc định'}
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(account.id)}
                                            disabled={account.isDefault || loading}
                                            title={
                                                account.isDefault
                                                    ? 'Không thể xóa tài khoản mặc định'
                                                    : 'Xóa tài khoản'
                                            }
                                        >
                                            <i className="fas fa-trash-alt me-2"></i>
                                            Xóa tài khoản
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Đóng
                    </Button>
                </div>
            </BaseModal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleConfirmDelete}
                title="Xác nhận xóa"
                message="Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?"
                confirmText="Xóa"
                cancelText="Hủy"
            />
        </>
    );
};

export default OtherAccountsModal;
