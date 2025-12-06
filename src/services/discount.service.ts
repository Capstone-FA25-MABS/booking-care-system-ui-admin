import axiosInstance from '../configs/axios.config';
import {
    Discount,
    CreateDiscountRequest,
    UpdateDiscountRequest,
    DiscountQueryParams,
    DiscountResponse,
    DiscountListResponse,
    DiscountValidationResult,
} from '../types/discount.types';
import { DiscountStatus } from '../enums/discount.enums';

// Base API endpoint for discounts
const DISCOUNT_ENDPOINTS = {
    BASE: '/discounts',
    BY_ID: (id: string) => `/discounts/${id}`,
    BY_CODE: (code: string) => `/discounts/by-code/${code}`,
    HOSPITAL_ACTIVE: (hospitalId: string) => `/discounts/hospital/${hospitalId}/active`,
    APPLICABLE: '/discounts/applicable',
    VALIDATE: '/discounts/validate',
    USE: '/discounts/use',
    REVERT: '/discounts/revert',
    CALCULATE: '/discounts/calculate',
    ACTIVATE: (id: string) => `/discounts/${id}/activate`,
    DEACTIVATE: (id: string) => `/discounts/${id}/deactivate`,
    UPDATE_EXPIRED: '/discounts/update-expired',
    HEALTH: '/discounts/health',
    STATS: '/discounts/stats',
    BULK: '/discounts/bulk',
} as const;

/**
 * Discount Service
 * Handles all discount-related API operations
 */
