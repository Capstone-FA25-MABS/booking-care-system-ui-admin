import axiosInstance, { ApiResponse } from '@/configs/axios.config';

export interface BaseEntityFormData {
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface BaseEntitySearchParams {
    pageNumber?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    searchTerm?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

export interface BaseEntityListResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface BaseEntityEndpoints {
    BASE: string;
    HEALTH: string;
    GET_ENTITY: (id: string) => string;
    GET_ENTITIES: string;
    GET_ALL_ENTITIES: string;
    CREATE_ENTITY: string;
    UPDATE_ENTITY: (id: string) => string;
    DELETE_ENTITY: (id: string) => string;
    FILTER_ENTITIES: string;
}

export abstract class BaseEntityService<
    T,
    TFormData extends BaseEntityFormData,
    TSearchParams extends BaseEntitySearchParams,
> {
    protected abstract endpoints: BaseEntityEndpoints;
    protected abstract entityName: string;
    protected abstract entityNamePlural: string;

    /**
     * Helper method to format API response consistently
     */
    protected formatResponse(response: any, defaultMessage: string): ApiResponse {
        return {
            success: response.success ?? true,
            data: response.data?.data || response.data || response,
            message: response.message || defaultMessage,
        };
    }

    /**
     * Helper method to handle common error cases
     */
    protected handleError(
        error: any,
        defaultMessage: string = 'Không thể kết nối đến máy chủ!'
    ): never {
        console.error(`${this.entityName}Service Error:`, error);

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
            throw new Error(`Không tìm thấy ${this.entityName.toLowerCase()}`);
        } else if (error.response?.status === 409) {
            console.error('409 Conflict Error:', error.response.data);
            throw new Error(`Tên ${this.entityName.toLowerCase()} đã tồn tại`);
        } else if (error.response?.status === 500) {
            throw new Error('Lỗi máy chủ. Vui lòng thử lại sau');
        }
        throw new Error(error.message || defaultMessage);
    }

    /**
     * Helper method to validate entity form data
     */
    protected validateEntityData(entityData: TFormData): void {
        if (!entityData.name || entityData.name.trim().length === 0) {
            throw new Error(`Tên ${this.entityName.toLowerCase()} không được để trống`);
        }

        const trimmedName = entityData.name.trim();
        if (trimmedName.length < 2) {
            throw new Error(`Tên ${this.entityName.toLowerCase()} phải có ít nhất 2 ký tự`);
        }

        if (trimmedName.length > 255) {
            throw new Error(`Tên ${this.entityName.toLowerCase()} không được vượt quá 255 ký tự`);
        }

        if (!entityData.status || !['ACTIVE', 'INACTIVE'].includes(entityData.status)) {
            throw new Error('Trạng thái không hợp lệ');
        }
    }

    /**
     * Helper method to validate entity ID
     */
    protected validateEntityId(id: string): void {
        if (!id || id.trim().length === 0) {
            throw new Error(`ID ${this.entityName.toLowerCase()} không hợp lệ`);
        }
    }

    /**
     * Health check for entity service
     */
    async healthCheck(): Promise<ApiResponse> {
        try {
            const response: any = await axiosInstance.get(this.endpoints.HEALTH);
            return this.formatResponse(response, `${this.entityName} service is healthy`);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get all entities with pagination
     */
    async getAllEntities(
        pageNumber: number = 1,
        pageSize: number = 10,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ): Promise<ApiResponse<BaseEntityListResponse<T>>> {
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

            const response: any = await axiosInstance.get(this.endpoints.GET_ENTITIES, {
                params,
            });

            return this.formatResponse(
                response,
                `Lấy danh sách ${this.entityNamePlural.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get entity by ID
     */
    async getEntityById(id: string): Promise<ApiResponse<T>> {
        try {
            this.validateEntityId(id);
            const response: any = await axiosInstance.get(this.endpoints.GET_ENTITY(id));
            return this.formatResponse(
                response,
                `Lấy thông tin ${this.entityName.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Create new entity
     */
    async createEntity(entityData: TFormData): Promise<ApiResponse<T>> {
        try {
            // Validate input data
            this.validateEntityData(entityData);

            console.log(`Creating ${this.entityName.toLowerCase()} with data:`, {
                name: entityData.name.trim(),
                status: entityData.status,
            });

            const response: any = await axiosInstance.post(this.endpoints.CREATE_ENTITY, {
                name: entityData.name.trim(),
                status: entityData.status,
            });

            console.log(`Create ${this.entityName.toLowerCase()} response:`, response);

            return this.formatResponse(response, `Tạo ${this.entityName.toLowerCase()} thành công`);
        } catch (error: any) {
            console.error(`Create ${this.entityName.toLowerCase()} error:`, error);
            this.handleError(error);
        }
    }

    /**
     * Update entity
     */
    async updateEntity(id: string, entityData: TFormData): Promise<ApiResponse<T>> {
        try {
            // Validate input data
            this.validateEntityId(id);
            this.validateEntityData(entityData);

            const payload = {
                id: id,
                name: entityData.name.trim(),
                status: entityData.status,
            };

            console.log(`Update ${this.entityName} API Call:`, {
                url: this.endpoints.UPDATE_ENTITY(id),
                payload: payload,
            });

            const response: any = await axiosInstance.put(
                this.endpoints.UPDATE_ENTITY(id),
                payload
            );

            console.log(`Update ${this.entityName.toLowerCase()} response:`, response);

            return this.formatResponse(
                response,
                `Cập nhật ${this.entityName.toLowerCase()} thành công`
            );
        } catch (error: any) {
            console.error(`Update ${this.entityName.toLowerCase()} error:`, error);
            this.handleError(error);
        }
    }

    /**
     * Delete entity
     */
    async deleteEntity(id: string): Promise<ApiResponse<void>> {
        try {
            // Validate input data
            this.validateEntityId(id);

            const response: any = await axiosInstance.delete(this.endpoints.DELETE_ENTITY(id));

            return this.formatResponse(response, `Xóa ${this.entityName.toLowerCase()} thành công`);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get all entities (no pagination) - Optimized for performance
     */
    async getAllEntitiesSimple(): Promise<ApiResponse<T[]>> {
        try {
            const response: any = await axiosInstance.get(this.endpoints.GET_ALL_ENTITIES);
            return this.formatResponse(
                response,
                `Lấy tất cả ${this.entityNamePlural.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Filter entities with search and pagination
     */
    async filterEntities(params: TSearchParams): Promise<ApiResponse<BaseEntityListResponse<T>>> {
        try {
            const response: any = await axiosInstance.get(this.endpoints.GET_ENTITIES, {
                params,
            });

            return this.formatResponse(
                response,
                `Lọc ${this.entityNamePlural.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }
}
