import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    AdminProfile,
    DoctorProfile,
    UpdateAdminRequest,
    UpdateDoctorRequest,
} from '@/types/user.types';

// Base API endpoints
const USER_ENDPOINTS = {
    // Admin endpoints (User Service)
    ADMIN_PROFILE: '/users/profile',
    ADMIN_HEALTH: '/users/health',

    // Doctor endpoints (Doctor Service)
    DOCTOR_BY_ACCOUNT: `/doctors/by-account`,
    DOCTOR_HEALTH: '/doctors/health',
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
            const response: any = await axiosInstance.put(
                USER_ENDPOINTS.ADMIN_PROFILE,
                updateData,
                {
                    withCredentials: true, // Ensure cookies are sent
                }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Admin profile updated successfully',
            };
        } catch (error: any) {
            // Preserve original error for better debugging
            if (error.response) {
                throw new Error(
                    error.response.data?.message ||
                        error.response.data?.error ||
                        error.message ||
                        'Failed to update admin profile'
                );
            }
            throw new Error(error.message || 'Failed to update admin profile');
        }
    }

    /**
     * Upload admin avatar
     * Uses /avatar/upload endpoint (AvatarController)
     */
    static async uploadAdminAvatar(avatarFile: File): Promise<ApiResponse<{ avatarUrl: string }>> {
        try {
            const formData = new FormData();
            formData.append('file', avatarFile);

            const response: any = await axiosInstance.post('/avatar/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            console.log('Avatar upload raw response:', response);
            console.log('Avatar upload response data:', response.data);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Avatar uploaded successfully',
            };
        } catch (error: any) {
            console.error('Avatar upload error:', error);
            if (error.response) {
                throw new Error(
                    error.response.data?.message ||
                        error.response.data?.error ||
                        error.message ||
                        'Failed to upload avatar'
                );
            }
            throw new Error(error.message || 'Failed to upload avatar');
        }
    }

    /**
     * Update admin profile with avatar upload
     * First uploads avatar, then updates profile with the new avatarUrl
     */
    static async updateAdminProfileWithAvatar(
        updateData: UpdateAdminRequest,
        avatarFile: File
    ): Promise<ApiResponse<AdminProfile>> {
        try {
            // First, upload the avatar
            const avatarResponse = await UserService.uploadAdminAvatar(avatarFile);
            console.log('Full avatar upload response:', JSON.stringify(avatarResponse, null, 2));

            const avatarData = avatarResponse.data as any;
            console.log('Avatar data extracted:', avatarData);

            // Extract avatarUrl from UploadResult structure
            // Backend returns: { success, data: { CloudFrontUrl, FileUrl, FileName, ... }, message }
            // Or direct: { CloudFrontUrl, FileUrl, FileName, ... }
            let avatarUrl = null;

            // Try different possible structures
            if (avatarData?.data) {
                // Nested data structure
                avatarUrl =
                    avatarData.data.CloudFrontUrl ||
                    avatarData.data.cloudFrontUrl ||
                    avatarData.data.FileUrl ||
                    avatarData.data.fileUrl;
            } else {
                // Direct structure
                avatarUrl =
                    avatarData?.CloudFrontUrl ||
                    avatarData?.cloudFrontUrl ||
                    avatarData?.FileUrl ||
                    avatarData?.fileUrl ||
                    avatarData?.avatarUrl ||
                    avatarData?.imageUrl;
            }

            console.log('Extracted avatarUrl:', avatarUrl);

            if (!avatarUrl) {
                console.error('Cannot extract avatarUrl. Full response:', avatarResponse);
                console.error('Avatar data keys:', Object.keys(avatarData || {}));
                throw new Error(
                    'Không thể lấy URL ảnh sau khi upload. Vui lòng kiểm tra console để xem chi tiết.'
                );
            }

            // Then, update profile with the new avatarUrl
            const updatePayload: UpdateAdminRequest = {
                ...updateData,
                avatarUrl: avatarUrl,
            };

            console.log('Updating profile with avatarUrl:', avatarUrl);
            return await UserService.updateAdminProfile(updatePayload);
        } catch (error: any) {
            console.error('Error in updateAdminProfileWithAvatar:', error);
            throw new Error(error.message || 'Failed to update admin profile with avatar');
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
}

// Export for convenience
export const {
    getAdminProfile,
    getDoctorProfileByAccountId,
    updateAdminProfile,
    updateDoctorProfile,
} = UserService;

export default UserService;
