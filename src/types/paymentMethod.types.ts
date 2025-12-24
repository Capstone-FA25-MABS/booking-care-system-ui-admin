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

// Subscription Payment Types
export interface CreateSubscriptionPaymentRequest {
    subscriptionId: string;
    hospitalId: string;
    amount: number;
    paymentMethodId: string;
    isUpgrade: boolean;
    currentHospitalSubscriptionId?: string;
    planType?: string; // For redirect back to correct billing period tab
}

export interface PaymentResponse {
    id: string;
    amount: number;
    status: string;
    createdAt: string;
    // Add other payment fields as needed
}

export interface CreateSubscriptionPaymentResponse {
    payment: PaymentResponse;
    paymentUrl: string;
    paymentGateway: string;
    expireAt?: string;
    paymentReference?: string;
    isUpgrade: boolean;
    subscriptionId: string;
    hospitalId: string;
    currentSubscriptionId?: string;
}
