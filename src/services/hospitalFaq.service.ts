import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    HospitalFaqResponse,
    CreateHospitalFaqRequest,
    UpdateHospitalFaqRequest,
    HospitalFaqFilterRequest,
    HospitalFaqListResponse,
} from '@/types/hospitalFaq.types';

// Base API endpoints for hospital FAQ service
const HOSPITAL_FAQ_ENDPOINTS = {
    BASE: '/hospital-faqs',
    GET_BY_HOSPITAL: (hospitalId: string) => `/hospital-faqs/hospital/${hospitalId}`,
    GET_FAQ: (id: string) => `/hospital-faqs/${id}`,
    CREATE_FAQ: '/hospital-faqs',
    UPDATE_FAQ: (id: string) => `/hospital-faqs/${id}`,
    DELETE_FAQ: (id: string) => `/hospital-faqs/${id}`,
} as const;

/**
 * Hospital FAQ Service
 * Handles all hospital FAQ-related API operations
 */
export class HospitalFaqService {
    /**
     * Build query string from filter parameters
     */
    private static buildFilterQuery(filter?: HospitalFaqFilterRequest): string {
        if (!filter) return '';

        const params = new URLSearchParams();

        if (filter.hospitalId) {
            params.append('hospitalId', filter.hospitalId);
        }
        if (filter.pageNumber) {
            params.append('pageNumber', filter.pageNumber.toString());
        }
        if (filter.pageSize) {
            params.append('pageSize', filter.pageSize.toString());
        }

        return params.toString();
    }

    /**
     * Get FAQs with pagination and filters
     */
    static async getFaqs(
        filter?: HospitalFaqFilterRequest
    ): Promise<ApiResponse<HospitalFaqListResponse>> {
        try {
            const queryString = HospitalFaqService.buildFilterQuery(filter);
            const url = queryString
                ? `${HOSPITAL_FAQ_ENDPOINTS.BASE}?${queryString}`
                : HOSPITAL_FAQ_ENDPOINTS.BASE;

            const response: any = await axiosInstance.get(url);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'FAQs retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch FAQs');
        }
    }

    /**
     * Get all FAQs for a specific hospital
     */
    static async getFaqsByHospitalId(
        hospitalId: string
    ): Promise<ApiResponse<HospitalFaqResponse[]>> {
        try {
            const response: any = await axiosInstance.get(
                HOSPITAL_FAQ_ENDPOINTS.GET_BY_HOSPITAL(hospitalId)
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital FAQs retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch hospital FAQs');
        }
    }

    /**
     * Get a single FAQ by ID
     */
    static async getFaqById(id: string): Promise<ApiResponse<HospitalFaqResponse>> {
        try {
            const response: any = await axiosInstance.get(HOSPITAL_FAQ_ENDPOINTS.GET_FAQ(id));

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'FAQ retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch FAQ');
        }
    }

    /**
     * Create a new FAQ
     */
    static async createFaq(
        request: CreateHospitalFaqRequest
    ): Promise<ApiResponse<HospitalFaqResponse>> {
        try {
            const response: any = await axiosInstance.post(
                HOSPITAL_FAQ_ENDPOINTS.CREATE_FAQ,
                request
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'FAQ created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create FAQ');
        }
    }

    /**
     * Update an existing FAQ
     */
    static async updateFaq(
        id: string,
        request: UpdateHospitalFaqRequest
    ): Promise<ApiResponse<HospitalFaqResponse>> {
        try {
            const response: any = await axiosInstance.put(
                HOSPITAL_FAQ_ENDPOINTS.UPDATE_FAQ(id),
                request
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'FAQ updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update FAQ');
        }
    }

    /**
     * Delete an FAQ
     */
    static async deleteFaq(id: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.delete(HOSPITAL_FAQ_ENDPOINTS.DELETE_FAQ(id));

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'FAQ deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete FAQ');
        }
    }
}
