import { useState, useEffect, useCallback } from 'react';
import {
    BankAccount,
    CreateBankAccountRequest,
    UpdateBankAccountRequest,
} from '../types/wallet.types';
import BankAccountService from '../services/bankAccount.service';

export interface UseBankAccountsReturn {
    accounts: BankAccount[];
    loading: boolean;
    error: string | null;
    defaultAccount: BankAccount | null;
    otherAccounts: BankAccount[];
    fetchAccounts: (userId: string) => Promise<void>;
    createAccount: (accountData: CreateBankAccountRequest) => Promise<void>;
    setDefaultAccount: (accountId: string) => Promise<void>;
    deleteAccount: (accountId: string) => Promise<void>;
    refreshAccounts: () => Promise<void>;
    updateAccount: (updateData: UpdateBankAccountRequest) => Promise<void>;
}

export const useBankAccounts = (initialUserId?: string): UseBankAccountsReturn => {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(initialUserId || null);

    // Computed values
    const defaultAccount =
        accounts.find((account) => account.isDefault && account.isActive) || null;
    const otherAccounts = accounts.filter((account) => account.isActive && !account.isDefault);

    const fetchAccounts = useCallback(async (userId: string) => {
        if (!userId || userId.trim() === '') {
            console.warn('No userId provided to fetchAccounts');
            return;
        }

        setLoading(true);
        setError(null);
        setCurrentUserId(userId);

        try {
            const fetchedAccounts = await BankAccountService.getBankAccountsByUserId(userId);
            setAccounts(fetchedAccounts);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch accounts';
            setError(errorMessage);
            console.error('Error fetching accounts:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createAccount = useCallback(async (accountData: CreateBankAccountRequest) => {
        setLoading(true);
        setError(null);

        try {
            const newAccount = await BankAccountService.createBankAccount(accountData);

            // If this is set as default, update other accounts
            if (newAccount.isDefault) {
                setAccounts((prev) =>
                    prev.map((account) => ({ ...account, isDefault: false })).concat(newAccount)
                );
            } else {
                setAccounts((prev) => [...prev, newAccount]);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const setDefaultAccount = useCallback(async (accountId: string) => {
        setLoading(true);
        setError(null);

        try {
            await BankAccountService.setDefaultBankAccount(accountId);

            // Update local state
            setAccounts((prev) =>
                prev.map((account) => ({
                    ...account,
                    isDefault: account.id === accountId,
                }))
            );
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to set default account';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAccount = useCallback(async (accountId: string) => {
        setLoading(true);
        setError(null);

        try {
            await BankAccountService.deleteBankAccount(accountId);

            // Remove from local state
            setAccounts((prev) => prev.filter((account) => account.id !== accountId));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAccount = useCallback(async (updateData: UpdateBankAccountRequest) => {
        setLoading(true);
        setError(null);

        try {
            const updatedAccount = await BankAccountService.updateBankAccount(updateData);

            // Update local state
            setAccounts((prev) =>
                prev.map((account) => (account.id === updateData.id ? updatedAccount : account))
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update account';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshAccounts = useCallback(async () => {
        if (currentUserId) {
            await fetchAccounts(currentUserId);
        }
    }, [currentUserId, fetchAccounts]);

    // Auto fetch when initialUserId changes
    useEffect(() => {
        if (initialUserId && initialUserId.trim() !== '') {
            fetchAccounts(initialUserId);
        }
    }, [initialUserId, fetchAccounts]);

    return {
        accounts,
        loading,
        error,
        defaultAccount,
        otherAccounts,
        fetchAccounts,
        createAccount,
        setDefaultAccount,
        deleteAccount,
        refreshAccounts,
        updateAccount,
    };
};
