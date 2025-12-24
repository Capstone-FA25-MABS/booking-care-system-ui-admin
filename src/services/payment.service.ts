import axiosInstance, { ApiResponse } from '@/configs/axios.config';

/**
 * Payment information response
 */
export interface PaymentInfo {
    id: string;
    appointmentId: string;
    amount: number;
    paymentMethodName: string;
    status: string;
    createdAt: string;
    transactionReference?: string;
}

/**
 * Payment Service
 * Handles all payment related API calls
 */
export class PaymentService {
    /**
     * Get payment by appointment ID
     */
    static async getPaymentByAppointmentId(
        appointmentId: string
    ): Promise<ApiResponse<PaymentInfo>> {
        try {
            const response: any = await axiosInstance.get(`/Payments/appointment/${appointmentId}`);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Payment retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get payment information');
        }
    }

    /**
     * Get payment by ID
     */
    static async getPaymentById(paymentId: string): Promise<ApiResponse<PaymentInfo>> {
        try {
            const response: any = await axiosInstance.get(`/Payments/${paymentId}`);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Payment retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get payment information');
        }
    }
}

export default PaymentService;
