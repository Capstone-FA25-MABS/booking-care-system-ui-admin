import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import AddCardModal from './components/AddCardModal';
import WalletSummary from './components/WalletSummary';
import OtherAccountsModal from './components/OtherAccountsModal';
import PayoutHistory from './components/PayoutHistory';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { CreateBankAccountRequest } from '@/types/wallet.types';
import { RootState } from '@/store';
import { toast } from 'react-toastify';

import styles from './Wallet.module.scss';

const Wallet: React.FC = () => {
    // Get hospital ID from Redux profile
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const hospitalId = hospitalProfile?.id;

    const {
        accounts,
        loading,
        error,
        defaultAccount,
        createAccount,
        setDefaultAccount: setDefaultAccountApi,
        deleteAccount,
        updateAccount,
    } = useBankAccounts(hospitalId || '');

    const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
    const [isOtherAccountsModalOpen, setIsOtherAccountsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    // Handle API errors
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleOpenAddCardModal = () => {
        setModalMode('add');
        setIsAddCardModalOpen(true);
    };

    const handleOpenEditModal = () => {
        setModalMode('edit');
        setIsAddCardModalOpen(true);
    };

    const handleCloseAddCardModal = () => {
        setIsAddCardModalOpen(false);
    };

    const handleOpenOtherAccountsModal = () => {
        setIsOtherAccountsModalOpen(true);
    };

    const handleCloseOtherAccountsModal = () => {
        setIsOtherAccountsModalOpen(false);
    };

    const handleSaveAddCard = async (requestData: CreateBankAccountRequest) => {
        try {
            if (modalMode === 'edit' && defaultAccount) {
                // Update existing account
                const updateData = {
                    id: defaultAccount.id,
                    bankCode: requestData.bankCode,
                    accountNumber: requestData.accountNumber,
                    accountName: requestData.accountName,
                };
                await updateAccount(updateData);
                toast.success('Cập nhật tài khoản thành công!');
            } else {
                // Create new account
                await createAccount(requestData);
                toast.success('Thêm tài khoản ngân hàng thành công!');
            }
            setIsAddCardModalOpen(false);
        } catch (err) {
            console.error('Error saving account:', err);
            toast.error(
                modalMode === 'edit'
                    ? 'Không thể cập nhật tài khoản. Vui lòng thử lại.'
                    : 'Không thể tạo tài khoản. Vui lòng thử lại.'
            );
        }
    };

    const handleSetDefaultAccount = async (accountId: string) => {
        try {
            await setDefaultAccountApi(accountId);
            setIsOtherAccountsModalOpen(false);
            toast.success('Đã đặt tài khoản mặc định thành công!');
        } catch (err) {
            console.error('Error setting default account:', err);
            toast.error('Không thể đặt tài khoản mặc định. Vui lòng thử lại.');
        }
    };

    const handleDeleteAccount = async (accountId: string) => {
        try {
            await deleteAccount(accountId);
            toast.success('Xóa tài khoản thành công!');
        } catch (err) {
            console.error('Error deleting account:', err);
            toast.error('Không thể xóa tài khoản. Vui lòng thử lại.');
        }
    };

    // Show loading if no hospitalId available
    if (!hospitalId) {
        return (
            <div className={clsx(styles.walletContainer, 'page-wrapper')}>
                <div className="content">
                    <div className="page-header">
                        <div className="row">
                            <div className="col-sm-12">
                                <h3 className="page-title">Quản lý tài khoản ngân hàng</h3>
                            </div>
                        </div>
                    </div>
                    <div className="text-center p-4">
                        <p>Đang tải thông tin bệnh viện...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(styles.walletContainer, 'page-wrapper')}>
            <div className="content">
                <div className="page-header">
                    <div className="row">
                        <div className="col-sm-12">
                            <h3 className="page-title">Quản lý tài khoản ngân hàng</h3>
                            <ul className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <a href="/hospital/dashboard">Dashboard</a>
                                </li>
                                <li className="breadcrumb-item active">Tài khoản ngân hàng</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <WalletSummary
                    defaultAccount={defaultAccount}
                    onAddCard={handleOpenAddCardModal}
                    onEditDetails={handleOpenEditModal}
                    onOtherAccounts={handleOpenOtherAccountsModal}
                    accountsCount={accounts.length}
                    loading={loading}
                />

                <PayoutHistory />

                <AddCardModal
                    isOpen={isAddCardModalOpen}
                    onClose={handleCloseAddCardModal}
                    onSave={handleSaveAddCard}
                    existingData={modalMode === 'edit' ? defaultAccount : null}
                    mode={modalMode}
                    userId={hospitalId || ''}
                    loading={loading}
                />

                <OtherAccountsModal
                    isOpen={isOtherAccountsModalOpen}
                    onClose={handleCloseOtherAccountsModal}
                    accounts={accounts}
                    onSetDefault={handleSetDefaultAccount}
                    onDelete={handleDeleteAccount}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default Wallet;
