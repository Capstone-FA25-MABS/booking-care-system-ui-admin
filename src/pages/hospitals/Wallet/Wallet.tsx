import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import { FiCalendar } from 'react-icons/fi';

import AddCardModal from './components/AddCardModal';
import WalletSummary from './components/WalletSummary';
import OtherAccountsModal from './components/OtherAccountsModal';
import PayoutHistory, { PayoutHistoryRef } from './components/PayoutHistory';
import GeneratePayoutsModal from './components/GeneratePayoutsModal';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { CreateBankAccountRequest } from '@/types/wallet.types';
import { RootState } from '@/store';
import { toast } from 'react-toastify';

const Wallet: React.FC = () => {
    // Get hospital ID from Redux profile
    const { hospitalProfile } = useSelector((state: RootState) => state.user);
    const hospitalId = hospitalProfile?.id;

    // Ref for PayoutHistory component
    const payoutHistoryRef = useRef<PayoutHistoryRef>(null);

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
    const [showGenerateModal, setShowGenerateModal] = useState(false);
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
            <div className="content">
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-3 pb-3 border-bottom">
                    <div className="flex-grow-1">
                        <h4 className="fw-bold mb-0">Quản lý tài khoản ngân hàng</h4>
                    </div>
                </div>
                <div className="text-center p-4">
                    <p>Đang tải thông tin bệnh viện...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="content">
            <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-4 pb-3 border-bottom">
                <div className="flex-grow-1">
                    <h4 className="fw-bold mb-1">Quản lý tài khoản ngân hàng</h4>
                    <p className="text-muted mb-0 fs-14">
                        Quản lý thông tin thanh toán và lịch sử giao dịch của phòng khám.
                    </p>
                </div>
                <div className="text-end d-flex">
                    <Button
                        variant="primary"
                        onClick={() => setShowGenerateModal(true)}
                        disabled={!defaultAccount}
                    >
                        <FiCalendar className="me-2" />
                        Yêu cầu thanh toán
                    </Button>
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

            <PayoutHistory ref={payoutHistoryRef} />

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

            <GeneratePayoutsModal
                show={showGenerateModal}
                onHide={() => setShowGenerateModal(false)}
                onSuccess={() => {
                    setShowGenerateModal(false);
                    toast.success('Yêu cầu thanh toán đã được tạo thành công!');
                    // Refresh payout history to show the new payout
                    payoutHistoryRef.current?.refresh();
                }}
                hospitalId={hospitalId}
                hospitalName={hospitalProfile?.name || ''}
            />
        </div>
    );
};

export default Wallet;
