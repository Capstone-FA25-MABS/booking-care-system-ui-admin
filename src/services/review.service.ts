import axiosInstance, { ApiResponse } from '@/configs/axios.config';

// Base API endpoints for reviews
const REVIEW_ENDPOINTS = {
    BASE: '/reviews',
    HEALTH: '/reviews/health',
    DOCTOR_STATISTICS: (doctorId: string) => `/reviews/doctor/${doctorId}/statistics`,
    SERVICE_STATISTICS: (serviceId: string) => `/reviews/service/${serviceId}/statistics`,
    BATCH_DOCTORS_STATISTICS: '/reviews/doctors/batch-statistics',
    BATCH_SERVICES_STATISTICS: '/reviews/services/batch-statistics',
} as const;

export interface ReviewStatisticsResponse {
    targetId: string;
    averageRating: number;
    totalReviews: number;
}

export interface ReviewDetailedStatisticsResponse {
    targetId: string;
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        rating: number;
        count: number;
        percentage: number;
    }[];
}

export interface BatchDoctorsStatisticsRequest {
    doctorIds: string[];
}

export interface BatchServicesStatisticsRequest {
    serviceIds: string[];
}

export interface BatchDoctorsStatisticsResponse {
    doctorStatistics: Record<string, ReviewStatisticsResponse>;
}

export interface BatchServicesStatisticsResponse {
    serviceStatistics: Record<string, ReviewStatisticsResponse>;
}

/**
 * Review Service
 * Handles review statistics and related operations
 */
export class ReviewService {
    /**
     * Get detailed statistics for a doctor
     */
    static async getDoctorStatistics(
        doctorId: string
    ): Promise<ApiResponse<ReviewDetailedStatisticsResponse>> {
        try {
            const response: any = await axiosInstance.get(
                REVIEW_ENDPOINTS.DOCTOR_STATISTICS(doctorId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor review statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get doctor review statistics');
        }
    }

    /**
     * Get detailed statistics for a service
     */
    static async getServiceStatistics(
        serviceId: string
    ): Promise<ApiResponse<ReviewDetailedStatisticsResponse>> {
        try {
            const response: any = await axiosInstance.get(
                REVIEW_ENDPOINTS.SERVICE_STATISTICS(serviceId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service review statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get service review statistics');
        }
    }

    /**
     * Get batch statistics for multiple doctors
     */
    static async getBatchDoctorsStatistics(
        request: BatchDoctorsStatisticsRequest
    ): Promise<ApiResponse<BatchDoctorsStatisticsResponse>> {
        try {
            const response: any = await axiosInstance.post(
                REVIEW_ENDPOINTS.BATCH_DOCTORS_STATISTICS,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Batch doctors statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get batch doctors statistics');
        }
    }

    /**
     * Get batch statistics for multiple services
     */
    static async getBatchServicesStatistics(
        request: BatchServicesStatisticsRequest
    ): Promise<ApiResponse<BatchServicesStatisticsResponse>> {
        try {
            const response: any = await axiosInstance.post(
                REVIEW_ENDPOINTS.BATCH_SERVICES_STATISTICS,
                request
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Batch services statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get batch services statistics');
        }
    }
}

export default ReviewService;
