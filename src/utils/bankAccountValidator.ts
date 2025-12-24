export interface ValidationRule {
    isValid: boolean;
    message: string;
}

export interface BankAccountValidation {
    bankCode: ValidationRule;
    bankName: ValidationRule;
    accountNumber: ValidationRule;
    accountName: ValidationRule;
    isValid: boolean;
}

export class BankAccountValidator {
    /**
     * Validate Bank Code
     */
    static validateBankCode(bankCode: string): ValidationRule {
        if (!bankCode || bankCode.trim() === '') {
            return { isValid: false, message: 'Mã ngân hàng không được để trống' };
        }

        if (bankCode.length > 10) {
            return { isValid: false, message: 'Mã ngân hàng không được vượt quá 10 ký tự' };
        }

        const bankCodeRegex = /^[A-Z0-9]+$/;
        if (!bankCodeRegex.test(bankCode)) {
            return { isValid: false, message: 'Mã ngân hàng chỉ được chứa chữ cái hoa và số' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate Bank Name
     */
    static validateBankName(bankName: string): ValidationRule {
        if (!bankName || bankName.trim() === '') {
            return { isValid: false, message: 'Tên ngân hàng không được để trống' };
        }

        if (bankName.length > 255) {
            return { isValid: false, message: 'Tên ngân hàng không được vượt quá 255 ký tự' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate Account Number
     */
    static validateAccountNumber(accountNumber: string): ValidationRule {
        if (!accountNumber || accountNumber.trim() === '') {
            return { isValid: false, message: 'Số tài khoản không được để trống' };
        }

        if (accountNumber.length < 6) {
            return { isValid: false, message: 'Số tài khoản phải có ít nhất 6 chữ số' };
        }

        if (accountNumber.length > 20) {
            return { isValid: false, message: 'Số tài khoản không được vượt quá 20 chữ số' };
        }

        const accountNumberRegex = /^\d+$/;
        if (!accountNumberRegex.test(accountNumber)) {
            return { isValid: false, message: 'Số tài khoản chỉ được chứa các chữ số' };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate Account Name
     */
    static validateAccountName(accountName: string): ValidationRule {
        if (!accountName || accountName.trim() === '') {
            return { isValid: false, message: 'Tên chủ tài khoản không được để trống' };
        }

        if (accountName.length > 255) {
            return { isValid: false, message: 'Tên chủ tài khoản không được vượt quá 255 ký tự' };
        }

        // Vietnamese characters + Latin letters + spaces (simplified pattern)
        const accountNameRegex = /^[\p{L}\s]+$/u;
        if (!accountNameRegex.test(accountName)) {
            return {
                isValid: false,
                message: 'Tên chủ tài khoản chỉ được chứa chữ cái và khoảng trắng',
            };
        }

        return { isValid: true, message: '' };
    }

    /**
     * Validate entire bank account data
     */
    static validateBankAccount(data: {
        bankCode: string;
        bankName: string;
        accountNumber: string;
        accountName: string;
    }): BankAccountValidation {
        const validation: BankAccountValidation = {
            bankCode: this.validateBankCode(data.bankCode),
            bankName: this.validateBankName(data.bankName),
            accountNumber: this.validateAccountNumber(data.accountNumber),
            accountName: this.validateAccountName(data.accountName),
            isValid: true,
        };

        validation.isValid =
            validation.bankCode.isValid &&
            validation.bankName.isValid &&
            validation.accountNumber.isValid &&
            validation.accountName.isValid;

        return validation;
    }

    /**
     * Get first error message from validation
     */
    static getFirstError(validation: BankAccountValidation): string | null {
        const rules = [
            validation.bankCode,
            validation.bankName,
            validation.accountNumber,
            validation.accountName,
        ];

        const firstError = rules.find((rule) => !rule.isValid);
        return firstError?.message || null;
    }
}
