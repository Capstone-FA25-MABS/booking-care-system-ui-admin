export enum PayoutStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
}

export interface HospitalPayoutBankAccount {
    id: string;
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface HospitalPayoutResponse {
    id: string;
    hospitalId: string;
    hospitalName: string;
    periodStart: string;
    periodEnd: string;
    totalAmount: number;
    appointmentCount: number;
    status: PayoutStatus;
    bankAccount: HospitalPayoutBankAccount;
    bankAccountId: string;
    createdAt: string;
    updatedAt: string;
    processedAt?: string;
    processedByAdminId?: string;
    processedByAdminName: string;
    notes?: string;
}

export interface GeneratePayoutsRequest {
    periodStartDate: string;
    periodEndDate: string;
    hospitalIds?: string[];
}

export interface MarkPayoutCompletedRequest {
    payoutId: string;
}

export interface PayoutQueryRequest {
    periodStartDate?: string;
    periodEndDate?: string;
    status?: PayoutStatus;
    hospitalId?: string;
    hospitalName?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface PayoutStatistics {
    totalPendingAmount: number;
    totalCompletedAmount: number;
    pendingPayoutsCount: number;
    completedPayoutsCount: number;
    hospitalsWithPendingPayouts: number;
}

export interface PendingHospitalInfo {
    hospitalId: string;
    hospitalName: string;
    totalAmount: number;
    appointmentCount: number;
    hasBankAccount: boolean;
}

export interface PayoutAppointmentDetail {
    appointmentId: string;
    paymentId: string;
    patientName: string;
    doctorName: string;
    appointmentDate: string;
    amount: number;
    paymentCompletedAt: string;
}

export interface PayoutDetailsResponse {
    payout: HospitalPayoutResponse;
    appointments: PayoutAppointmentDetail[];
}

// API Response wrapper types
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PayoutsListResponse {
    items: HospitalPayoutResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
