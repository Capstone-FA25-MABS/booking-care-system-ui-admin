import axiosInstance from '@/configs/axios.config';
import {
    BankAccount,
    CreateBankAccountRequest,
    UpdateBankAccountRequest,
    BankAccountsResponse,
    ApiResponse,
} from '../types/wallet.types';

export class BankAccountService {
    /**
     * Lấy danh sách bank accounts theo userId (Hospital ID)
     */
    static async getBankAccountsByUserId(userId: string): Promise<BankAccount[]> {
        try {
            const result: ApiResponse<BankAccountsResponse> = await axiosInstance.get(
                `/bankaccounts/user/${userId}`
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch bank accounts');
            }

            return result.data.accounts;
        } catch (error: any) {
            console.error('Error fetching bank accounts:', error);
            throw new Error(error.message || 'Failed to fetch bank accounts');
        }
    }

    /**
     * Tạo mới bank account
     */
    static async createBankAccount(
        bankAccountData: CreateBankAccountRequest
    ): Promise<BankAccount> {
        try {
            const result: ApiResponse<BankAccount> = await axiosInstance.post(
                '/bankaccounts',
                bankAccountData
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to create bank account');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error creating bank account:', error);
            throw new Error(error.message || 'Failed to create bank account');
        }
    }

    /**
     * Cập nhật bank account
     */
    static async updateBankAccount(updateData: UpdateBankAccountRequest): Promise<BankAccount> {
        try {
            const result: ApiResponse<BankAccount> = await axiosInstance.put(
                `/bankaccounts/${updateData.id}`,
                updateData
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to update bank account');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error updating bank account:', error);
            throw new Error(error.message || 'Failed to update bank account');
        }
    }

    /**
     * Xóa bank account
     */
    static async deleteBankAccount(accountId: string): Promise<void> {
        try {
            const result: ApiResponse<any> = await axiosInstance.delete(
                `/bankaccounts/${accountId}`
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to delete bank account');
            }
        } catch (error: any) {
            console.error('Error deleting bank account:', error);
            throw new Error(error.message || 'Failed to delete bank account');
        }
    }

    /**
     * Set bank account làm mặc định
     */
    static async setDefaultBankAccount(accountId: string): Promise<BankAccount> {
        try {
            const result: ApiResponse<BankAccount> = await axiosInstance.put(
                `/bankaccounts/${accountId}/set-default`
            );

            if (!result.success) {
                throw new Error(result.message || 'Failed to set default bank account');
            }

            return result.data;
        } catch (error: any) {
            console.error('Error setting default bank account:', error);
            throw new Error(error.message || 'Failed to set default bank account');
        }
    }
}

export default BankAccountService;
