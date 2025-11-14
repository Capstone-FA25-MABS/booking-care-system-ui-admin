import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    DoctorSearchListResponse,
    DoctorSearchParams,
    DoctorByIdResponse,
} from '@/types/doctor.types';

// Base API endpoint for doctor service
const DOCTOR_ENDPOINTS = {
    BASE: '/doctors',
    HEALTH: '/doctors/health',
    GET_DOCTOR: (id: string) => `/doctors/${id}`,
    GET_DOCTOR_PRICES: (id: string) => `/doctors/${id}/prices`,
    UPDATE_DOCTOR: (id: string) => `/doctors/${id}`,
    UPDATE_DOCTOR_WITH_AVATAR: (id: string) => `/doctors/${id}/upload-avatar`,
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
    static async getDoctorById(id: string): Promise<ApiResponse<DoctorByIdResponse>> {
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
     * Get a doctor's prices (includes ServiceTypeId and Amount)
     */
    static async getDoctorPrices(
        id: string
    ): Promise<
        ApiResponse<
            Array<{ id: string; serviceTypeId: string; serviceTypeName: string; amount: number }>
        >
    > {
        try {
            const response: any = await axiosInstance.get(DOCTOR_ENDPOINTS.GET_DOCTOR_PRICES(id));
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor prices retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve doctor prices');
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

    /**
     * Update doctor (JSON payload)
     */
    static async updateDoctor(
        id: string,
        payload: {
            id?: string;
            email?: string; // Allow email update
            firstName?: string;
            lastName?: string;
            address?: string;
            gender?: 'MALE' | 'FEMALE' | 'OTHER';
            bio?: string;
            yearsOfExperience?: number;
            positionId?: string;
            specialtyId?: string;
            hospitalId?: string;
            languageIds?: string[];
            prices?: Array<{ serviceTypeId: string; amount: number }>;
            avatarUrl?: string | null;
        }
    ): Promise<ApiResponse> {
        const body = { id, ...payload } as any;
        const response: any = await axiosInstance.put(DOCTOR_ENDPOINTS.UPDATE_DOCTOR(id), body);
        return {
            success: response.success ?? true,
            data: response.data || response,
            message: response.message || 'Doctor updated successfully',
        };
    }

    /**
     * Update doctor with avatar (multipart/form-data)
     */
    static async updateDoctorWithAvatar(
        id: string,
        form: {
            id?: string;
            email?: string; // Allow email update
            firstName?: string;
            lastName?: string;
            address?: string;
            gender?: 'MALE' | 'FEMALE' | 'OTHER';
            bio?: string;
            yearsOfExperience?: number;
            positionId?: string;
            specialtyId?: string;
            hospitalId?: string;
            languageIds?: string[];
            prices?: Array<{ serviceTypeId: string; amount: number }>;
            avatarFile: File;
        }
    ): Promise<ApiResponse> {
        const fd = new FormData();
        fd.append('Id', id);
        if (form.email) fd.append('Email', form.email); // Add email to form data
        if (form.firstName) fd.append('FirstName', form.firstName);
        if (form.lastName) fd.append('LastName', form.lastName);
        if (form.address) fd.append('Address', form.address);
        if (form.gender) fd.append('Gender', form.gender);
        if (form.bio) fd.append('Bio', form.bio);
        if (typeof form.yearsOfExperience === 'number')
            fd.append('YearsOfExperience', String(form.yearsOfExperience));
        if (form.positionId) fd.append('PositionId', form.positionId);
        if (form.specialtyId) fd.append('SpecialtyId', form.specialtyId);
        if (form.hospitalId) fd.append('HospitalId', form.hospitalId);

        if (Array.isArray(form.languageIds)) {
            // ASP.NET Core model binder supports repeated keys: LanguageIds=...&LanguageIds=...
            form.languageIds.forEach((langId) => fd.append('LanguageIds', langId));
        }

        if (Array.isArray(form.prices)) {
            form.prices.forEach((p, idx) => {
                fd.append(`Prices[${idx}].ServiceTypeId`, p.serviceTypeId);
                fd.append(`Prices[${idx}].Amount`, String(p.amount));
            });
        }

        fd.append('avatarFile', form.avatarFile);

        const response: any = await axiosInstance.put(
            DOCTOR_ENDPOINTS.UPDATE_DOCTOR_WITH_AVATAR(id),
            fd,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        );
        return {
            success: response.success ?? true,
            data: response.data || response,
            message: response.message || 'Doctor updated successfully',
        };
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    getDoctorById,
    getDoctorPrices,
    getDoctorsByHospital,
    filterDoctors,
    getSpecialties,
    getPositions,
    getServiceTypes,
    getLanguages,
    updateDoctor,
    updateDoctorWithAvatar,
} = DoctorService;
