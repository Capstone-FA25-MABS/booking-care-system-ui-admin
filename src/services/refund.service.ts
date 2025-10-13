import axiosInstance from '@/configs/axios.config';
import type {
    RefundHistoryResponse,
    GetRefundHistoriesRequest,
    UpdateRefundStatusRequest,
    PagedRefundHistoriesResponse,
    RefundStatistics,
    ApiResponse,
} from '@/types/refund.types';

const REFUND_ENDPOINTS = {
    BASE: '/refundhistories',
    BY_ID: (id: string) => `/refundhistories/${id}`,
    SEARCH: '/refundhistories/search',
    BY_PAYMENT: (paymentId: string) => `/refundhistories/payment/${paymentId}`,
    UPDATE_STATUS: (id: string) => `/refundhistories/${id}/status`,
    STATISTICS: '/refundhistories/statistics',
} as const;

export class RefundService {
    /**
     * Get refund history by ID
     */
    static async getById(id: string): Promise<ApiResponse<RefundHistoryResponse>> {
        try {
            const response: any = await axiosInstance.get(REFUND_ENDPOINTS.BY_ID(id));
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get refund history');
        }
    }

    /**
     * Get refund histories with pagination and filters
     */
    static async getRefundHistories(
        request: GetRefundHistoriesRequest
    ): Promise<ApiResponse<PagedRefundHistoriesResponse>> {
        try {
            const response: any = await axiosInstance.post(REFUND_ENDPOINTS.SEARCH, request);
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get refund histories');
        }
    }

    /**
     * Get refund history by payment ID
     */
    static async getByPaymentId(paymentId: string): Promise<ApiResponse<RefundHistoryResponse>> {
        try {
            const response: any = await axiosInstance.get(REFUND_ENDPOINTS.BY_PAYMENT(paymentId));
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get refund history by payment');
        }
    }

    /**
     * Update refund status
     */
    static async updateStatus(
        id: string,
        request: Omit<UpdateRefundStatusRequest, 'refundHistoryId'>
    ): Promise<ApiResponse<RefundHistoryResponse>> {
        try {
            const response: any = await axiosInstance.put(
                REFUND_ENDPOINTS.UPDATE_STATUS(id),
                request
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Refund status updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update refund status');
        }
    }

    /**
     * Get refund statistics
     */
    static async getStatistics(): Promise<ApiResponse<RefundStatistics>> {
        try {
            const response: any = await axiosInstance.get(REFUND_ENDPOINTS.STATISTICS);
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get refund statistics');
        }
    }

    /**
     * Mark refund as transferred (completed)
     * Updates status to COMPLETED, updates payment status, and sends notification to patient
     */
    static async markAsTransferred(
        id: string,
        staffNotes?: string
    ): Promise<ApiResponse<RefundHistoryResponse>> {
        try {
            const response: any = await axiosInstance.post(
                `${REFUND_ENDPOINTS.BY_ID(id)}/mark-transferred`,
                {
                    staffNotes,
                }
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Đã đánh dấu chuyển tiền thành công',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to mark refund as transferred');
        }
    }

    /**
     * Report bank account issue
     * Sends notification to patient about incorrect bank account information
     */
    static async reportBankIssue(id: string, issueDescription: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.post(
                `${REFUND_ENDPOINTS.BY_ID(id)}/report-issue`,
                {
                    issueDescription,
                }
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Đã gửi thông báo sự cố đến bệnh nhân',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to report bank issue');
        }
    }
}

// Export individual methods
export const { getById, getRefundHistories, getByPaymentId, updateStatus, getStatistics } =
    RefundService;
