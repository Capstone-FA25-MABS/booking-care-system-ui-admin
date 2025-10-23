import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    Language,
    LanguageFormData,
    LanguageSearchParams,
    LanguageListResponse,
} from '@/types/language.types';

// Base API endpoint for language service
const LANGUAGE_ENDPOINTS = {
    BASE: '/languages',
    HEALTH: '/languages/health',
    GET_LANGUAGE: (id: string) => `/languages/${id}`,
    GET_LANGUAGES: '/languages', // Main endpoint with pagination
    GET_ALL_LANGUAGES: '/languages/all', // Simple endpoint without pagination
    CREATE_LANGUAGE: '/languages',
    UPDATE_LANGUAGE: (id: string) => `/languages/${id}`,
    DELETE_LANGUAGE: (id: string) => `/languages/${id}`,
    FILTER_LANGUAGES: '/languages', // Use same endpoint as GET_LANGUAGES
} as const;

export class LanguageService {
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
        console.error('Language service error:', error);

        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const message = error.response.data?.message || error.response.data?.error;

            switch (status) {
                case 400:
                    throw new Error(message || 'Dữ liệu không hợp lệ!');
                case 401:
                    throw new Error('Bạn không có quyền truy cập!');
                case 403:
                    throw new Error('Bạn không có quyền thực hiện hành động này!');
                case 404:
                    throw new Error('Không tìm thấy ngôn ngữ!');
                case 409:
                    throw new Error(message || 'Ngôn ngữ đã tồn tại!');
                case 422:
                    throw new Error(message || 'Dữ liệu không hợp lệ!');
                case 500:
                    throw new Error('Lỗi máy chủ! Vui lòng thử lại sau.');
                default:
                    throw new Error(message || defaultMessage);
            }
        } else if (error.request) {
            // Network error
            throw new Error('Không thể kết nối đến máy chủ!');
        } else {
            // Other error
            throw new Error(error.message || defaultMessage);
        }
    }

    /**
     * Validate language data
     */
    private static validateLanguageData(languageData: LanguageFormData): void {
        if (!languageData.name || languageData.name.trim().length === 0) {
            throw new Error('Tên ngôn ngữ không được để trống!');
        }

        if (languageData.name.trim().length < 2) {
            throw new Error('Tên ngôn ngữ phải có ít nhất 2 ký tự!');
        }

        if (languageData.name.trim().length > 100) {
            throw new Error('Tên ngôn ngữ không được vượt quá 100 ký tự!');
        }

        if (!languageData.status || !['ACTIVE', 'INACTIVE'].includes(languageData.status)) {
            throw new Error('Trạng thái không hợp lệ!');
        }
    }

    /**
     * Health check for language service
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(LANGUAGE_ENDPOINTS.HEALTH);
            return this.formatResponse(response, 'Language service is healthy');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get all languages with pagination
     */
    static async getAllLanguages(
        pageNumber: number = 1,
        pageSize: number = 10,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ): Promise<ApiResponse<LanguageListResponse>> {
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

            const response: any = await axiosInstance.get(LANGUAGE_ENDPOINTS.GET_LANGUAGES, {
                params,
            });

            return this.formatResponse(response, 'Lấy danh sách ngôn ngữ thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get language by ID
     */
    static async getLanguageById(id: string): Promise<ApiResponse<Language>> {
        try {
            const response: any = await axiosInstance.get(LANGUAGE_ENDPOINTS.GET_LANGUAGE(id));
            return this.formatResponse(response, 'Lấy thông tin ngôn ngữ thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Create new language
     */
    static async createLanguage(languageData: LanguageFormData): Promise<ApiResponse<Language>> {
        try {
            // Validate input data
            this.validateLanguageData(languageData);

            console.log('Creating language with data:', {
                name: languageData.name.trim(),
                status: languageData.status,
            });

            const response: any = await axiosInstance.post(LANGUAGE_ENDPOINTS.CREATE_LANGUAGE, {
                name: languageData.name.trim(),
                status: languageData.status,
            });

            console.log('Create language response:', response);

            return this.formatResponse(response, 'Tạo ngôn ngữ thành công');
        } catch (error: any) {
            console.error('Create language error:', error);
            this.handleError(error);
        }
    }

    /**
     * Update language
     */
    static async updateLanguage(
        id: string,
        languageData: LanguageFormData
    ): Promise<ApiResponse<Language>> {
        try {
            // Validate input data
            this.validateLanguageData(languageData);

            console.log('Updating language with data:', {
                id,
                name: languageData.name.trim(),
                status: languageData.status,
            });

            const response: any = await axiosInstance.put(LANGUAGE_ENDPOINTS.UPDATE_LANGUAGE(id), {
                id: id,
                name: languageData.name.trim(),
                status: languageData.status,
            });

            console.log('Update language response:', response);

            return this.formatResponse(response, 'Cập nhật ngôn ngữ thành công');
        } catch (error: any) {
            console.error('Update language error:', error);
            this.handleError(error);
        }
    }

    /**
     * Delete language
     */
    static async deleteLanguage(id: string): Promise<ApiResponse<void>> {
        try {
            console.log('Deleting language with id:', id);

            const response: any = await axiosInstance.delete(
                LANGUAGE_ENDPOINTS.DELETE_LANGUAGE(id)
            );

            console.log('Delete language response:', response);

            return this.formatResponse(response, 'Xóa ngôn ngữ thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Filter languages with search and pagination
     */
    static async filterLanguages(
        params: LanguageSearchParams
    ): Promise<ApiResponse<LanguageListResponse>> {
        try {
            const response: any = await axiosInstance.get(LANGUAGE_ENDPOINTS.GET_LANGUAGES, {
                params,
            });

            return this.formatResponse(response, 'Lọc ngôn ngữ thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    getAllLanguages,
    getLanguageById,
    createLanguage,
    updateLanguage,
    deleteLanguage,
    filterLanguages,
} = LanguageService;
