import { ApiResponse } from '@/configs/axios.config';

/**
 * Base service class with common methods for formatResponse and handleError
 * Used by ServiceCategoryService and ServiceService to reduce code duplication
 */
export abstract class BaseService {
    protected abstract entityName: string;
    protected abstract entityNamePlural: string;

    /**
     * Format API response consistently
     */
    protected formatResponse(response: any, defaultMessage: string): ApiResponse {
        return {
            success: response.success ?? true,
            data: response.data?.data || response.data || response,
            message: response.message || defaultMessage,
        };
    }

    /**
     * Handle common error cases
     */
    protected handleError(
        error: any,
        defaultMessage: string = 'Không thể kết nối đến máy chủ!'
    ): never {
        console.error(`${this.entityName}Service Error:`, error);

        if (error.response?.status === 400) {
            const errorData = error.response.data;
            // Check for error message (from InvalidOperationException)
            if (errorData?.error) {
                throw new Error(errorData.error);
            }
            if (
                errorData?.errors &&
                Array.isArray(errorData.errors) &&
                errorData.errors.length > 0
            ) {
                throw new Error(errorData.errors[0]);
            }
            throw new Error(errorData?.message || 'Dữ liệu không hợp lệ');
        } else if (error.response?.status === 404) {
            throw new Error(`Không tìm thấy ${this.entityName.toLowerCase()}`);
        } else if (error.response?.status === 409) {
            throw new Error(`Tên ${this.entityName.toLowerCase()} đã tồn tại`);
        } else if (error.response?.status === 500) {
            throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
        }
        throw new Error(error.message || defaultMessage);
    }

    /**
     * Validate entity ID
     */
    protected validateEntityId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error(`ID ${this.entityName.toLowerCase()} không hợp lệ`);
        }
    }
}
