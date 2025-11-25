import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import type {
    AdminSignature,
    CreateAdminSignatureRequest,
    UpdateAdminSignatureRequest,
} from '@/types/admin-signature.types';

// Base API endpoints for admin signatures
const ADMIN_SIGNATURE_ENDPOINTS = {
    BASE: '/admin-signatures',
    ACTIVE: '/admin-signatures/active',
    BY_ID: (id: string) => `/admin-signatures/${id}`,
} as const;

/**
 * Admin Signature Service
 * Handles all API calls related to admin signature management
 */
export class AdminSignatureService {
    /**
     * Get admin signature by ID
     */
    static async getAdminSignatureById(id: string): Promise<ApiResponse<AdminSignature>> {
        try {
            const response: any = await axiosInstance.get(ADMIN_SIGNATURE_ENDPOINTS.BY_ID(id));
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Admin signature retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get admin signature');
        }
    }

    /**
     * Get active signature for current admin
     */
    static async getActiveSignature(): Promise<ApiResponse<AdminSignature>> {
        try {
            const response: any = await axiosInstance.get(ADMIN_SIGNATURE_ENDPOINTS.ACTIVE);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Active signature retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get active signature');
        }
    }

    /**
     * Get all admin signatures
     */
    static async getAllAdminSignatures(): Promise<ApiResponse<AdminSignature[]>> {
        try {
            const response: any = await axiosInstance.get(ADMIN_SIGNATURE_ENDPOINTS.BASE);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Admin signatures retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get admin signatures');
        }
    }

    /**
     * Create a new admin signature
     */
    static async createAdminSignature(
        request: CreateAdminSignatureRequest
    ): Promise<ApiResponse<AdminSignature>> {
        try {
            const formData = new FormData();
            formData.append('fullName', request.fullName);
            formData.append('position', request.position);
            formData.append('signatureFile', request.signatureFile);

            const response: any = await axiosInstance.post(
                ADMIN_SIGNATURE_ENDPOINTS.BASE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Admin signature created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create admin signature');
        }
    }

    /**
     * Update an existing admin signature
     */
    static async updateAdminSignature(
        id: string,
        request: UpdateAdminSignatureRequest
    ): Promise<ApiResponse<AdminSignature>> {
        try {
            const formData = new FormData();

            if (request.fullName) {
                formData.append('fullName', request.fullName);
            }
            if (request.position) {
                formData.append('position', request.position);
            }
            if (request.signatureFile) {
                formData.append('signatureFile', request.signatureFile);
            }
            if (request.isActive !== undefined) {
                formData.append('isActive', String(request.isActive));
            }

            const response: any = await axiosInstance.put(
                ADMIN_SIGNATURE_ENDPOINTS.BY_ID(id),
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Admin signature updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update admin signature');
        }
    }

    /**
     * Delete an admin signature
     */
    static async deleteAdminSignature(id: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.delete(ADMIN_SIGNATURE_ENDPOINTS.BY_ID(id));
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Admin signature deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete admin signature');
        }
    }
}
