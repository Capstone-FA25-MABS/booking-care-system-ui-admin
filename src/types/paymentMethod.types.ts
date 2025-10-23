/**
 * Payment Method Types
 */

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    status: PaymentMethodStatus;
}

export type PaymentMethodStatus = 'ACTIVE' | 'INACTIVE';

export interface PaymentMethodResponse {
    success: boolean;
    message: string;
    data: PaymentMethod[];
    timestamp: string;
}

export interface TogglePaymentMethodResponse {
    success: boolean;
    message: string;
    data: PaymentMethod;
    timestamp: string;
}

export interface PaymentMethodToggleRequest {
    id: string;
}
