import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import type {
    PaymentMethodResponse,
    TogglePaymentMethodResponse,
    PaymentMethodToggleRequest,
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
}

export default PaymentMethodService;
