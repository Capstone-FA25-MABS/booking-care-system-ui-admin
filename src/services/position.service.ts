import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    Position,
    PositionFormData,
    PositionSearchParams,
    PositionListResponse,
} from '@/types/position.types';

// Base API endpoint for position service
const POSITION_ENDPOINTS = {
    BASE: '/positions',
    HEALTH: '/positions/health',
    GET_POSITION: (id: string) => `/positions/${id}`,
    GET_POSITIONS: '/positions', // Main endpoint with pagination
    GET_ALL_POSITIONS: '/positions/all', // Simple endpoint without pagination
    CREATE_POSITION: '/positions',
    UPDATE_POSITION: (id: string) => `/positions/${id}`,
    DELETE_POSITION: (id: string) => `/positions/${id}`,
    FILTER_POSITIONS: '/positions', // Use same endpoint as GET_POSITIONS
} as const;

export class PositionService {
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
        console.error('PositionService Error:', error);

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
            throw new Error('Không tìm thấy chức vụ');
        } else if (error.response?.status === 409) {
            console.error('409 Conflict Error:', error.response.data);
            throw new Error('Tên chức vụ đã tồn tại');
        } else if (error.response?.status === 500) {
            throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
        }
        throw new Error(error.message || defaultMessage);
    }

    /**
     * Helper method to validate position form data
     */
    private static validatePositionData(positionData: PositionFormData): void {
        if (!positionData.name || positionData.name.trim().length === 0) {
            throw new Error('Tên chức vụ không được để trống');
        }

        const trimmedName = positionData.name.trim();
        if (trimmedName.length < 2) {
            throw new Error('Tên chức vụ phải có ít nhất 2 ký tự');
        }

        if (trimmedName.length > 255) {
            throw new Error('Tên chức vụ không được vượt quá 255 ký tự');
        }

        if (!positionData.status || !['ACTIVE', 'INACTIVE'].includes(positionData.status)) {
            throw new Error('Trạng thái không hợp lệ');
        }
    }

    /**
     * Helper method to validate position ID
     */
    private static validatePositionId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error('ID chức vụ không hợp lệ');
        }
    }

    /**
     * Health check for position service
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(POSITION_ENDPOINTS.HEALTH);
            return this.formatResponse(response, 'Position service is healthy');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get all positions with pagination
     */
    static async getAllPositions(
        pageNumber: number = 1,
        pageSize: number = 10,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ): Promise<ApiResponse<PositionListResponse>> {
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

            const response: any = await axiosInstance.get(POSITION_ENDPOINTS.GET_POSITIONS, {
                params,
            });

            return this.formatResponse(response, 'Positions retrieved successfully');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get position by ID
     */
    static async getPositionById(id: string): Promise<ApiResponse<Position>> {
        try {
            this.validatePositionId(id);
            const response: any = await axiosInstance.get(POSITION_ENDPOINTS.GET_POSITION(id));
            return this.formatResponse(response, 'Position retrieved successfully');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Create new position
     */
    static async createPosition(positionData: PositionFormData): Promise<ApiResponse<Position>> {
        try {
            // Validate input data
            this.validatePositionData(positionData);

            console.log('Creating position with data:', {
                name: positionData.name.trim(),
                status: positionData.status,
            });

            const response: any = await axiosInstance.post(POSITION_ENDPOINTS.CREATE_POSITION, {
                name: positionData.name.trim(),
                status: positionData.status,
            });

            console.log('Create position response:', response);

            return this.formatResponse(response, 'Tạo chức vụ thành công');
        } catch (error: any) {
            console.error('Create position error:', error);
            this.handleError(error);
        }
    }

    /**
     * Update position
     */
    static async updatePosition(
        id: string,
        positionData: PositionFormData
    ): Promise<ApiResponse<Position>> {
        try {
            // Validate input data
            this.validatePositionId(id);
            this.validatePositionData(positionData);

            const payload = {
                id: id,
                name: positionData.name.trim(),
                status: positionData.status,
            };

            console.log('Update Position API Call:', {
                url: POSITION_ENDPOINTS.UPDATE_POSITION(id),
                payload: payload,
            });

            const response: any = await axiosInstance.put(
                POSITION_ENDPOINTS.UPDATE_POSITION(id),
                payload
            );

            console.log('Update position response:', response);

            return this.formatResponse(response, 'Cập nhật chức vụ thành công');
        } catch (error: any) {
            console.error('Update position error:', error);
            this.handleError(error);
        }
    }

    /**
     * Delete position
     */
    static async deletePosition(id: string): Promise<ApiResponse<void>> {
        try {
            // Validate input data
            this.validatePositionId(id);

            const response: any = await axiosInstance.delete(
                POSITION_ENDPOINTS.DELETE_POSITION(id)
            );

            return this.formatResponse(response, 'Xóa chức vụ thành công');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get all positions (no pagination) - Optimized for performance
     */
    static async getAllPositionsSimple(): Promise<ApiResponse<Position[]>> {
        try {
            const response: any = await axiosInstance.get(POSITION_ENDPOINTS.GET_ALL_POSITIONS);
            return this.formatResponse(response, 'All positions retrieved successfully');
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Filter positions with search and pagination
     */
    static async filterPositions(
        params: PositionSearchParams
    ): Promise<ApiResponse<PositionListResponse>> {
        try {
            const response: any = await axiosInstance.get(POSITION_ENDPOINTS.GET_POSITIONS, {
                params,
            });

            return this.formatResponse(response, 'Positions filtered successfully');
        } catch (error: any) {
            this.handleError(error);
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    getAllPositions,
    getAllPositionsSimple,
    getPositionById,
    createPosition,
    updatePosition,
    deletePosition,
    filterPositions,
} = PositionService;
