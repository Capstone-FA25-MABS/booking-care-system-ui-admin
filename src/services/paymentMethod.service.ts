import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import type {
    PaymentMethodResponse,
    TogglePaymentMethodResponse,
    PaymentMethodToggleRequest,
    CreateSubscriptionPaymentRequest,
    CreateSubscriptionPaymentResponse,
} from '@/types/paymentMethod.types';
import type { GetPaymentStatisticsRequest, PaymentStatisticsResponse } from '@/types/payment.types';

/**
 * Payment Method Service
 * Handles all payment method related API calls
 */
export class PaymentMethodService {
    /**
     * Get all payment methods
     */
    static async getAllPaymentMethods(): Promise<ApiResponse<PaymentMethodResponse>> {
        try {
            const response: any = await axiosInstance.get('/PaymentMethods');
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Payment methods retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get payment methods');
        }
    }

    /**
     * Toggle payment method status (ACTIVE/INACTIVE)
     */
    static async togglePaymentMethodStatus(
        request: PaymentMethodToggleRequest
    ): Promise<ApiResponse<TogglePaymentMethodResponse>> {
        try {
            const response: any = await axiosInstance.put(`/PaymentMethods/${request.id}/toggle`);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Payment method status updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to toggle payment method status');
        }
    }

    /**
     * Get active payment methods
     */
    static async getActivePaymentMethods(): Promise<ApiResponse<PaymentMethodResponse>> {
        try {
            const response: any = await axiosInstance.get('/PaymentMethods/active');
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Active payment methods retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get active payment methods');
        }
    }

    /**
     * Create subscription payment URL
     * This replaces direct subscription creation/upgrade - payment success will trigger subscription creation
     */
    static async createSubscriptionPayment(
        request: CreateSubscriptionPaymentRequest
    ): Promise<ApiResponse<CreateSubscriptionPaymentResponse>> {
        try {
            const response: any = await axiosInstance.post('/Payments/subscription', request);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription payment URL created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create subscription payment');
        }
    }

    /**
     * Get payment statistics (subscription revenue only)
     * Returns time series data and summary statistics for subscription payments
     */
    static async getPaymentStatistics(
        request: GetPaymentStatisticsRequest
    ): Promise<ApiResponse<PaymentStatisticsResponse>> {
        try {
            const params = new URLSearchParams();
            if (request.fromDate) params.append('fromDate', request.fromDate);
            if (request.toDate) params.append('toDate', request.toDate);
            if (request.period) params.append('period', request.period);
            if (request.hospitalId) params.append('hospitalId', request.hospitalId);
            if (request.patientId) params.append('patientId', request.patientId);
            if (request.transactionType) params.append('transactionType', request.transactionType);
            if (request.status) params.append('status', request.status);

            const response: any = await axiosInstance.get(
                `/Payments/statistics?${params.toString()}`
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Payment statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get payment statistics');
        }
    }
}

export default PaymentMethodService;
