import { BaseEntityService, BaseEntityListResponse } from './baseEntity.service';
import { ApiResponse } from '@/configs/axios.config';
import axiosInstance from '@/configs/axios.config';
import {
    ServiceType,
    ServiceTypeFormData,
    ServiceTypeSearchParams,
} from '@/types/serviceType.types';

export type ServiceTypeListResponse = BaseEntityListResponse<ServiceType>;

// ServiceType service endpoints
const SERVICE_TYPE_ENDPOINTS = {
    BASE: '/servicetypes',
    HEALTH: '/servicetypes/health',
    GET_ENTITY: (id: string) => `/servicetypes/${id}`,
    GET_ENTITIES: '/servicetypes',
    GET_ALL_ENTITIES: '/servicetypes/all',
    CREATE_ENTITY: '/servicetypes',
    UPDATE_ENTITY: (id: string) => `/servicetypes/${id}`,
    DELETE_ENTITY: (id: string) => `/servicetypes/${id}`,
    FILTER_ENTITIES: '/servicetypes',
} as const;

export class ServiceTypeService extends BaseEntityService<
    ServiceType,
    ServiceTypeFormData,
    ServiceTypeSearchParams
> {
    protected endpoints = SERVICE_TYPE_ENDPOINTS;
    protected entityName = 'Loại Dịch Vụ';
    protected entityNamePlural = 'Loại Dịch Vụ';

    /**
     * Override validateEntityData to include imageUrl validation
     */
    protected validateEntityData(serviceTypeData: ServiceTypeFormData): void {
        super.validateEntityData(serviceTypeData);

        if (!serviceTypeData.imageUrl || serviceTypeData.imageUrl.trim().length === 0) {
            throw new Error('Hình ảnh loại dịch vụ không được để trống');
        }
    }

    /**
     * Override createEntity to include imageUrl in payload
     */
    async createEntity(serviceTypeData: ServiceTypeFormData): Promise<ApiResponse<ServiceType>> {
        this.validateEntityData(serviceTypeData);

        // Validate description - required field
        if (!serviceTypeData.description || serviceTypeData.description.trim().length === 0) {
            throw new Error('Mô tả loại dịch vụ không được để trống');
        }

        const trimmedDescription = serviceTypeData.description.trim();
        if (trimmedDescription.length < 10) {
            throw new Error('Mô tả loại dịch vụ phải có ít nhất 10 ký tự');
        }
        if (trimmedDescription.length > 255) {
            throw new Error('Mô tả loại dịch vụ không được vượt quá 255 ký tự');
        }

        const payload = {
            name: serviceTypeData.name.trim(),
            description: serviceTypeData.description?.trim() || '',
            imageUrl: serviceTypeData.imageUrl.trim(),
            status: serviceTypeData.status,
        };

        console.log('Create payload:', payload);

        // Override base createEntity to send full payload
        try {
            const response = await axiosInstance.post(
                SERVICE_TYPE_ENDPOINTS.CREATE_ENTITY,
                payload
            );
            return this.formatResponse(response.data, 'Tạo loại dịch vụ thành công');
        } catch (error: any) {
            console.error('Error creating service type:', error);
            throw new Error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo loại dịch vụ');
        }
    }

    /**
     * Override updateEntity to include imageUrl in payload
     */
    async updateEntity(
        id: string,
        serviceTypeData: ServiceTypeFormData
    ): Promise<ApiResponse<ServiceType>> {
        // Validate required fields
        if (!serviceTypeData.name || serviceTypeData.name.trim().length === 0) {
            throw new Error('Tên loại dịch vụ không được để trống');
        }

        // Validate description - required field
        if (!serviceTypeData.description || serviceTypeData.description.trim().length === 0) {
            throw new Error('Mô tả loại dịch vụ không được để trống');
        }

        const trimmedDescription = serviceTypeData.description.trim();
        if (trimmedDescription.length < 10) {
            throw new Error('Mô tả loại dịch vụ phải có ít nhất 10 ký tự');
        }
        if (trimmedDescription.length > 255) {
            throw new Error('Mô tả loại dịch vụ không được vượt quá 255 ký tự');
        }

        // Prepare base payload
        const payload: any = {
            id: id,
            name: serviceTypeData.name.trim(),
            description: serviceTypeData.description?.trim() || '',
            status: serviceTypeData.status,
        };

        // Handle imageUrl - only include if provided and valid
        if (serviceTypeData.imageUrl && serviceTypeData.imageUrl.trim().length > 0) {
            // Validate URL format
            try {
                new URL(serviceTypeData.imageUrl.trim());
                payload.imageUrl = serviceTypeData.imageUrl.trim();
                console.log('Valid imageUrl provided:', payload.imageUrl);
            } catch {
                console.error('Invalid imageUrl format:', serviceTypeData.imageUrl);
                throw new Error('URL hình ảnh không hợp lệ');
            }
        }
        // Note: If imageUrl is empty, we let backend handle preserving existing image
        // This is safer than trying to fetch existing entity on frontend

        console.log('Update payload:', payload);

        try {
            const response = await axiosInstance.put(
                SERVICE_TYPE_ENDPOINTS.UPDATE_ENTITY(id),
                payload
            );
            return this.formatResponse(response.data, 'Cập nhật loại dịch vụ thành công');
        } catch (error: any) {
            console.error('Error updating service type:', error);
            throw new Error(
                error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật loại dịch vụ'
            );
        }
    }

    /**
     * Create new service type with image upload
     */
    async createServiceTypeWithImage(
        serviceTypeData: ServiceTypeFormData & { imageFile: File }
    ): Promise<ApiResponse<ServiceType>> {
        try {
            // Validate input data
            this.validateEntityData(serviceTypeData);

            const formData = new FormData();
            formData.append('Name', serviceTypeData.name.trim());
            formData.append('Description', serviceTypeData.description?.trim() || '');
            formData.append('Status', serviceTypeData.status);
            formData.append('imageFile', serviceTypeData.imageFile);

            const response = await axiosInstance.post(
                `${this.endpoints.CREATE_ENTITY}/upload-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return this.formatResponse(response, 'Tạo loại dịch vụ với hình ảnh thành công');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Update service type with image upload
     */
    async updateServiceTypeWithImage(
        id: string,
        serviceTypeData: ServiceTypeFormData & { imageFile: File }
    ): Promise<ApiResponse<ServiceType>> {
        try {
            // Validate input data
            this.validateEntityData(serviceTypeData);

            const formData = new FormData();
            formData.append('Id', id);
            formData.append('Name', serviceTypeData.name.trim());
            formData.append('Description', serviceTypeData.description?.trim() || '');
            formData.append('Status', serviceTypeData.status);
            formData.append('imageFile', serviceTypeData.imageFile);

            console.log('Update service type with image:', {
                id,
                name: serviceTypeData.name.trim(),
                description: serviceTypeData.description?.trim() || '',
                status: serviceTypeData.status,
                imageFile: serviceTypeData.imageFile.name,
            });

            const response = await axiosInstance.put(
                `${this.endpoints.UPDATE_ENTITY(id)}/upload-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return this.formatResponse(response, 'Cập nhật loại dịch vụ với hình ảnh thành công');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Update service type without changing image (preserve existing image)
     */
    async updateServiceTypeWithoutImage(
        id: string,
        serviceTypeData: ServiceTypeFormData
    ): Promise<ApiResponse<ServiceType>> {
        try {
            // Validate input data
            this.validateEntityData(serviceTypeData);

            const payload = {
                id: id,
                name: serviceTypeData.name.trim(),
                description: serviceTypeData.description?.trim() || '',
                status: serviceTypeData.status,
                // Don't include imageUrl - let backend preserve existing image
            };

            console.log('Update service type without image change:', payload);

            const response = await axiosInstance.put(this.endpoints.UPDATE_ENTITY(id), payload);

            return this.formatResponse(response, 'Cập nhật loại dịch vụ thành công');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Update service type and remove image (set imageUrl to empty)
     */
    async updateServiceTypeRemoveImage(
        id: string,
        serviceTypeData: ServiceTypeFormData
    ): Promise<ApiResponse<ServiceType>> {
        try {
            // Validate input data
            this.validateEntityData(serviceTypeData);

            const payload = {
                id: id,
                name: serviceTypeData.name.trim(),
                description: serviceTypeData.description?.trim() || '',
                status: serviceTypeData.status,
                imageUrl: '', // Explicitly set to empty to remove image
            };

            console.log('Update service type and remove image:', payload);

            const response = await axiosInstance.put(this.endpoints.UPDATE_ENTITY(id), payload);

            return this.formatResponse(
                response,
                'Cập nhật loại dịch vụ và xóa hình ảnh thành công'
            );
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Get active service types (simple version)
     */
    async getActiveServiceTypesSimple(): Promise<ApiResponse<ServiceType[]>> {
        return this.getActiveEntities();
    }

    /**
     * Toggle service type status
     */
    async toggleEntityStatus(id: string): Promise<ApiResponse<void>> {
        try {
            const response = await axiosInstance.patch(
                `${this.endpoints.UPDATE_ENTITY(id)}/toggle-status`
            );
            return this.formatResponse(response, 'Chuyển đổi trạng thái loại dịch vụ thành công');
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    /**
     * Get service types by IDs
     */
    async getServiceTypesByIds(ids: string[]): Promise<ApiResponse<ServiceType[]>> {
        try {
            const response: any = await axiosInstance.post(`${this.endpoints.BASE}/by-ids`, ids);
            return this.formatResponse(
                response,
                `Lấy danh sách ${this.entityNamePlural.toLowerCase()} theo ID thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Check if service type name exists
     */
    async checkNameExists(name: string, excludeId?: string): Promise<ApiResponse<boolean>> {
        try {
            const params = new URLSearchParams({ name });
            if (excludeId) {
                params.append('excludeId', excludeId);
            }
            const response: any = await axiosInstance.get(
                `${this.endpoints.BASE}/name-exists?${params.toString()}`
            );
            return this.formatResponse(
                response,
                `Kiểm tra tên ${this.entityName.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get active service types
     */
    async getActiveEntities(): Promise<ApiResponse<ServiceType[]>> {
        try {
            const response: any = await axiosInstance.get(`${this.endpoints.BASE}/active`);
            return this.formatResponse(
                response,
                `Lấy danh sách ${this.entityNamePlural.toLowerCase()} hoạt động thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }
}

// Export individual functions for use in slices (similar to specialty.service.ts)
export const getAllServiceTypes = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
): Promise<ApiResponse<ServiceTypeListResponse>> => {
    const service = new ServiceTypeService();
    return service.getAllEntities(pageNumber, pageSize, sortBy, sortOrder);
};

export const getAllServiceTypesSimple = async (): Promise<ApiResponse<ServiceType[]>> => {
    const service = new ServiceTypeService();
    return service.getAllEntitiesSimple();
};

export const getServiceTypeById = async (id: string): Promise<ApiResponse<ServiceType>> => {
    const service = new ServiceTypeService();
    return service.getEntityById(id);
};

export const createServiceType = async (
    data: ServiceTypeFormData
): Promise<ApiResponse<ServiceType>> => {
    const service = new ServiceTypeService();
    return service.createEntity(data);
};

export const createServiceTypeWithImage = async (
    data: ServiceTypeFormData,
    imageFile: File
): Promise<ApiResponse<ServiceType>> => {
    const service = new ServiceTypeService();
    return service.createServiceTypeWithImage({ ...data, imageFile });
};

export const updateServiceType = async (
    id: string,
    data: ServiceTypeFormData
): Promise<ApiResponse<ServiceType>> => {
    const service = new ServiceTypeService();
    return service.updateEntity(id, data);
};

export const updateServiceTypeWithImage = async (
    id: string,
    data: ServiceTypeFormData,
    imageFile: File
): Promise<ApiResponse<ServiceType>> => {
    const service = new ServiceTypeService();
    return service.updateServiceTypeWithImage(id, { ...data, imageFile });
};

export const updateServiceTypeWithoutImage = async (
    id: string,
    data: ServiceTypeFormData
): Promise<ApiResponse<ServiceType>> => {
    const service = new ServiceTypeService();
    return service.updateServiceTypeWithoutImage(id, data);
};

export const updateServiceTypeRemoveImage = async (
    id: string,
    data: ServiceTypeFormData
): Promise<ApiResponse<ServiceType>> => {
    const service = new ServiceTypeService();
    return service.updateServiceTypeRemoveImage(id, data);
};

export const deleteServiceType = async (id: string): Promise<ApiResponse<void>> => {
    const service = new ServiceTypeService();
    return service.deleteEntity(id);
};

export const toggleServiceTypeStatus = async (id: string): Promise<ApiResponse<void>> => {
    const service = new ServiceTypeService();
    return service.toggleEntityStatus(id);
};

export const filterServiceTypes = async (
    params: ServiceTypeSearchParams
): Promise<ApiResponse<ServiceTypeListResponse>> => {
    const service = new ServiceTypeService();
    return service.filterEntities(params);
};

// Export singleton instance
export const serviceTypeService = new ServiceTypeService();
