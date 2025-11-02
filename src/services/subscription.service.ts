import axiosInstance, { ApiResponse } from '@/configs/axios.config';

// Type aliases
type BillingCycle = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
type SubscriptionStatus = 'ACTIVE' | 'INACTIVE';
type HospitalSubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING' | 'TRIAL';

// Subscription Plan Types
export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    billingCycle: BillingCycle;
    maxDoctors: number | null; // null = unlimited
    maxSpecialties: number | null; // null = unlimited
    maxAppointments: number | null; // null = unlimited
    features?: string;
    status: SubscriptionStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSubscriptionPlanRequest {
    name: string;
    description?: string;
    price: number;
    billingCycle: BillingCycle;
    maxDoctors: number | null; // null = unlimited
    maxSpecialties: number | null; // null = unlimited
    maxAppointments: number | null; // null = unlimited
    features?: string;
    status?: SubscriptionStatus;
}

export interface UpdateSubscriptionPlanRequest {
    name?: string;
    description?: string;
    price?: number;
    billingCycle?: BillingCycle;
    maxDoctors?: number | null; // null = unlimited
    maxSpecialties?: number | null; // null = unlimited
    maxAppointments?: number | null; // null = unlimited
    features?: string;
    status?: SubscriptionStatus;
}

export interface SubscriptionPlanFilterRequest {
    name?: string;
    status?: SubscriptionStatus;
    minPrice?: number;
    maxPrice?: number;
    billingCycle?: BillingCycle;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SubscriptionPlanListResponse {
    subscriptionPlans: SubscriptionPlan[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface SubscriptionPlanDetailResponse extends SubscriptionPlan {
    hospitalSubscriptions?: HospitalSubscription[];
    activeSubscriptionsCount: number;
}

// Hospital Subscription Types
export interface HospitalSubscription {
    hospitalSubscriptionId: string;
    hospitalId: string;
    subscriptionId: string;
    startDate: string;
    endDate: string;
    status: HospitalSubscriptionStatus;
    createdAt: string;
    updatedAt: string;
    subscriptionPlan?: SubscriptionPlan;
}

export interface CreateHospitalSubscriptionRequest {
    hospitalId: string;
    subscriptionId: string;
    startDate: string;
    endDate: string;
}

export interface UpdateHospitalSubscriptionRequest {
    startDate?: string;
    endDate?: string;
    status?: HospitalSubscriptionStatus;
}

export interface HospitalSubscriptionFilterRequest {
    hospitalId?: string;
    subscriptionId?: string;
    status?: HospitalSubscriptionStatus;
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Usage Tracking Types
export interface SubscriptionUsageResponse {
    hospitalId: string;
    hasActiveSubscription: boolean;
    message?: string;
    subscriptionPlanId?: string;
    subscriptionPlanName?: string;
    maxDoctors: number;
    maxSpecialties: number;
    maxAppointments: number;
    currentDoctorCount: number;
    currentSpecialtyCount: number;
    currentAppointmentCount: number;
    doctorUsagePercentage: number;
    specialtyUsagePercentage: number;
    appointmentUsagePercentage: number;
    isDoctorLimitExceeded: boolean;
    isSpecialtyLimitExceeded: boolean;
    isAppointmentLimitExceeded: boolean;
    subscriptionEndDate?: string;
    daysUntilExpiry: number;
    generatedAt: string;
}

export interface SubscriptionUsageAlertResponse {
    hospitalId: string;
    hasAlerts: boolean;
    alerts: string[];
    usage?: SubscriptionUsageResponse;
    checkedAt: string;
}

// Base API endpoints
const SUBSCRIPTION_ENDPOINTS = {
    // Subscription Plans
    PLANS_BASE: '/subscription-plans',
    PLANS_HEALTH: '/subscription-plans/health',
    PLANS_BY_ID: (id: string) => `/subscription-plans/${id}`,
    PLANS_BY_NAME: (name: string) => `/subscription-plans/name/${name}`,
    PLANS_FILTERED: '/subscription-plans/filtered',
    PLANS_ACTIVE: '/subscription-plans/active',

    // Hospital Subscriptions
    HOSPITAL_SUBSCRIPTIONS_BASE: '/hospital-subscriptions',
    HOSPITAL_SUBSCRIPTIONS_HEALTH: '/hospital-subscriptions/health',
    HOSPITAL_SUBSCRIPTIONS_BY_ID: (id: string) => `/hospital-subscriptions/${id}`,
    HOSPITAL_SUBSCRIPTIONS_BY_HOSPITAL: (hospitalId: string) =>
        `/hospital-subscriptions/hospital/${hospitalId}`,
    HOSPITAL_SUBSCRIPTIONS_ACTIVE: (hospitalId: string) =>
        `/hospital-subscriptions/hospital/${hospitalId}/active`,
    HOSPITAL_SUBSCRIPTIONS_EXPIRING: '/hospital-subscriptions/expiring',
    HOSPITAL_SUBSCRIPTIONS_CANCEL: (id: string) => `/hospital-subscriptions/${id}/cancel`,
    HOSPITAL_SUBSCRIPTIONS_UPGRADE: (id: string) => `/hospital-subscriptions/${id}/upgrade`,
    HOSPITAL_SUBSCRIPTIONS_EXTEND: (id: string) => `/hospital-subscriptions/${id}/extend`,
    HOSPITAL_SUBSCRIPTIONS_CONVERT_TRIAL: (id: string) =>
        `/hospital-subscriptions/${id}/convert-trial`,

    // Usage Tracking
    USAGE_BASE: '/subscription-usage',
    USAGE_HEALTH: '/subscription-usage/health',
    USAGE_BY_HOSPITAL: (hospitalId: string) => `/subscription-usage/hospital/${hospitalId}`,
    USAGE_DOCTOR_LIMIT: (hospitalId: string) =>
        `/subscription-usage/hospital/${hospitalId}/doctor-limit`,
    USAGE_SPECIALTY_LIMIT: (hospitalId: string) =>
        `/subscription-usage/hospital/${hospitalId}/specialty-limit`,
    USAGE_APPOINTMENT_LIMIT: (hospitalId: string) =>
        `/subscription-usage/hospital/${hospitalId}/appointment-limit`,
    USAGE_ALERTS: (hospitalId: string) => `/subscription-usage/hospital/${hospitalId}/alerts`,
    USAGE_REPORT: '/subscription-usage/report',
} as const;

/**
 * Subscription Service
 * Handles all subscription-related API operations
 */
export class SubscriptionService {
    // ========== SUBSCRIPTION PLANS ==========

    /**
     * Health check for subscription service
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(SUBSCRIPTION_ENDPOINTS.PLANS_HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription service is healthy',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Subscription service health check failed');
        }
    }

    /**
     * Get all subscription plans
     */
    static async getAllSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlanListResponse>> {
        try {
            const response: any = await axiosInstance.get(SUBSCRIPTION_ENDPOINTS.PLANS_BASE);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription plans retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get subscription plans');
        }
    }

    /**
     * Get subscription plan by ID
     */
    static async getSubscriptionPlanById(id: string): Promise<ApiResponse<SubscriptionPlan>> {
        try {
            const response: any = await axiosInstance.get(SUBSCRIPTION_ENDPOINTS.PLANS_BY_ID(id));
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription plan retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get subscription plan');
        }
    }

    /**
     * Get subscription plan by name
     */
    static async getSubscriptionPlanByName(name: string): Promise<ApiResponse<SubscriptionPlan>> {
        try {
            const response: any = await axiosInstance.get(
                SUBSCRIPTION_ENDPOINTS.PLANS_BY_NAME(name)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription plan retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get subscription plan');
        }
    }

    /**
     * Get filtered subscription plans
     */
    static async getFilteredSubscriptionPlans(
        filter: SubscriptionPlanFilterRequest
    ): Promise<ApiResponse<SubscriptionPlanListResponse>> {
        try {
            const queryString = new URLSearchParams();

            if (filter) {
                for (const [key, value] of Object.entries(filter)) {
                    if (value !== undefined && value !== null && value !== '') {
                        queryString.append(key, String(value));
                    }
                }
            }

            const response: any = await axiosInstance.get(
                `${SUBSCRIPTION_ENDPOINTS.PLANS_FILTERED}?${queryString.toString()}`
            );

            // Handle direct response (without wrapper)
            if (response?.subscriptionPlans !== undefined) {
                return {
                    success: true,
                    data: response,
                    message: 'Filtered subscription plans retrieved successfully',
                };
            }

            // Handle wrapped response
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Filtered subscription plans retrieved successfully',
            };
        } catch (error: any) {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to get filtered subscription plans';
            console.error('SubscriptionService.getFilteredSubscriptionPlans error:', {
                error,
                filter,
                errorMessage,
                response: error?.response?.data,
            });
            throw new Error(errorMessage);
        }
    }

    /**
     * Get active subscription plans
     */
    static async getActiveSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
        try {
            const response: any = await axiosInstance.get(SUBSCRIPTION_ENDPOINTS.PLANS_ACTIVE);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Active subscription plans retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get active subscription plans');
        }
    }

    /**
     * Create new subscription plan
     */
    static async createSubscriptionPlan(
        request: CreateSubscriptionPlanRequest
    ): Promise<ApiResponse<SubscriptionPlanDetailResponse>> {
        try {
            const response: any = await axiosInstance.post(
                SUBSCRIPTION_ENDPOINTS.PLANS_BASE,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription plan created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create subscription plan');
        }
    }

    /**
     * Update subscription plan
     */
    static async updateSubscriptionPlan(
        id: string,
        request: UpdateSubscriptionPlanRequest
    ): Promise<ApiResponse<SubscriptionPlan>> {
        try {
            const response: any = await axiosInstance.put(
                SUBSCRIPTION_ENDPOINTS.PLANS_BY_ID(id),
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription plan updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update subscription plan');
        }
    }

    /**
     * Delete subscription plan
     */
    static async deleteSubscriptionPlan(id: string): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.delete(
                SUBSCRIPTION_ENDPOINTS.PLANS_BY_ID(id)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription plan deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete subscription plan');
        }
    }

    // ========== HOSPITAL SUBSCRIPTIONS ==========

    /**
     * Get hospital subscription by ID
     */
    static async getHospitalSubscriptionById(
        id: string
    ): Promise<ApiResponse<HospitalSubscription>> {
        try {
            const response: any = await axiosInstance.get(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_BY_ID(id)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital subscription retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital subscription');
        }
    }

    /**
     * Get all subscriptions for a hospital
     */
    static async getHospitalSubscriptions(
        hospitalId: string
    ): Promise<ApiResponse<HospitalSubscription[]>> {
        try {
            const response: any = await axiosInstance.get(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_BY_HOSPITAL(hospitalId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital subscriptions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital subscriptions');
        }
    }

    /**
     * Get all hospitals list
     */
    static async getAllHospitals(): Promise<ApiResponse<any[]>> {
        try {
            const response: any = await axiosInstance.get('/hospitals/all');
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospitals retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get all hospitals');
        }
    }

    /**
     * Get all hospital subscriptions (all hospitals)
     * Note: This fetches all hospitals first, then gets subscriptions for each
     */
    static async getAllHospitalSubscriptions(): Promise<ApiResponse<HospitalSubscription[]>> {
        try {
            // First, get all hospitals
            const hospitalsResponse = await this.getAllHospitals();
            const hospitals = hospitalsResponse?.data || [];

            // Then, get subscriptions for each hospital
            const allSubscriptions: HospitalSubscription[] = [];
            for (const hospital of hospitals) {
                try {
                    const subscriptionsResponse = await this.getHospitalSubscriptions(hospital.id);
                    if (subscriptionsResponse.success && subscriptionsResponse.data) {
                        allSubscriptions.push(...subscriptionsResponse.data);
                    }
                } catch (error) {
                    // Skip hospitals that fail to load subscriptions
                    console.warn(
                        `Failed to load subscriptions for hospital ${hospital.id}:`,
                        error
                    );
                }
            }

            return {
                success: true,
                data: allSubscriptions,
                message: 'All hospital subscriptions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get all hospital subscriptions');
        }
    }

    /**
     * Get active subscription for a hospital
     */
    static async getActiveHospitalSubscription(
        hospitalId: string
    ): Promise<ApiResponse<HospitalSubscription | null>> {
        try {
            const response: any = await axiosInstance.get(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_ACTIVE(hospitalId)
            );

            // Handle API response format: { success, message, data }
            if (response.success === false) {
                // API returned error response
                const errorMessage =
                    response.message || 'Failed to get active hospital subscription';

                // Check if it's a "not found" scenario
                if (
                    errorMessage.toLowerCase().includes('no active subscription') ||
                    errorMessage.toLowerCase().includes('not found')
                ) {
                    return {
                        success: true,
                        data: null,
                        message: 'No active subscription found',
                    };
                }

                throw new Error(errorMessage);
            }

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Active hospital subscription retrieved successfully',
            };
        } catch (error: any) {
            // Handle HTTP errors
            const status = error.response?.status;
            const errorData = error.response?.data;

            // Nếu không tìm thấy active subscription (404 hoặc message chứa "No active subscription"), trả về success với data null
            if (
                status === 404 ||
                errorData?.message?.toLowerCase().includes('no active subscription') ||
                errorData?.message?.toLowerCase().includes('not found')
            ) {
                return {
                    success: true,
                    data: null,
                    message: 'No active subscription found',
                };
            }

            // Parse error message from API response
            const errorMessage =
                errorData?.message || error.message || 'Failed to get active hospital subscription';
            throw new Error(errorMessage);
        }
    }

    /**
     * Create hospital subscription
     */
    static async createHospitalSubscription(
        request: CreateHospitalSubscriptionRequest
    ): Promise<ApiResponse<HospitalSubscription>> {
        try {
            const response: any = await axiosInstance.post(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_BASE,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital subscription created successfully',
            };
        } catch (error: any) {
            // Parse error message from API response
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                'Failed to create hospital subscription';
            throw new Error(errorMessage);
        }
    }

    /**
     * Update hospital subscription
     */
    static async updateHospitalSubscription(
        id: string,
        request: UpdateHospitalSubscriptionRequest
    ): Promise<ApiResponse<HospitalSubscription>> {
        try {
            const response: any = await axiosInstance.put(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_BY_ID(id),
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital subscription updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update hospital subscription');
        }
    }

    /**
     * Cancel hospital subscription
     */
    static async cancelHospitalSubscription(
        id: string,
        cancellationReason?: string
    ): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.post(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_CANCEL(id),
                { cancellationReason }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital subscription cancelled successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to cancel hospital subscription');
        }
    }

    /**
     * Upgrade hospital subscription
     */
    static async upgradeHospitalSubscription(
        currentSubscriptionId: string,
        newSubscriptionPlanId: string
    ): Promise<ApiResponse<HospitalSubscription>> {
        try {
            const response: any = await axiosInstance.post(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_UPGRADE(currentSubscriptionId),
                { newSubscriptionPlanId }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital subscription upgraded successfully',
            };
        } catch (error: any) {
            // Parse error message from API response
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.Message ||
                error.message ||
                'Failed to upgrade hospital subscription';
            throw new Error(errorMessage);
        }
    }

    /**
     * Extend hospital subscription
     */
    static async extendHospitalSubscription(
        subscriptionId: string,
        additionalMonths: number
    ): Promise<ApiResponse<HospitalSubscription>> {
        try {
            const response: any = await axiosInstance.post(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_EXTEND(subscriptionId),
                { additionalMonths }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital subscription extended successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to extend hospital subscription');
        }
    }

    /**
     * Convert trial to paid subscription
     */
    static async convertTrialToPaid(
        trialSubscriptionId: string,
        paidSubscriptionPlanId: string
    ): Promise<ApiResponse<HospitalSubscription>> {
        try {
            const response: any = await axiosInstance.post(
                SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_CONVERT_TRIAL(trialSubscriptionId),
                { paidSubscriptionPlanId }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Trial subscription converted to paid successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to convert trial to paid subscription');
        }
    }

    /**
     * Get expiring subscriptions
     */
    static async getExpiringSubscriptions(
        days: number = 30
    ): Promise<ApiResponse<HospitalSubscription[]>> {
        try {
            const response: any = await axiosInstance.get(
                `${SUBSCRIPTION_ENDPOINTS.HOSPITAL_SUBSCRIPTIONS_EXPIRING}?days=${days}`
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Expiring subscriptions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get expiring subscriptions');
        }
    }

    // ========== USAGE TRACKING ==========

    /**
     * Get subscription usage for a hospital
     */
    static async getSubscriptionUsage(
        hospitalId: string
    ): Promise<ApiResponse<SubscriptionUsageResponse>> {
        try {
            const response: any = await axiosInstance.get(
                SUBSCRIPTION_ENDPOINTS.USAGE_BY_HOSPITAL(hospitalId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Subscription usage retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get subscription usage');
        }
    }

    /**
     * Check doctor limit for a hospital
     */
    static async checkDoctorLimit(
        hospitalId: string
    ): Promise<ApiResponse<{ canAddDoctor: boolean; hospitalId: string }>> {
        try {
            const response: any = await axiosInstance.get(
                SUBSCRIPTION_ENDPOINTS.USAGE_DOCTOR_LIMIT(hospitalId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor limit check completed',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to check doctor limit');
        }
    }

    /**
     * Check specialty limit for a hospital
     */
    static async checkSpecialtyLimit(
        hospitalId: string
    ): Promise<ApiResponse<{ canAddSpecialty: boolean; hospitalId: string }>> {
        try {
            const response: any = await axiosInstance.get(
                SUBSCRIPTION_ENDPOINTS.USAGE_SPECIALTY_LIMIT(hospitalId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Specialty limit check completed',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to check specialty limit');
        }
    }

    /**
     * Check appointment limit for a hospital
     */
    static async checkAppointmentLimit(
        hospitalId: string,
        additionalAppointments: number = 1
    ): Promise<
        ApiResponse<{
            canAddAppointments: boolean;
            hospitalId: string;
            additionalAppointments: number;
        }>
    > {
        try {
            const response: any = await axiosInstance.get(
                `${SUBSCRIPTION_ENDPOINTS.USAGE_APPOINTMENT_LIMIT(hospitalId)}?additionalAppointments=${additionalAppointments}`
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Appointment limit check completed',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to check appointment limit');
        }
    }

    /**
     * Get usage alerts for a hospital
     */
    static async getUsageAlerts(
        hospitalId: string
    ): Promise<ApiResponse<SubscriptionUsageAlertResponse>> {
        try {
            const response: any = await axiosInstance.get(
                SUBSCRIPTION_ENDPOINTS.USAGE_ALERTS(hospitalId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Usage alerts retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get usage alerts');
        }
    }

    /**
     * Get usage report
     */
    static async getUsageReport(
        fromDate?: string,
        toDate?: string
    ): Promise<ApiResponse<SubscriptionUsageResponse[]>> {
        try {
            const queryString = new URLSearchParams();
            if (fromDate) queryString.append('fromDate', fromDate);
            if (toDate) queryString.append('toDate', toDate);

            const response: any = await axiosInstance.get(
                `${SUBSCRIPTION_ENDPOINTS.USAGE_REPORT}?${queryString.toString()}`
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Usage report retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get usage report');
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    getAllSubscriptionPlans,
    getSubscriptionPlanById,
    getSubscriptionPlanByName,
    getFilteredSubscriptionPlans,
    getActiveSubscriptionPlans,
    createSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
    getHospitalSubscriptionById,
    getHospitalSubscriptions,
    getActiveHospitalSubscription,
    createHospitalSubscription,
    updateHospitalSubscription,
    cancelHospitalSubscription,
    upgradeHospitalSubscription,
    extendHospitalSubscription,
    convertTrialToPaid,
    getExpiringSubscriptions,
    getSubscriptionUsage,
    checkDoctorLimit,
    checkSpecialtyLimit,
    checkAppointmentLimit,
    getUsageAlerts,
    getUsageReport,
} = SubscriptionService;

// Default export
export default SubscriptionService;
