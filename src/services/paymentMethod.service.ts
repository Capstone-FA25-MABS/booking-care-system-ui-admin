import axios from 'axios';
import type {
    PaymentMethodResponse,
    TogglePaymentMethodResponse,
    PaymentMethodToggleRequest,
} from '@/types/paymentMethod.types';

const API_BASE_URL = 'http://localhost:5000/api/v1.0';

/**
 * Payment Method Service
 * Handles all payment method related API calls
 */
export class PaymentMethodService {
    /**
     * Get all payment methods
     */
    static async getAllPaymentMethods(): Promise<PaymentMethodResponse> {
        try {
            const response = await axios.get<PaymentMethodResponse>(
                `${API_BASE_URL}/PaymentMethods`
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            throw error;
        }
    }

    /**
     * Toggle payment method status (ACTIVE/INACTIVE)
     */
    static async togglePaymentMethodStatus(
        request: PaymentMethodToggleRequest
    ): Promise<TogglePaymentMethodResponse> {
        try {
            const response = await axios.put<TogglePaymentMethodResponse>(
                `${API_BASE_URL}/PaymentMethods/${request.id}/toggle`
            );
            return response.data;
        } catch (error) {
            console.error('Error toggling payment method status:', error);
            throw error;
        }
    }
}

export default PaymentMethodService;
