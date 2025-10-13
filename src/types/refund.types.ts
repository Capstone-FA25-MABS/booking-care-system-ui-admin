/**
 * Refund status enum matching backend
 */
export enum RefundStatus {
    WAITING = 'WAITING',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    REJECTED = 'REJECTED',
}

/**
 * Refund history response from API
 */
export interface RefundHistoryResponse {
    id: string;
    bankAccountId?: string;
    userId: string;
    hospitalId: string;
    status: RefundStatus;
    transferDate?: string;
    paymentId: string;
    refundAmount: number;
    refundReason?: string;
    staffNotes?: string;
    processedByStaffId?: string;
    createdAt: string;
    updatedAt: string;

    // Related entities
    payment?: {
        id: string;
        appointmentId: string;
        amount: number;
        paymentMethodId: string;
        status: string;
    };
    bankAccount?: {
        id: string;
        bankCode: string;
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
}

/**
 * Request to get refund histories with pagination
 */
export interface GetRefundHistoriesRequest {
    hospitalId?: string;
    userId?: string;
    status?: RefundStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortDescending?: boolean;
    includeStatusCounts?: boolean;
}

/**
 * Update refund status request
 */
export interface UpdateRefundStatusRequest {
    refundHistoryId: string;
    status: RefundStatus;
    staffNotes?: string;
    transferDate?: string;
}

/**
 * Refund status counts for all statuses
 */
export interface RefundStatusCounts {
    waiting: number;
    pending: number;
    completed: number;
    rejected: number;
    total: number;
}

/**
 * Paged result for refund histories
 */
export interface PagedRefundHistoriesResponse {
    refundHistories: RefundHistoryResponse[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    statusCounts?: RefundStatusCounts;
}

/**
 * Refund statistics response
 */
export interface RefundStatistics {
    WAITING: number;
    PENDING: number;
    COMPLETED: number;
    REJECTED: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

/**
 * Get refund status badge variant
 */
export const getRefundStatusVariant = (status: RefundStatus): string => {
    switch (status) {
        case RefundStatus.WAITING:
            return 'badge-soft-warning';
        case RefundStatus.PENDING:
            return 'badge-soft-info';
        case RefundStatus.COMPLETED:
            return 'badge-soft-success';
        case RefundStatus.REJECTED:
            return 'badge-soft-danger';
        default:
            return 'badge-soft-secondary';
    }
};

/**
 * Get refund status text in Vietnamese
 */
export const getRefundStatusText = (status: RefundStatus): string => {
    switch (status) {
        case RefundStatus.WAITING:
            return 'Chờ thông tin';
        case RefundStatus.PENDING:
            return 'Chờ xử lý';
        case RefundStatus.COMPLETED:
            return 'Đã hoàn tiền';
        case RefundStatus.REJECTED:
            return 'Từ chối';
        default:
            return status;
    }
};
