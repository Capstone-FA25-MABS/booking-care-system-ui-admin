// Import discount enums
import { DiscountStatus, DiscountType } from '../enums/discount.enums';

// Discount types based on the DDL schema
export interface Discount {
    id: string; // GUID
    code: string;
    name: string;
    description?: string;
    hospitalId: string;
    amount: number;
    discountType: DiscountType;
    startDate: string; // ISO date string
    endDate: string; // ISO date string
    maxUses?: number;
    usesCount: number;
    status: DiscountStatus;
    createdAt: string;
    updatedAt: string;
}

// Request types for creating/updating discounts
export interface CreateDiscountRequest {
    code: string;
    name: string;
    description?: string;
    hospitalId: string;
    amount: number;
    discountType: DiscountType;
    startDate: string;
    endDate: string;
    maxUses?: number;
}

export interface UpdateDiscountRequest extends Partial<CreateDiscountRequest> {
    id: string;
    status?: DiscountStatus;
}

// Query parameters for filtering discounts
export interface DiscountFilters {
    hospitalId?: string;
    discountType?: DiscountType;
    status?: DiscountStatus;
    code?: string;
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
}

// Pagination parameters
export interface DiscountQueryParams extends DiscountFilters {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'amount' | 'usesCount' | 'name';
    sortOrder?: 'asc' | 'desc';
}

// Response types
export interface DiscountResponse {
    success: boolean;
    data: Discount;
    message?: string;
}

export interface DiscountListResponse {
    success: boolean;
    data: {
        discounts: Discount[];
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
    };
    message?: string;
}

// Discount validation result
export interface DiscountValidationResult {
    isValid: boolean;
    discount?: Discount;
    appliedAmount: number;
    finalAmount: number;
    message?: string;
    errors?: string[];
}

// Apply discount request
export interface ApplyDiscountRequest {
    code: string;
    originalAmount: number;
    hospitalId: string;
}

// Discount usage statistics
export interface DiscountUsageStats {
    totalDiscounts: number;
    activeDiscounts: number;
    expiredDiscounts: number;
    totalUsage: number;
    totalSavings: number;
    averageDiscount: number;
}

export default Discount;
