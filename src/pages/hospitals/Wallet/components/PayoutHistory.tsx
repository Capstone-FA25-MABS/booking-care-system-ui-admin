import React, { useState } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useSelector } from 'react-redux';

import { useHospitalPayoutHistory } from '@/hooks/useHospitalPayoutHistory';
import { PayoutStatus } from '@/types/hospitalPayout.types';
import { RootState } from '@/store';
import { formatCurrency, getPayoutStatusBadge, getBankLogoUrl } from '@/utils/wallet.utils';

import styles from './PayoutHistory.module.scss';

const PayoutHistory: React.FC = () => {
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const hospitalId = hospitalProfile?.id;
    const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

    const { payouts, loading, error, currentPage, totalPages, totalCount, handlePageChange } =
        useHospitalPayoutHistory(hospitalId);

    const handleLogoError = (payoutId: string) => {
        setFailedLogos((prev) => new Set(prev).add(payoutId));
    };

    const getStatusBadge = (status: PayoutStatus) => {
        const { className, label } = getPayoutStatusBadge(status);
        return <span className={className}>{label}</span>;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
        } catch {
            return 'N/A';
        }
    };

    if (loading && payouts.length === 0) {
        return (
            <div className={styles.loadingContainer}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.payoutHistory}>
            <div className={styles.header}>
                <h4 className={styles.title}>
                    <i className="fas fa-money-bill-wave me-2"></i>
                    Lịch sử thanh toán
                </h4>
                <p className={styles.subtitle}>
                    Tổng số: <strong>{totalCount}</strong> lần thanh toán
                </p>
            </div>

            {payouts.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fas fa-inbox fa-3x mb-3 text-muted"></i>
                    <p className="text-muted">Chưa có lịch sử thanh toán</p>
                </div>
            ) : (
                <>
                    <div className={clsx('table-responsive', styles.tableContainer)}>
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                    <th>Kỳ thanh toán</th>
                                    <th>Số cuộc hẹn</th>
                                    <th className="text-end">Tổng tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày hoàn thành</th>
                                    <th>Tài khoản nhận</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payouts.map((payout) => (
                                    <tr key={payout.id}>
                                        <td>
                                            <div className={styles.periodInfo}>
                                                <div className={styles.periodDates}>
                                                    {formatDate(payout.periodStart)} -{' '}
                                                    {formatDate(payout.periodEnd)}
                                                </div>
                                                <small className="text-muted">
                                                    Tạo: {formatDate(payout.createdAt)}
                                                </small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge bg-info">
                                                {payout.appointmentCount}
                                            </span>
                                        </td>
                                        <td className="text-end">
                                            <strong className={styles.amount}>
                                                {formatCurrency(payout.totalAmount)}
                                            </strong>
                                        </td>
                                        <td>{getStatusBadge(payout.status)}</td>
                                        <td>
                                            {payout.processedAt
                                                ? formatDate(payout.processedAt)
                                                : '-'}
                                        </td>
                                        <td>
                                            {payout.bankAccount ? (
                                                <div className={styles.bankAccountInfo}>
                                                    <div className={styles.bankLogoSmall}>
                                                        {failedLogos.has(payout.id) ? (
                                                            <i className="fas fa-university"></i>
                                                        ) : (
                                                            <img
                                                                src={getBankLogoUrl(
                                                                    payout.bankAccount.bankCode
                                                                )}
                                                                alt={payout.bankAccount.bankName}
                                                                onError={() =>
                                                                    handleLogoError(payout.id)
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                    <div className={styles.bankAccountDetails}>
                                                        <div className={styles.accountNumber}>
                                                            {payout.bankAccount.accountNumber}
                                                        </div>
                                                        <small className="text-muted">
                                                            {payout.bankAccount.accountName}
                                                        </small>
                                                    </div>
                                                </div>
                                            ) : (
                                                <small className="text-muted">-</small>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <nav>
                                <ul className="pagination justify-content-center">
                                    <li
                                        className={clsx('page-item', {
                                            disabled: currentPage === 1,
                                        })}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <i className="fas fa-chevron-left"></i>
                                        </button>
                                    </li>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                        (page) => (
                                            <li
                                                key={page}
                                                className={clsx('page-item', {
                                                    active: currentPage === page,
                                                })}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        )
                                    )}

                                    <li
                                        className={clsx('page-item', {
                                            disabled: currentPage === totalPages,
                                        })}
                                    >
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <i className="fas fa-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PayoutHistory;
