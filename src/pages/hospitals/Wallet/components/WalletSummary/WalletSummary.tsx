import React from 'react';
import clsx from 'clsx';

import { BankAccount } from '@/types/wallet.types';
import styles from '../../Wallet.module.scss';

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

    return (
        <div className={clsx(styles.accountDetailsBox, 'card')}>
            <div className="card-body">
                <div className="row">
                    <div className="col-lg-8">
                        <div className={clsx(styles.bankDetailsInfo)}>
                            <h4 className="mb-3">Tài khoản ngân hàng</h4>
                            <ul className="list-unstyled">
                                <li className="mb-2">
                                    <h6 className="d-inline">Tên chủ tài khoản:</h6>
                                    <h5 className="d-inline ms-2">
                                        {(() => {
                                            if (loading) return 'Đang tải...';
                                            return hasCardDetails
                                                ? defaultAccount.accountName
                                                : 'Chưa được thêm';
                                        })()}
                                    </h5>
                                </li>
                                <li className="mb-2">
                                    <h6 className="d-inline">Số tài khoản:</h6>
                                    <h5 className="d-inline ms-2">
                                        {(() => {
                                            if (loading) return 'Đang tải...';
                                            return hasCardDetails
                                                ? defaultAccount.accountNumber
                                                : 'Chưa được thêm';
                                        })()}
                                    </h5>
                                </li>
                                <li className="mb-2">
                                    <h6 className="d-inline">Tên ngân hàng:</h6>
                                    <h5 className="d-inline ms-2">
                                        {(() => {
                                            if (loading) return 'Đang tải...';
                                            return hasCardDetails
                                                ? defaultAccount.bankName
                                                : 'Chưa được thêm';
                                        })()}
                                    </h5>
                                </li>
                                <li className="mb-2">
                                    <h6 className="d-inline">Mã ngân hàng:</h6>
                                    <h5 className="d-inline ms-2">
                                        {(() => {
                                            if (loading) return 'Đang tải...';
                                            if (hasCardDetails && defaultAccount.bankCode)
                                                return defaultAccount.bankCode;
                                            return 'Chưa được thêm';
                                        })()}
                                    </h5>
                                </li>
                            </ul>
                        </div>
                        <div className={clsx(styles.cardButton, 'mt-3')}>
                            <div className="d-flex align-items-center">
                                <div className={styles.buttonGroup}>
                                    {hasCardDetails && (
                                        <button className="btn btn-link" onClick={onEditDetails}>
                                            Chỉnh sửa chi tiết
                                        </button>
                                    )}
                                    <button className="btn btn-link" onClick={onAddCard}>
                                        Thêm tài khoản ngân hàng
                                    </button>
                                </div>
                                <button className="btn btn-link" onClick={onOtherAccounts}>
                                    Tất cả các tài khoản ngân hàng{' '}
                                    {accountsCount > 0 && `(${accountsCount})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WalletSummary;
