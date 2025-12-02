export interface BankAccount {
    id: string;
    userId: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    fullAccountNumber: string;
    accountName: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBankAccountRequest {
    userId: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    isDefault: boolean;
}

export interface UpdateBankAccountRequest {
    id: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
}

export interface BankAccountsResponse {
    accounts: BankAccount[];
    count: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}
