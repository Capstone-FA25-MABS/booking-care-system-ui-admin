import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import type {
    PaymentMethodResponse,
    TogglePaymentMethodResponse,
    PaymentMethodToggleRequest,
    CreateSubscriptionPaymentRequest,
    CreateSubscriptionPaymentResponse,
} from '@/types/paymentMethod.types';

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
}

export default PaymentMethodService;
