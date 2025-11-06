import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import { ServiceCategory, Service } from '@/types/hospitalServiceMedical.types';

// API endpoints
const HOSPITAL_SERVICE_MEDICAL_ENDPOINTS = {
    // Service Categories
    GET_CATEGORIES_ACTIVE: '/medical-services/servicecategories/active',
    GET_CATEGORIES_PARENTS: '/medical-services/servicecategories/parents',

    // Services
    GET_SERVICES_ACTIVE: '/medical-services/services/active',
    GET_SERVICES_BY_HOSPITAL: (hospitalId: string) =>
        `/medical-services/services/hospital/${hospitalId}`,
} as const;

/**
 * Hospital Service Medical Service
 * Handles service categories and services management for hospitals
 */
export class HospitalServiceMedicalService {
    /**
     * Helper method to extract array from response with multiple possible structures
     */
    private static extractArrayFromResponse<T>(response: any, arrayKey?: string): T[] {
        if (Array.isArray(response)) {
            return response;
        }
        if (response?.data && Array.isArray(response.data)) {
            return response.data;
        }
        if (arrayKey && response?.[arrayKey] && Array.isArray(response[arrayKey])) {
            return response[arrayKey];
        }
        return [];
    }

    /**
     * Helper method to handle API call with standardized response and error handling
     */
    private static async handleApiCall<T>(
        apiCall: () => Promise<any>,
        extractArrayKey: string | undefined,
        successMessage: string,
        errorMessage: string
    ): Promise<ApiResponse<T[]>> {
        try {
            const response = await apiCall();
            const dataList = this.extractArrayFromResponse<T>(response, extractArrayKey);

            return {
                success: true,
                data: dataList,
                message: successMessage,
            };
        } catch (error: any) {
            throw new Error(error.message || errorMessage);
        }
    }

    /**
     * Get all active service categories
     */
    static async getActiveCategories(): Promise<ApiResponse<ServiceCategory[]>> {
        return this.handleApiCall<ServiceCategory>(
            () => axiosInstance.get(HOSPITAL_SERVICE_MEDICAL_ENDPOINTS.GET_CATEGORIES_ACTIVE),
            'categories',
            'Service categories retrieved successfully',
            'Failed to get service categories'
        );
    }

    /**
     * Get parent service categories (categories without parent)
     */
    static async getParentCategories(): Promise<ApiResponse<ServiceCategory[]>> {
        return this.handleApiCall<ServiceCategory>(
            () => axiosInstance.get(HOSPITAL_SERVICE_MEDICAL_ENDPOINTS.GET_CATEGORIES_PARENTS),
            'categories',
            'Parent service categories retrieved successfully',
            'Failed to get parent service categories'
        );
    }

    /**
     * Get all active services
     */
    static async getActiveServices(): Promise<ApiResponse<Service[]>> {
        return this.handleApiCall<Service>(
            () => axiosInstance.get(HOSPITAL_SERVICE_MEDICAL_ENDPOINTS.GET_SERVICES_ACTIVE),
            'services',
            'Services retrieved successfully',
            'Failed to get services'
        );
    }

    /**
     * Get services by hospital ID
     */
    static async getServicesByHospital(hospitalId: string): Promise<ApiResponse<Service[]>> {
        return this.handleApiCall<Service>(
            () =>
                axiosInstance.get(
                    HOSPITAL_SERVICE_MEDICAL_ENDPOINTS.GET_SERVICES_BY_HOSPITAL(hospitalId)
                ),
            'services',
            'Hospital services retrieved successfully',
            'Failed to get hospital services'
        );
    }
}
