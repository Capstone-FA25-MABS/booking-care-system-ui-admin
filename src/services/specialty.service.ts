import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    Specialty,
    SpecialtyFormData,
    SpecialtySearchParams,
    SpecialtyListResponse,
} from '@/types/specialty.types';

// Base API endpoint for specialty service
const SPECIALTY_ENDPOINTS = {
    BASE: '/specialties',
    HEALTH: '/specialties/health',
    GET_SPECIALTY: (id: string) => `/specialties/${id}`,
    GET_SPECIALTIES: '/specialties', // Main endpoint with pagination
    GET_ALL_SPECIALTIES: '/specialties/all', // Simple endpoint without pagination
    CREATE_SPECIALTY: '/specialties',
    UPDATE_SPECIALTY: (id: string) => `/specialties/${id}`,
    DELETE_SPECIALTY: (id: string) => `/specialties/${id}`,
    FILTER_SPECIALTIES: '/specialties', // Use same endpoint as GET_SPECIALTIES
} as const;

export class SpecialtyService {
    /**
     * Helper method to format API response consistently
     */
    private static formatResponse(response: any, defaultMessage: string): ApiResponse {
        return {
            success: response.success ?? true,
            data: response.data || response,
            message: response.message || defaultMessage,
        };
    }

    /**
     * Helper method to handle common error cases
     */
    private static handleError(
        error: any,
        defaultMessage: string = 'Không thể kết nối đến máy chủ!'
    ): never {
        console.error('SpecialtyService Error:', error);

        if (error.response?.status === 400) {
            const errorData = error.response.data;
            console.error('400 Error Data:', errorData);
            if (
                errorData?.errors &&
                Array.isArray(errorData.errors) &&
                errorData.errors.length > 0
            ) {
                throw new Error(errorData.errors[0]);
            }
            throw new Error(errorData?.message || 'Dữ liệu không hợp lệ');
        } else if (error.response?.status === 404) {
            throw new Error('Không tìm thấy chuyên khoa');
        } else if (error.response?.status === 409) {
            console.error('409 Conflict Error:', error.response.data);
            throw new Error('Tên chuyên khoa đã tồn tại');
        } else if (error.response?.status === 500) {
            throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
        }
        throw new Error(error.message || defaultMessage);
    }

    /**
     * Helper method to validate specialty form data
     */
    private static validateSpecialtyData(specialtyData: SpecialtyFormData): void {
        if (!specialtyData.name || specialtyData.name.trim().length === 0) {
            throw new Error('Tên chuyên khoa không được để trống');
        }

        const trimmedName = specialtyData.name.trim();
        if (trimmedName.length < 2) {
            throw new Error('Tên chuyên khoa phải có ít nhất 2 ký tự');
        }

        if (trimmedName.length > 255) {
            throw new Error('Tên chuyên khoa không được vượt quá 255 ký tự');
        }

        if (!specialtyData.imageUrl || specialtyData.imageUrl.trim().length === 0) {
            throw new Error('Hình ảnh chuyên khoa không được để trống');
        }

        if (!specialtyData.status || !['ACTIVE', 'INACTIVE'].includes(specialtyData.status)) {
            throw new Error('Trạng thái không hợp lệ');
        }
    }

