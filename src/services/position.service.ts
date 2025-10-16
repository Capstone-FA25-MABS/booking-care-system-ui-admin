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
            const response: any = await axiosInstance.post(
                POSITION_ENDPOINTS.CREATE_POSITION,
                positionData
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Position created successfully',
            };
        } catch (error: any) {
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
            const response: any = await axiosInstance.put(
                POSITION_ENDPOINTS.UPDATE_POSITION(id),
                positionData
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Position updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Không thể kết nối đến máy chủ!');
        }
    }

    /**
     * Delete position
     */
    static async deletePosition(id: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.delete(
                POSITION_ENDPOINTS.DELETE_POSITION(id)
            );
            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Position deleted successfully',
            };
        } catch (error: any) {
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
