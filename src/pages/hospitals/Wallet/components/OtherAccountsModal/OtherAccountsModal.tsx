import React, { useState } from 'react';
import clsx from 'clsx';

import BaseModal from '@/components/Modal/BaseModal';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';
import Button from '@/components/Button';
import { BankAccount } from '@/types/wallet.types';
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
                    <div className={styles.accountsList}>
                        {accounts.map((account) => (
                            <div key={account.id} className={clsx(styles.accountItem, 'card mb-3')}>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="mb-2">
                                                <strong>Tên ngân hàng:</strong>{' '}
                                                <span>{account.bankName}</span>
                                            </div>
                                            <div className="mb-2">
                                                <strong>Mã ngân hàng:</strong>{' '}
                                                <span>{account.bankCode}</span>
                                            </div>
                                            <div className="mb-2">
                                                <strong>Số tài khoản:</strong>{' '}
                                                <span>{account.accountNumber}</span>
                                            </div>
                                            <div className="mb-2">
                                                <strong>Tên tài khoản:</strong>{' '}
                                                <span>{account.accountName}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4 d-flex flex-column justify-content-center align-items-end">
                                            {account.isDefault ? (
                                                <span className="badge bg-primary mb-2">
                                                    Mặc định
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary mb-2"
                                                    onClick={() => handleSetDefault(account.id)}
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Đang xử lý...' : 'Đặt làm mặc định'}
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                className={clsx('btn btn-sm btn-outline-danger', {
                                                    disabled: account.isDefault || loading,
                                                })}
                                                onClick={() => handleDelete(account.id)}
                                                disabled={account.isDefault || loading}
                                                title={
                                                    account.isDefault
                                                        ? 'Không thể xóa tài khoản mặc định'
                                                        : 'Xóa tài khoản'
                                                }
                                            >
                                                <i className="fa-solid fa-trash me-1"></i>
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {accounts.length === 0 && (
                            <div className="text-center p-4">
                                <p className="text-muted">Không tìm thấy tài khoản ngân hàng</p>
                            </div>
                        )}
                    </div>
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