export class DiscountService {
    /**
     * Get all discounts with optional filtering and pagination
     */
    static async getDiscounts(params?: DiscountQueryParams): Promise<DiscountListResponse> {
        try {
            const queryString = new URLSearchParams();

            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        queryString.append(key, String(value));
                    }
                });
            }

            const response: any = await axiosInstance.get(
                `${DISCOUNT_ENDPOINTS.BASE}?${queryString.toString()}`
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to fetch discounts',
                data: [],
                pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
            };
        }
    }

    /**
     * Get a single discount by ID
     */
    static async getDiscountById(id: string): Promise<DiscountResponse> {
        try {
            const response: any = await axiosInstance.get(`${DISCOUNT_ENDPOINTS.BASE}/${id}`);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || `Failed to fetch discount with ID: ${id}`,
                data: null,
            };
        }
    }

    /**
     * Get discount by code
     */
    static async getDiscountByCode(code: string): Promise<DiscountResponse> {
        try {
            const response: any = await axiosInstance.get(
                `${DISCOUNT_ENDPOINTS.BASE}/code/${encodeURIComponent(code)}`
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || `Failed to fetch discount with code: ${code}`,
                data: null,
            };
        }
    }

    /**
     * Create a new discount
     */
    static async createDiscount(discountData: CreateDiscountRequest): Promise<DiscountResponse> {
        try {
            const response: any = await axiosInstance.post(DISCOUNT_ENDPOINTS.BASE, discountData);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Discount created successfully',
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to create discount',
                data: null,
            };
        }
    }

    /**
     * Update an existing discount
     */
    static async updateDiscount(discountData: UpdateDiscountRequest): Promise<DiscountResponse> {
        try {
            const { id, ...updateData } = discountData;
            const response: any = await axiosInstance.put(
                `${DISCOUNT_ENDPOINTS.BASE}/${id}`,
                updateData
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Discount updated successfully',
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to update discount',
                data: null,
            };
        }
    }

    /**
     * Delete a discount
     */
    static async deleteDiscount(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response: any = await axiosInstance.delete(DISCOUNT_ENDPOINTS.BY_ID(id));

            return {
                success: response.success ?? true,
                message: response.message || 'Discount deleted successfully',
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to delete discount',
            };
        }
    }

    /**
     * Activate a discount
     */
    static async activateDiscount(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response: any = await axiosInstance.post(DISCOUNT_ENDPOINTS.ACTIVATE(id));

            return {
                success: response.success ?? true,
                message: response.message || 'Discount activated successfully',
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to activate discount',
            };
        }
    }

    /**
     * Deactivate a discount
     */
    static async deactivateDiscount(id: string): Promise<{ success: boolean; message: string }> {
        try {
            const response: any = await axiosInstance.post(DISCOUNT_ENDPOINTS.DEACTIVATE(id));

            return {
                success: response.success ?? true,
                message: response.message || 'Discount deactivated successfully',
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to deactivate discount',
            };
        }
    }

    /**
     * Validate a discount code
     */
    static async validateDiscount(
        code: string,
        context: {
            hospitalId: string;
            totalAmount: number;
        }
    ): Promise<DiscountValidationResult> {
        try {
            const response: any = await axiosInstance.post(DISCOUNT_ENDPOINTS.VALIDATE, {
                code,
                hospitalId: context.hospitalId,
                totalAmount: context.totalAmount,
            });

            return response.data || response;
        } catch (error: any) {
            throw {
                isValid: false,
                appliedAmount: 0,
                finalAmount: context.totalAmount,
                message: error.message || 'Failed to validate discount code',
                errors: [error.message || 'Validation failed'],
            };
        }
    }

    /**
     * Use a discount code (apply and increment usage count)
     */
    static async useDiscount(request: {
        code: string;
        hospitalId: string;
        totalAmount: number;
    }): Promise<{
        success: boolean;
        message: string;
        discountAmount: number;
        finalAmount: number;
        discountId: string;
        remainingUses?: number;
    }> {
        try {
            const response: any = await axiosInstance.post(DISCOUNT_ENDPOINTS.USE, request);

            return response.data || response;
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to use discount',
                discountAmount: 0,
                finalAmount: request.totalAmount,
                discountId: '',
            };
        }
    }

    /**
     * Calculate discount amount without applying it
     */
    static async calculateDiscountAmount(request: {
        code: string;
        originalAmount: number;
        hospitalId: string;
    }): Promise<{
        discountAmount: number;
        finalAmount: number;
        originalAmount: number;
    }> {
        try {
            const response: any = await axiosInstance.post(DISCOUNT_ENDPOINTS.CALCULATE, request);

            return response.data || response;
        } catch {
            throw {
                discountAmount: 0,
                finalAmount: request.originalAmount,
                originalAmount: request.originalAmount,
            };
        }
    }

    /**
     * Revert discount usage (for cancelled orders)
     */
    static async revertDiscountUsage(request: {
        code: string;
        hospitalId: string;
    }): Promise<{ success: boolean; message: string }> {
        try {
            const response: any = await axiosInstance.post(DISCOUNT_ENDPOINTS.REVERT, request);

            return {
                success: response.success ?? true,
                message: response.message || 'Discount usage reverted successfully',
            };
        } catch (error: any) {
            throw {
                success: false,
                message: error.message || 'Failed to revert discount usage',
            };
        }
    }

    /**
     * Get active discounts for a hospital
     */
    static async getActiveDiscounts(hospitalId: string): Promise<Discount[]> {
        try {
            const response: any = await axiosInstance.get(
                DISCOUNT_ENDPOINTS.HOSPITAL_ACTIVE(hospitalId)
            );

            return response.data || response;
        } catch (error) {
            console.error('Failed to fetch active discounts:', error);
            return [];
        }
    }

    /**
     * Check if a discount code is available and valid
     */
    static async checkDiscountAvailability(code: string): Promise<{
        available: boolean;
        discount?: Discount;
        message: string;
    }> {
        try {
            const result = await this.getDiscountByCode(code);
            const discount = result.data;

            if (!discount) {
                return {
                    available: false,
                    message: 'Discount code not found',
                };
            }

            const now = new Date();
            const startDate = new Date(discount.startDate);
            const endDate = new Date(discount.endDate);

            if (discount.status !== DiscountStatus.ACTIVE) {
                return {
                    available: false,
                    discount,
                    message: `Discount is ${discount.status.toString().toLowerCase()}`,
                };
            }

            if (now < startDate) {
                return {
                    available: false,
                    discount,
                    message: 'Discount is not yet active',
                };
            }

            if (now > endDate) {
                return {
                    available: false,
                    discount,
                    message: 'Discount has expired',
                };
            }

            if (discount.maxUses && discount.usesCount >= discount.maxUses) {
                return {
                    available: false,
                    discount,
                    message: 'Discount usage limit reached',
                };
            }

            return {
                available: true,
                discount,
                message: 'Discount is available',
            };
        } catch (error: any) {
            return {
                available: false,
                message: error.message || 'Failed to check discount availability',
            };
        }
    }
}

// Export individual methods for convenience
export const {
    getDiscounts,
    getDiscountById,
    getDiscountByCode,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    activateDiscount,
    deactivateDiscount,
    validateDiscount,
    useDiscount,
    calculateDiscountAmount,
    revertDiscountUsage,
    getActiveDiscounts,
    checkDiscountAvailability,
} = DiscountService;

// Default export
export default DiscountService;