    /**
     * Helper method to validate specialty ID
     */
    private static validateSpecialtyId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error('ID chuyên khoa không hợp lệ');
        }
    }

    /**
     * Health check for specialty service
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(SPECIALTY_ENDPOINTS.HEALTH);
            return this.formatResponse(response, 'Specialty service is healthy');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get all specialties with pagination
     */
    static async getAllSpecialties(
        pageNumber: number = 1,
        pageSize: number = 10,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ): Promise<ApiResponse<SpecialtyListResponse>> {
        try {
            const params: any = {
                pageNumber,
                pageSize,
            };

            // Add sorting parameters if provided
            if (sortBy && sortOrder) {
                params.sortBy = sortBy;
                params.sortOrder = sortOrder;
            }

            const response: any = await axiosInstance.get(SPECIALTY_ENDPOINTS.GET_SPECIALTIES, {
                params,
            });

            return this.formatResponse(response, 'Lấy danh sách chuyên khoa thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get specialty by ID
     */
    static async getSpecialtyById(id: string): Promise<ApiResponse<Specialty>> {
        try {
            this.validateSpecialtyId(id);
            const response: any = await axiosInstance.get(SPECIALTY_ENDPOINTS.GET_SPECIALTY(id));
            return this.formatResponse(response, 'Lấy thông tin chuyên khoa thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Create new specialty
     */
    static async createSpecialty(
        specialtyData: SpecialtyFormData
    ): Promise<ApiResponse<Specialty>> {
        try {
            // Validate input data
            this.validateSpecialtyData(specialtyData);

            console.log('Creating specialty with data:', {
                name: specialtyData.name.trim(),
                imageUrl: specialtyData.imageUrl.trim(),
                status: specialtyData.status,
            });

            const response: any = await axiosInstance.post(SPECIALTY_ENDPOINTS.CREATE_SPECIALTY, {
                name: specialtyData.name.trim(),
                imageUrl: specialtyData.imageUrl.trim(),
                status: specialtyData.status,
            });

            console.log('Create specialty response:', response);

            return this.formatResponse(response, 'Tạo chuyên khoa thành công');
        } catch (error: any) {
            console.error('Create specialty error:', error);
            this.handleError(error);
        }
    }

    /**
     * Create new specialty with image upload
     */
    static async createSpecialtyWithImage(
        specialtyData: SpecialtyFormData & { imageFile: File }
    ): Promise<ApiResponse<Specialty>> {
        try {
            // Validate input data
            this.validateSpecialtyData(specialtyData);

            const formData = new FormData();
            formData.append('Name', specialtyData.name.trim());
            formData.append('Status', specialtyData.status);
            formData.append('imageFile', specialtyData.imageFile);

            console.log('Creating specialty with image upload:', {
                name: specialtyData.name.trim(),
                status: specialtyData.status,
                imageFile: specialtyData.imageFile.name,
            });

            const response: any = await axiosInstance.post('/specialties/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            console.log('Create specialty with image response:', response);

            return this.formatResponse(response, 'Tạo chuyên khoa thành công');
        } catch (error: any) {
            console.error('Create specialty with image error:', error);
            this.handleError(error);
        }
    }

    /**
     * Update specialty
     */
    static async updateSpecialty(
        id: string,
        specialtyData: SpecialtyFormData
    ): Promise<ApiResponse<Specialty>> {
        try {
            // Validate input data
            this.validateSpecialtyId(id);
            this.validateSpecialtyData(specialtyData);

            const payload = {
                id: id,
                name: specialtyData.name.trim(),
                imageUrl: specialtyData.imageUrl.trim(),
                status: specialtyData.status,
            };

            console.log('Update Specialty API Call:', {
                url: SPECIALTY_ENDPOINTS.UPDATE_SPECIALTY(id),
                payload: payload,
            });

            const response: any = await axiosInstance.put(
                SPECIALTY_ENDPOINTS.UPDATE_SPECIALTY(id),
                payload
            );

            console.log('Update specialty response:', response);

            return this.formatResponse(response, 'Cập nhật chuyên khoa thành công');
        } catch (error: any) {
            console.error('Update specialty error:', error);
            this.handleError(error);
        }
    }

    /**
     * Update specialty with image upload
     */
    static async updateSpecialtyWithImage(
        id: string,
        specialtyData: SpecialtyFormData & { imageFile: File }
    ): Promise<ApiResponse<Specialty>> {
        try {
            // Validate input data
            this.validateSpecialtyId(id);
            this.validateSpecialtyData(specialtyData);

            const formData = new FormData();
            formData.append('Id', id);
            formData.append('Name', specialtyData.name.trim());
            formData.append('Status', specialtyData.status);
            formData.append('imageFile', specialtyData.imageFile);

            console.log('Update Specialty with image API Call:', {
                url: `/specialties/${id}/upload-image`,
                formData: {
                    id,
                    name: specialtyData.name.trim(),
                    status: specialtyData.status,
                    imageFile: specialtyData.imageFile.name,
                },
            });

            const response: any = await axiosInstance.put(
                `/specialties/${id}/upload-image`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }
            );

            console.log('Update specialty with image response:', response);

            return this.formatResponse(response, 'Cập nhật chuyên khoa thành công');
        } catch (error: any) {
            console.error('Update specialty with image error:', error);
            this.handleError(error);
        }
    }

    /**
     * Delete specialty
     */
    static async deleteSpecialty(id: string): Promise<ApiResponse<void>> {
        try {
            // Validate input data
            this.validateSpecialtyId(id);

            const response: any = await axiosInstance.delete(
                SPECIALTY_ENDPOINTS.DELETE_SPECIALTY(id)
            );

            return this.formatResponse(response, 'Xóa chuyên khoa thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get all specialties (no pagination) - Optimized for performance
     */
    static async getAllSpecialtiesSimple(): Promise<ApiResponse<Specialty[]>> {
        try {
            const response: any = await axiosInstance.get(SPECIALTY_ENDPOINTS.GET_ALL_SPECIALTIES);
            return this.formatResponse(response, 'Lấy tất cả chuyên khoa thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Filter specialties with search and pagination
     */
    static async filterSpecialties(
        params: SpecialtySearchParams
    ): Promise<ApiResponse<SpecialtyListResponse>> {
        try {
            const response: any = await axiosInstance.get(SPECIALTY_ENDPOINTS.GET_SPECIALTIES, {
                params,
            });

            return this.formatResponse(response, 'Lọc chuyên khoa thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    getAllSpecialties,
    getAllSpecialtiesSimple,
    getSpecialtyById,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    filterSpecialties,
} = SpecialtyService;
