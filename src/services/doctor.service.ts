import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    DoctorOptimizedResponse,
    DoctorSearchListResponse,
    DoctorSearchParams,
} from '@/types/doctor.types';

// Base API endpoint for doctor service
const DOCTOR_ENDPOINTS = {
    BASE: '/doctors',
    HEALTH: '/doctors/health',
    GET_DOCTOR: (id: string) => `/doctors/${id}`,
    GET_DOCTORS_BY_HOSPITAL: (hospitalId: string) => `/doctors/hospital/${hospitalId}`,
    GET_SPECIALTIES: '/specialties/all',
    GET_POSITIONS: '/positions/all',
    GET_SERVICE_TYPES: '/servicetypes/all',
    GET_LANGUAGES: '/languages/all',
    FILTER_DOCTORS: '/doctors/filter',
} as const;

export class DoctorService {
    /**
     * Health check for doctor service
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(DOCTOR_ENDPOINTS.HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor service is healthy',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Doctor service health check failed');
        }
    }

    /**
     * Get doctor by ID
     */
    static async getDoctorById(id: string): Promise<ApiResponse<DoctorOptimizedResponse>> {
        try {
            const response: any = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_DOCTOR(id));
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve doctor');
        }
    }

    /**
     * Get doctors by hospital with optimized response for hospital staff
     */
    static async getDoctorsByHospital(
        hospitalId: string,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<ApiResponse<DoctorSearchListResponse>> {
        try {
            const response: any = await axiosInstance.get(
                DOCTOR_ENDPOINTS.GET_DOCTORS_BY_HOSPITAL(hospitalId),
                {
                    params: {
                        pageNumber,
                        pageSize,
                    },
                }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctors retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve doctors by hospital');
        }
    }

    /**
     * Filter doctors with advanced criteria (optimized response)
     */
    static async filterDoctors(
        params: DoctorSearchParams
    ): Promise<ApiResponse<DoctorSearchListResponse>> {
        try {
            const response: any = await axiosInstance.post(DOCTOR_ENDPOINTS.FILTER_DOCTORS, params);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctors filtered successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to filter doctors');
        }
    }

    /**
     * Get all specialties for filter
     */
    static async getSpecialties(): Promise<
        ApiResponse<Array<{ id: string; name: string; imageUrl: string }>>
    > {
        try {
            const response: any = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_SPECIALTIES);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Specialties retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve specialties');
        }
    }

    /**
     * Get all positions for filter
     */
    static async getPositions(): Promise<
        ApiResponse<Array<{ id: string; name: string; doctorCount: number }>>
    > {
        try {
            const response: any = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_POSITIONS);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Positions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve positions');
        }
    }

    /**
     * Get all service types for filter
     */
    static async getServiceTypes(): Promise<ApiResponse<Array<{ id: string; name: string }>>> {
        try {
            const response: any = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_SERVICE_TYPES);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Service types retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve service types');
        }
    }

    /**
     * Get all languages for filter
     */
    static async getLanguages(): Promise<ApiResponse<Array<{ id: string; name: string }>>> {
        try {
            const response: any = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_LANGUAGES);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Languages retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve languages');
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    getDoctorById,
    getDoctorsByHospital,
    filterDoctors,
    getSpecialties,
    getPositions,
    getServiceTypes,
    getLanguages,
} = DoctorService;
