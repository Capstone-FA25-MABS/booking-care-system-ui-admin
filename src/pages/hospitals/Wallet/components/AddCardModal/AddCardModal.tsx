import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

import BaseModal from '@/components/Modal/BaseModal';
import BankSelect from '../BankSelect';
import Button from '@/components/Button';
import { BankAccount, CreateBankAccountRequest } from '@/types/wallet.types';
import { Bank } from '@/types/bank.types';
import { BankAccountValidator, BankAccountValidation } from '@/utils/bankAccountValidator';
import { toast } from 'react-toastify';

interface AddCardFormData {
    cardHolderName: string;
    cardNumber: string;
    bankName: string;
    bankCode: string;
    isDefault: boolean;
}

interface AddCardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateBankAccountRequest) => Promise<void>;
    existingData?: BankAccount | null;
    mode?: 'add' | 'edit';
    userId: string;
    loading?: boolean;
}

const AddCardModal: React.FC<AddCardModalProps> = ({
    isOpen,
    onClose,
    onSave,
    existingData,
    mode = 'add',
    userId,
    loading = false,
}) => {
    const [formData, setFormData] = useState<AddCardFormData>({
        cardHolderName: '',
        cardNumber: '',
        bankName: '',
        bankCode: '',
        isDefault: false,
    });
    const [validation, setValidation] = useState<BankAccountValidation | null>(null);

    // Validate form data
    const validateForm = () => {
        const validationResult: BankAccountValidation = {
            bankCode: BankAccountValidator.validateBankCode(formData.bankCode),
            bankName: BankAccountValidator.validateBankName(formData.bankName),
            accountNumber: BankAccountValidator.validateAccountNumber(formData.cardNumber),
            accountName: BankAccountValidator.validateAccountName(formData.cardHolderName),
            isValid: true,
        };

        validationResult.isValid =
            validationResult.bankCode.isValid &&
            validationResult.bankName.isValid &&
            validationResult.accountNumber.isValid &&
            validationResult.accountName.isValid;

        setValidation(validationResult);

        if (!validationResult.isValid) {
            const firstError = [validationResult.accountNumber, validationResult.accountName].find(
                (rule) => !rule.isValid
            );
            toast.warning(firstError?.message || 'Vui lòng kiểm tra lại thông tin');
            return false;
        }

        return true;
    };

    // Helper function to get error for specific field
    const getFieldError = (fieldName: keyof BankAccountValidation) => {
        if (!validation || fieldName === 'isValid') return null;
        const fieldValidation = validation[fieldName];
        if (typeof fieldValidation === 'object' && 'isValid' in fieldValidation) {
            return !fieldValidation.isValid ? fieldValidation.message : null;
        }
        return null;
    };

    // Helper function to check if field has error
    const hasFieldError = (fieldName: keyof BankAccountValidation) => {
        return getFieldError(fieldName) !== null;
    };

    // Pre-populate form with existing data when editing
    useEffect(() => {
        if (existingData && isOpen) {
            setFormData({
                cardHolderName: existingData.accountName || '',
                cardNumber: existingData.accountNumber || '',
                bankName: existingData.bankName || '',
                bankCode: existingData.bankCode || '',
                isDefault: existingData.isDefault || false,
            });
        } else if (isOpen) {
            setFormData({
                cardHolderName: '',
                cardNumber: '',
                bankName: '',
                bankCode: '',
                isDefault: false,
            });
        }
    }, [existingData, isOpen, mode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleInputBlur = () => {
        const validationResult: BankAccountValidation = {
            bankCode: BankAccountValidator.validateBankCode(formData.bankCode),
            bankName: BankAccountValidator.validateBankName(formData.bankName),
            accountNumber: BankAccountValidator.validateAccountNumber(formData.cardNumber),
            accountName: BankAccountValidator.validateAccountName(formData.cardHolderName),
            isValid: true,
        };

        validationResult.isValid =
            validationResult.bankCode.isValid &&
            validationResult.bankName.isValid &&
            validationResult.accountNumber.isValid &&
            validationResult.accountName.isValid;

        setValidation(validationResult);
    };

    const handleBankChange = (bankCode: string, bank?: Bank) => {
        setFormData((prev) => ({
            ...prev,
            bankName: bank?.name || bankCode,
            bankCode: bankCode,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            const requestData: CreateBankAccountRequest = {
                userId,
                bankCode: formData.bankCode,
                bankName: formData.bankName,
                accountNumber: formData.cardNumber,
                accountName: formData.cardHolderName,
                isDefault: formData.isDefault,
            };

            await onSave(requestData);
            handleClose();
        } catch (error) {
            console.error('Error saving bank account:', error);
        }
    };

    const handleClose = () => {
        setFormData({
            cardHolderName: '',
            cardNumber: '',
            bankName: '',
            bankCode: '',
            isDefault: false,
        });
        setValidation(null);
        onClose();
    };

    const isEditing = mode === 'edit' || (existingData !== null && existingData !== undefined);
    const modalTitle = isEditing ? 'Cập nhật số tài khoản' : 'Thêm số tài khoản';
    const submitButtonText = isEditing ? 'Cập nhật số tài khoản' : 'Thêm số tài khoản';

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={handleClose}
            title={modalTitle}
            titleId="add-card-modal"
            size="md"
        >
            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <div className="mb-3">
                        <label className="form-label" htmlFor="cardHolderName">
                            Tên chủ tài khoản <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            id="cardHolderName"
                            name="cardHolderName"
                            className={clsx('form-control', {
                                'is-invalid': hasFieldError('accountName'),
                            })}
                            value={formData.cardHolderName}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            required
                        />
                        {getFieldError('accountName') && (
                            <div className="invalid-feedback d-block">
                                {getFieldError('accountName')}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="cardNumber">
                            Số tài khoản <span className="text-danger">*</span>
                        </label>
                        <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            className={clsx('form-control', {
                                'is-invalid': hasFieldError('accountNumber'),
                            })}
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            placeholder="1234567890123456"
                            required
                        />
                        {getFieldError('accountNumber') && (
                            <div className="invalid-feedback d-block">
                                {getFieldError('accountNumber')}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label" htmlFor="branch">
                            Ngân hàng <span className="text-danger">*</span>
                        </label>
                        <BankSelect
                            id="branch"
                            value={formData.bankCode}
                            onChange={handleBankChange}
                            placeholder="Chọn ngân hàng của bạn"
                            required={true}
                        />
                    </div>

                    {mode === 'add' && (
                        <div className="mb-3">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    name="isDefault"
                                    checked={formData.isDefault}
                                    onChange={handleInputChange}
                                    className="form-check-input"
                                />
                                <label htmlFor="isDefault" className="form-check-label">
                                    Đặt làm tài khoản mặc định
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleClose}>
                        Huỷ
                    </button>
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? 'Đang xử lý...' : submitButtonText}
                    </Button>
                </div>
            </form>
        </BaseModal>
    );
};

export default AddCardModal;
