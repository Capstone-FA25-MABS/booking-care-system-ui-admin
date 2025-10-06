import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    AdminProfile,
    DoctorProfile,
    HospitalProfile,
    UpdateAdminRequest,
    UpdateDoctorRequest,
    UpdateHospitalRequest,
} from '@/types/user.type';

// Base API endpoints
const USER_ENDPOINTS = {
    // Admin endpoints (User Service)
    ADMIN_PROFILE: '/users/profile',
    ADMIN_HEALTH: '/users/health',

    // Doctor endpoints (Doctor Service)
    DOCTOR_BY_ACCOUNT: `/doctors/by-account`,
    DOCTOR_HEALTH: '/doctors/health',

    // Hospital endpoints (Hospital Service)
    HOSPITAL_BY_ACCOUNT: `/hospitals/account`,
    HOSPITAL_HEALTH: '/hospitals/health',
} as const;

/**
 * User Service for Admin Panel
 * Handles multi-role user management (Admin, Doctor, Hospital)
 */
export class UserService {
    // ========== ADMIN PROFILE (User Service) ==========

    /**
     * Get admin profile from User Service
     * Uses JWT token from HttpOnly cookie
     */
    static async getAdminProfile(): Promise<ApiResponse<AdminProfile>> {
        try {
            const response: any = await axiosInstance.get(USER_ENDPOINTS.ADMIN_PROFILE);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Admin profile retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get admin profile');
        }
    }

    /**
     * Update admin profile
     */
    static async updateAdminProfile(
        updateData: UpdateAdminRequest
    ): Promise<ApiResponse<AdminProfile>> {
        try {
            const response: any = await axiosInstance.put(USER_ENDPOINTS.ADMIN_PROFILE, updateData);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Admin profile updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update admin profile');
        }
    }

    // ========== DOCTOR PROFILE (Doctor Service) ==========

    /**
     * Get doctor profile by account ID from Doctor Service
     * Backend extracts accountId from JWT token
     */
    static async getDoctorProfileByAccountId(): Promise<ApiResponse<DoctorProfile>> {
        try {
            const response: any = await axiosInstance.get(USER_ENDPOINTS.DOCTOR_BY_ACCOUNT);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor profile retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get doctor profile');
        }
    }

    /**
     * Update doctor profile
     */
    static async updateDoctorProfile(
        doctorId: string,
        updateData: UpdateDoctorRequest
    ): Promise<ApiResponse<DoctorProfile>> {
        try {
            const response: any = await axiosInstance.put(`/doctors/${doctorId}`, updateData);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Doctor profile updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update doctor profile');
        }
    }

    // ========== HOSPITAL PROFILE (Hospital Service) ==========

    /**
     * Get hospital profiles by account ID from Hospital Service
     * Note: A hospital account can have multiple hospital entities
     */
    static async getHospitalProfilesByAccountId(): Promise<ApiResponse<HospitalProfile[]>> {
        try {
            const response: any = await axiosInstance.get(USER_ENDPOINTS.HOSPITAL_BY_ACCOUNT);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital profiles retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital profiles');
        }
    }

    /**
     * Update hospital profile
     */
    static async updateHospitalProfile(
        hospitalId: string,
        updateData: UpdateHospitalRequest
    ): Promise<ApiResponse<HospitalProfile>> {
        try {
            const response: any = await axiosInstance.put(`/hospitals/${hospitalId}`, updateData);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital profile updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update hospital profile');
        }
    }

    // ========== HEALTH CHECKS ==========

    static async healthCheckAdmin(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(USER_ENDPOINTS.ADMIN_HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Admin service health check failed');
        }
    }

    static async healthCheckDoctor(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(USER_ENDPOINTS.DOCTOR_HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Doctor service health check failed');
        }
    }

    static async healthCheckHospital(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(USER_ENDPOINTS.HOSPITAL_HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Hospital service health check failed');
        }
    }
}

// Export for convenience
export const {
    getAdminProfile,
    getDoctorProfileByAccountId,
    getHospitalProfilesByAccountId,
    updateAdminProfile,
    updateDoctorProfile,
    updateHospitalProfile,
} = UserService;

export default UserService;
