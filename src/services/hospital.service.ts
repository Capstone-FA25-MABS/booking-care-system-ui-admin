import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import type { HospitalProfile, UpdateHospitalRequest } from '@/types/user.types';

const HOSPITAL_ENDPOINTS = {
    PROFILE: '/hospitals/profile',
    BY_ACCOUNT: `/hospitals/account`, // Legacy endpoint (returns array)
    HEALTH: '/hospitals/health',
    GET_SPECIALTIES: (id: string) => `/hospitals/${id}/specialties`,
    PUT_SPECIALTIES: (id: string) => `/hospitals/${id}/specialties`,
    GET_SERVICE_TYPES: (id: string) => `/hospitals/${id}/service-types`,
    PUT_SERVICE_TYPES: (id: string) => `/hospitals/${id}/service-types`,
} as const;

/**
 * Hospital Service
 * Handles hospital profile management, image uploads, and related operations
 */
export class HospitalService {
    /**
     * Get current hospital profile (single hospital for authenticated account)
     */
    static async getCurrentHospitalProfile(): Promise<ApiResponse<HospitalProfile>> {
        try {
            const response: any = await axiosInstance.get(HOSPITAL_ENDPOINTS.PROFILE);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital profile retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital profile');
        }
    }

    /**
     * Get hospital profiles by account ID from Hospital Service (legacy)
     * Note: A hospital account can have multiple hospital entities
     */
    static async getHospitalProfilesByAccountId(): Promise<ApiResponse<HospitalProfile[]>> {
        try {
            const response: any = await axiosInstance.get(HOSPITAL_ENDPOINTS.BY_ACCOUNT);
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
            // Create a new object without email and phone (read-only fields)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { email, phone, ...dataToUpdate } = updateData;
            const response: any = await axiosInstance.put(`/hospitals/${hospitalId}`, dataToUpdate);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital profile updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update hospital profile');
        }
    }

    /**
     * Update hospital profile with avatar upload
     */
    static async updateHospitalProfileWithAvatar(
        hospitalId: string,
        updateData: UpdateHospitalRequest,
        avatarFile: File
    ): Promise<ApiResponse<HospitalProfile>> {
        try {
            const formData = new FormData();

            // Append all update data fields (email and phone are read-only, not sent)
            if (updateData.name) formData.append('Name', updateData.name);
            if (updateData.address) formData.append('Address', updateData.address);
            if (updateData.description) formData.append('Description', updateData.description);
            if (updateData.backgroundUrl)
                formData.append('BackgroundUrl', updateData.backgroundUrl);

            formData.append('avatarFile', avatarFile);

            const response: any = await axiosInstance.put(
                `/hospitals/${hospitalId}/upload-avatar`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital profile updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update hospital profile');
        }
    }

    /**
     * Update hospital profile with background upload
     */
    static async updateHospitalProfileWithBackground(
        hospitalId: string,
        updateData: UpdateHospitalRequest,
        backgroundFile: File
    ): Promise<ApiResponse<HospitalProfile>> {
        try {
            const formData = new FormData();

            // Append all update data fields (email and phone are read-only, not sent)
            if (updateData.name) formData.append('Name', updateData.name);
            if (updateData.address) formData.append('Address', updateData.address);
            if (updateData.description) formData.append('Description', updateData.description);
            if (updateData.avatarUrl) formData.append('AvatarUrl', updateData.avatarUrl);

            formData.append('backgroundFile', backgroundFile);

            const response: any = await axiosInstance.put(
                `/hospitals/${hospitalId}/upload-background`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital profile updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update hospital profile');
        }
    }

    /**
     * Update hospital profile with both avatar and background upload
     */
    static async updateHospitalProfileWithFiles(
        hospitalId: string,
        updateData: UpdateHospitalRequest,
        avatarFile: File,
        backgroundFile: File
    ): Promise<ApiResponse<HospitalProfile>> {
        try {
            const formData = new FormData();

            // Append all update data fields (email and phone are read-only, not sent)
            if (updateData.name) formData.append('Name', updateData.name);
            if (updateData.address) formData.append('Address', updateData.address);
            if (updateData.description) formData.append('Description', updateData.description);

            formData.append('avatarFile', avatarFile);
            formData.append('backgroundFile', backgroundFile);

            const response: any = await axiosInstance.put(
                `/hospitals/${hospitalId}/upload-files`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital profile updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update hospital profile');
        }
    }

    /**
     * Upload hospital images
     */
    static async uploadHospitalImages(
        hospitalId: string,
        imageFiles: File[]
    ): Promise<ApiResponse<{ Images: Array<{ id: string; imageUrl: string }> }>> {
        try {
            const formData = new FormData();
            imageFiles.forEach((file) => {
                formData.append('imageFiles', file);
            });

            const response: any = await axiosInstance.post(
                `/hospitals/${hospitalId}/images`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital images uploaded successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to upload hospital images');
        }
    }

    /**
     * Delete hospital image
     */
    static async deleteHospitalImage(hospitalId: string, imageId: string): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.delete(
                `/hospitals/${hospitalId}/images/${imageId}`
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Hospital image deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete hospital image');
        }
    }

    /**
     * Health check for Hospital Service
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(HOSPITAL_ENDPOINTS.HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message,
            };
        } catch (error: any) {
            throw new Error(error.message || 'Hospital service health check failed');
        }
    }

    // ===== Lightweight relations (specialties/service types) =====
    static async getHospitalSpecialtyIds(hospitalId: string): Promise<ApiResponse<string[]>> {
        try {
            const response: any = await axiosInstance.get(
                HOSPITAL_ENDPOINTS.GET_SPECIALTIES(hospitalId)
            );
            return {
                success: true,
                data: response.data || response,
                message: 'Hospital specialties retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital specialties');
        }
    }

    static async updateHospitalSpecialties(
        hospitalId: string,
        specialtyIds: string[]
    ): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.put(
                HOSPITAL_ENDPOINTS.PUT_SPECIALTIES(hospitalId),
                { ids: specialtyIds }
            );
            return {
                success: true,
                data: response.data,
                message: 'Hospital specialties updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update hospital specialties');
        }
    }

    static async getHospitalServiceTypeIds(hospitalId: string): Promise<ApiResponse<string[]>> {
        try {
            const response: any = await axiosInstance.get(
                HOSPITAL_ENDPOINTS.GET_SERVICE_TYPES(hospitalId)
            );
            return {
                success: true,
                data: response.data || response,
                message: 'Hospital service types retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get hospital service types');
        }
    }

    static async updateHospitalServiceTypes(
        hospitalId: string,
        serviceTypeIds: string[]
    ): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.put(
                HOSPITAL_ENDPOINTS.PUT_SERVICE_TYPES(hospitalId),
                { ids: serviceTypeIds }
            );
            return {
                success: true,
                data: response.data,
                message: 'Hospital service types updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update hospital service types');
        }
    }
}

export const {
    getHospitalProfilesByAccountId,
    updateHospitalProfile,
    updateHospitalProfileWithAvatar,
    updateHospitalProfileWithBackground,
    updateHospitalProfileWithFiles,
    uploadHospitalImages,
    deleteHospitalImage,
    healthCheck,
    getHospitalSpecialtyIds,
    updateHospitalSpecialties,
    getHospitalServiceTypeIds,
    updateHospitalServiceTypes,
} = HospitalService;

export default HospitalService;
