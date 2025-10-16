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
     * Health check for position service
     */
    static async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(POSITION_ENDPOINTS.HEALTH);
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Position service is healthy',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Không thể kết nối đến máy chủ!');
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

            // Backend returns PositionListResponse directly
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Positions retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }

    /**
     * Get position by ID
     */
    static async getPositionById(id: string): Promise<ApiResponse<Position>> {
        try {
            const response: any = await axiosInstance.get(POSITION_ENDPOINTS.GET_POSITION(id));
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Position retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }

    /**
     * Create new position
     */
    static async createPosition(positionData: PositionFormData): Promise<ApiResponse<Position>> {
        try {
            // Validate input data
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

            const response: any = await axiosInstance.post(POSITION_ENDPOINTS.CREATE_POSITION, {
                name: trimmedName,
                status: positionData.status,
            });

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Tạo chức vụ thành công',
            };
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 400) {
                // Handle validation errors from backend
                const errorData = error.response.data;
                if (
                    errorData?.errors &&
                    Array.isArray(errorData.errors) &&
                    errorData.errors.length > 0
                ) {
                    // Show the first validation error
                    throw new Error(errorData.errors[0]);
                }
                throw new Error(errorData?.message || 'Dữ liệu không hợp lệ');
            } else if (error.response?.status === 409) {
                throw new Error('Tên chức vụ đã tồn tại');
            } else if (error.response?.status === 500) {
                throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
            }
            throw new Error(error.message || 'Không thể kết nối đến máy chủ!');
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
            if (!id || id.trim().length === 0) {
                throw new Error('ID chức vụ không hợp lệ');
            }

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

            const payload = {
                id: id,
                name: trimmedName,
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

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Cập nhật chức vụ thành công',
            };
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 400) {
                // Handle validation errors from backend
                const errorData = error.response.data;
                if (
                    errorData?.errors &&
                    Array.isArray(errorData.errors) &&
                    errorData.errors.length > 0
                ) {
                    // Show the first validation error
                    throw new Error(errorData.errors[0]);
                }
                throw new Error(errorData?.message || 'Dữ liệu không hợp lệ');
            } else if (error.response?.status === 404) {
                throw new Error('Không tìm thấy chức vụ');
            } else if (error.response?.status === 409) {
                throw new Error('Tên chức vụ đã tồn tại');
            } else if (error.response?.status === 500) {
                throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
            }
            throw new Error(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }

    /**
     * Delete position
     */
    static async deletePosition(id: string): Promise<ApiResponse<void>> {
        try {
            // Validate input data
            if (!id || id.trim().length === 0) {
                throw new Error('ID chức vụ không hợp lệ');
            }

            const response: any = await axiosInstance.delete(
                POSITION_ENDPOINTS.DELETE_POSITION(id)
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Xóa chức vụ thành công',
            };
        } catch (error: any) {
            // Handle specific error cases
            if (error.response?.status === 404) {
                throw new Error('Không tìm thấy chức vụ cần xóa');
            } else if (error.response?.status === 409) {
                throw new Error('Không thể xóa chức vụ này vì đang được sử dụng');
            } else if (error.response?.status === 500) {
                throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
            }
            throw new Error(error.message || 'Không thể kết nối đến máy chủ!');
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

            // Backend returns PositionListResponse directly
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Positions filtered successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }
}

// Export individual methods for convenience
export const {
    healthCheck,
    getAllPositions,
    getPositionById,
    createPosition,
    updatePosition,
    deletePosition,
    filterPositions,
} = PositionService;
