import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    PagedReviewsResponse,
    Review,
    AddReplyRequest,
    UpdateReplyRequest,
} from '@/types/review.types';

// Base API endpoints for reviews
const REVIEW_ENDPOINTS = {
    BASE: '/reviews',
    HEALTH: '/reviews/health',
    DOCTOR_STATISTICS: (doctorId: string) => `/reviews/doctor/${doctorId}/statistics`,
    SERVICE_STATISTICS: (serviceId: string) => `/reviews/service/${serviceId}/statistics`,
    BATCH_DOCTORS_STATISTICS: '/reviews/doctors/batch-statistics',
    BATCH_SERVICES_STATISTICS: '/reviews/services/batch-statistics',
    HOSPITAL_REVIEWS: (hospitalId: string) => `/reviews/hospital/${hospitalId}`,
    HOSPITAL_STATISTICS: (hospitalId: string) => `/reviews/hospital/${hospitalId}/statistics`,
    HOSPITAL_AVERAGE_RATING: (hospitalId: string) =>
        `/reviews/hospital/${hospitalId}/average-rating`,
    HOSPITAL_COUNT: (hospitalId: string) => `/reviews/hospital/${hospitalId}/count`,
    ADD_REPLY: '/reviews/reply',
    UPDATE_REPLY: '/reviews/reply',
    DELETE_REPLY: (reviewId: string, replyId: string) => `/reviews/${reviewId}/reply/${replyId}`,
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

    /**
     * Get reviews for a specific hospital with pagination and filters
     */
    static async getReviewsByHospital(
        hospitalId: string,
        page: number = 1,
        pageSize: number = 10,
        minRating?: number,
        maxRating?: number
    ): Promise<ApiResponse<PagedReviewsResponse>> {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                pageSize: pageSize.toString(),
            });

            if (minRating !== undefined) {
                params.append('minRating', minRating.toString());
            }
            if (maxRating !== undefined) {
                params.append('maxRating', maxRating.toString());
            }

            const response: any = await axiosInstance.get(
                `${REVIEW_ENDPOINTS.HOSPITAL_REVIEWS(hospitalId)}?${params.toString()}`
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital reviews retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital reviews');
        }
    }

    /**
     * Get detailed statistics for a hospital
     */
    static async getHospitalStatistics(
        hospitalId: string
    ): Promise<ApiResponse<ReviewDetailedStatisticsResponse>> {
        try {
            const response: any = await axiosInstance.get(
                REVIEW_ENDPOINTS.HOSPITAL_STATISTICS(hospitalId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital review statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital review statistics');
        }
    }

    /**
     * Get average rating for a hospital
     */
    static async getHospitalAverageRating(
        hospitalId: string
    ): Promise<ApiResponse<{ hospitalId: string; averageRating: number }>> {
        try {
            const response: any = await axiosInstance.get(
                REVIEW_ENDPOINTS.HOSPITAL_AVERAGE_RATING(hospitalId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital average rating retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital average rating');
        }
    }

    /**
     * Get total review count for a hospital
     */
    static async getHospitalReviewCount(
        hospitalId: string
    ): Promise<ApiResponse<{ hospitalId: string; reviewCount: number }>> {
        try {
            const response: any = await axiosInstance.get(
                REVIEW_ENDPOINTS.HOSPITAL_COUNT(hospitalId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital review count retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital review count');
        }
    }

    /**
     * Add a reply to a review
     */
    static async addReply(request: AddReplyRequest): Promise<ApiResponse<Review>> {
        try {
            const response: any = await axiosInstance.post(REVIEW_ENDPOINTS.ADD_REPLY, request);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Reply added successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to add reply');
        }
    }

    /**
     * Update an existing reply
     */
    static async updateReply(request: UpdateReplyRequest): Promise<ApiResponse<Review>> {
        try {
            const response: any = await axiosInstance.put(REVIEW_ENDPOINTS.UPDATE_REPLY, request);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Reply updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update reply');
        }
    }

    /**
     * Delete a reply from a review
     */
    static async deleteReply(reviewId: string, replyId: string): Promise<ApiResponse<Review>> {
        try {
            const response: any = await axiosInstance.delete(
                REVIEW_ENDPOINTS.DELETE_REPLY(reviewId, replyId)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Reply deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete reply');
        }
    }
}

export default ReviewService;
