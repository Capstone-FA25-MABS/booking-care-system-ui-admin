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
     * Get all active service categories
     */
    static async getActiveCategories(): Promise<ApiResponse<ServiceCategory[]>> {
        try {
            const response: any = await axiosInstance.get(
                HOSPITAL_SERVICE_MEDICAL_ENDPOINTS.GET_CATEGORIES_ACTIVE
            );

            // Handle response structure - axios interceptor returns response.data directly
            let categoriesList: ServiceCategory[] = [];
            if (Array.isArray(response)) {
                categoriesList = response;
            } else if (response?.data && Array.isArray(response.data)) {
                categoriesList = response.data;
            } else if (response?.categories && Array.isArray(response.categories)) {
                categoriesList = response.categories;
            }

            return {
                success: true,
                data: categoriesList,
                message: 'Service categories retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get service categories');
        }
    }

    /**
     * Get parent service categories (categories without parent)
     */
    static async getParentCategories(): Promise<ApiResponse<ServiceCategory[]>> {
        try {
            const response: any = await axiosInstance.get(
                HOSPITAL_SERVICE_MEDICAL_ENDPOINTS.GET_CATEGORIES_PARENTS
            );

            // Handle response structure
            let categoriesList: ServiceCategory[] = [];
            if (Array.isArray(response)) {
                categoriesList = response;
            } else if (response?.data && Array.isArray(response.data)) {
                categoriesList = response.data;
            } else if (response?.categories && Array.isArray(response.categories)) {
                categoriesList = response.categories;
            }

            return {
                success: true,
                data: categoriesList,
                message: 'Parent service categories retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get parent service categories');
        }
    }

    /**
     * Get all active services
     */
    static async getActiveServices(): Promise<ApiResponse<Service[]>> {
        try {
            const response: any = await axiosInstance.get(
                HOSPITAL_SERVICE_MEDICAL_ENDPOINTS.GET_SERVICES_ACTIVE
            );

            // Handle response structure
            let servicesList: Service[] = [];
            if (Array.isArray(response)) {
                servicesList = response;
            } else if (response?.data && Array.isArray(response.data)) {
                servicesList = response.data;
            } else if (response?.services && Array.isArray(response.services)) {
                servicesList = response.services;
            }

            return {
                success: true,
                data: servicesList,
                message: 'Services retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get services');
        }
    }

    /**
     * Get services by hospital ID
     */
    static async getServicesByHospital(hospitalId: string): Promise<ApiResponse<Service[]>> {
        try {
            const response: any = await axiosInstance.get(
                HOSPITAL_SERVICE_MEDICAL_ENDPOINTS.GET_SERVICES_BY_HOSPITAL(hospitalId)
            );

            // Handle response structure
            let servicesList: Service[] = [];
            if (Array.isArray(response)) {
                servicesList = response;
            } else if (response?.data && Array.isArray(response.data)) {
                servicesList = response.data;
            } else if (response?.services && Array.isArray(response.services)) {
                servicesList = response.services;
            }

            return {
                success: true,
                data: servicesList,
                message: 'Hospital services retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital services');
        }
    }
}
