import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import { ServiceCategory, ServiceCategoryFormData } from '@/types/serviceCategory.types';
import { BaseService } from './baseService';

const SERVICE_CATEGORY_ENDPOINTS = {
    GET_ALL_DETAILS: '/medical-services/servicecategories/all-details',
    GET_ENTITY: (id: string) => `/medical-services/servicecategories/${id}`,
    CREATE_ENTITY: '/medical-services/servicecategories',
    UPDATE_ENTITY: (id: string) => `/medical-services/servicecategories/${id}`,
    DELETE_ENTITY: (id: string) => `/medical-services/servicecategories/${id}`,
} as const;

export class ServiceCategoryService extends BaseService {
    protected entityName = 'Danh Mục Dịch Vụ';
    protected entityNamePlural = 'Danh Mục Dịch Vụ';

    /**
     * Get all service categories with details and sorting
     */
    async getAllServiceCategories(
        sortBy?: string,
        sortDirection?: 'asc' | 'desc'
    ): Promise<ApiResponse<ServiceCategory[]>> {
        try {
            const queryParams: any = {};

            if (sortBy) {
                queryParams.sortBy = sortBy;
            }

            if (sortDirection) {
                queryParams.sortDirection = sortDirection;
            }

            const response: any = await axiosInstance.get(
                SERVICE_CATEGORY_ENDPOINTS.GET_ALL_DETAILS,
                {
                    params: queryParams,
                }
            );

            // Transform response: API returns { serviceCategories: [...], totalCount: ... }
            // Axios interceptor already returns response.data, so response is the actual data
            const categories =
                response?.serviceCategories || response?.data?.serviceCategories || [];

            return this.formatResponse(
                { data: categories },
                `Lấy tất cả ${this.entityNamePlural.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getServiceCategoryById(id: string): Promise<ApiResponse<ServiceCategory>> {
        try {
            this.validateEntityId(id);
            const response: any = await axiosInstance.get(
                SERVICE_CATEGORY_ENDPOINTS.GET_ENTITY(id)
            );
            return this.formatResponse(
                response,
                `Lấy thông tin ${this.entityName.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async createServiceCategory(
        data: ServiceCategoryFormData
    ): Promise<ApiResponse<ServiceCategory>> {
        try {
            if (!data.name || data.name.trim().length === 0) {
                throw new Error(`Tên ${this.entityName.toLowerCase()} không được để trống`);
            }

            const payload = {
                name: data.name.trim(),
                description: data.description?.trim() || '',
                imageUrl: data.imageUrl,
                status: data.status,
                parentId: data.parentId || null,
            };

            const response: any = await axiosInstance.post(
                SERVICE_CATEGORY_ENDPOINTS.CREATE_ENTITY,
                payload
            );

            return this.formatResponse(response, `Tạo ${this.entityName.toLowerCase()} thành công`);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async updateServiceCategory(
        id: string,
        data: ServiceCategoryFormData
    ): Promise<ApiResponse<ServiceCategory>> {
        try {
            this.validateEntityId(id);

            if (!data.name || data.name.trim().length === 0) {
                throw new Error(`Tên ${this.entityName.toLowerCase()} không được để trống`);
            }

            const payload = {
                name: data.name.trim(),
                description: data.description?.trim() || '',
                imageUrl: data.imageUrl,
                status: data.status,
                parentId: data.parentId || null,
            };

            const response: any = await axiosInstance.put(
                SERVICE_CATEGORY_ENDPOINTS.UPDATE_ENTITY(id),
                payload
            );

            return this.formatResponse(
                response,
                `Cập nhật ${this.entityName.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async deleteServiceCategory(id: string): Promise<ApiResponse<void>> {
        try {
            this.validateEntityId(id);

            const response: any = await axiosInstance.delete(
                SERVICE_CATEGORY_ENDPOINTS.DELETE_ENTITY(id)
            );

            return this.formatResponse(response, `Xóa ${this.entityName.toLowerCase()} thành công`);
        } catch (error: any) {
            this.handleError(error);
        }
    }
}

// Export singleton instance
export const serviceCategoryService = new ServiceCategoryService();

// Export individual functions for convenience
export const getAllServiceCategories = async (
    sortBy?: string,
    sortDirection?: 'asc' | 'desc'
): Promise<ApiResponse<ServiceCategory[]>> => {
    return serviceCategoryService.getAllServiceCategories(sortBy, sortDirection);
};

export const getServiceCategoryById = async (id: string): Promise<ApiResponse<ServiceCategory>> => {
    return serviceCategoryService.getServiceCategoryById(id);
};

export const createServiceCategory = async (
    data: ServiceCategoryFormData
): Promise<ApiResponse<ServiceCategory>> => {
    return serviceCategoryService.createServiceCategory(data);
};

export const updateServiceCategory = async (
    id: string,
    data: ServiceCategoryFormData
): Promise<ApiResponse<ServiceCategory>> => {
    return serviceCategoryService.updateServiceCategory(id, data);
};

export const deleteServiceCategory = async (id: string): Promise<ApiResponse<void>> => {
    return serviceCategoryService.deleteServiceCategory(id);
};
