import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import { Service, ServiceFormData, ServiceSearchParams } from '@/types/service.types';
import { BaseService } from './baseService';

export interface ServiceListResponse {
    items: Service[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface FilterOptionsResponse {
    hospitals: Array<{ id: string; name: string }>;
    serviceCategories: Array<{ id: string; name: string }>;
}

const SERVICE_ENDPOINTS = {
    BASE: '/services',
    HEALTH: '/services/health',
    GET_ENTITY: (id: string) => `/medical-services/services/${id}`, // Updated to match new API pattern
    GET_ENTITIES: '/services',
    GET_ALL_ENTITIES: '/services/all',
    GET_ALL_DETAILS: '/medical-services/services/all-details', // New endpoint
    GET_FILTER_OPTIONS: '/medical-services/services/filter-options', // Filter options endpoint
    GET_BY_HOSPITAL: (hospitalId: string) => `/medical-services/services/hospital/${hospitalId}`, // Get services by hospital
    CREATE_ENTITY: '/medical-services/services', // Updated to match new API pattern
    UPDATE_ENTITY: (id: string) => `/medical-services/services/${id}`, // Updated to match new API pattern
    DELETE_ENTITY: (id: string) => `/medical-services/services/${id}`, // Updated to match new API pattern
    FILTER_ENTITIES: '/services',
} as const;

export class ServiceService extends BaseService {
    protected entityName = 'Dịch Vụ';
    protected entityNamePlural = 'Dịch Vụ';

    protected validateEntityData(serviceData: ServiceFormData): void {
        if (!serviceData.name || serviceData.name.trim().length === 0) {
            throw new Error(`Tên ${this.entityName.toLowerCase()} không được để trống`);
        }

        if (serviceData.price === undefined || serviceData.price < 0) {
            throw new Error('Giá dịch vụ không hợp lệ');
        }

        if (serviceData.durationTime === undefined || serviceData.durationTime <= 0) {
            throw new Error('Thời gian dịch vụ phải lớn hơn 0');
        }

        if (!serviceData.hospitalId || serviceData.hospitalId.trim().length === 0) {
            throw new Error('Bệnh viện không được để trống');
        }

        if (!serviceData.serviceTypeId || serviceData.serviceTypeId.trim().length === 0) {
            throw new Error('Loại dịch vụ không được để trống');
        }
    }

    async getAllServices(
        pageNumber: number = 1,
        pageSize: number = 10,
        sortBy?: string,
        sortOrder?: 'asc' | 'desc'
    ): Promise<ApiResponse<ServiceListResponse>> {
        try {
            // Use the new endpoint for getting all services
            const queryParams: any = {
                page: pageNumber,
                pageSize,
            };

            if (sortBy) {
                queryParams.sortBy = sortBy;
            }

            if (sortOrder) {
                queryParams.sortDirection = sortOrder;
            }

            const response: any = await axiosInstance.get(SERVICE_ENDPOINTS.GET_ALL_DETAILS, {
                params: queryParams,
            });

            // Transform response to match expected format
            // Axios interceptor already returns response.data, so response is the actual data
            const servicesArray = response?.services || response?.data?.services || [];
            const totalCount =
                response?.totalCount || response?.data?.totalCount || servicesArray.length;
            const responsePageSize = response?.pageSize || response?.data?.pageSize || pageSize;
            const totalPages =
                response?.totalPages ||
                response?.data?.totalPages ||
                Math.ceil(totalCount / responsePageSize);

            const transformedData = {
                items: servicesArray,
                totalCount,
                pageNumber: response?.page || response?.data?.page || pageNumber,
                pageSize: responsePageSize,
                totalPages,
            };

            return this.formatResponse(
                { data: transformedData },
                `Lấy danh sách ${this.entityNamePlural.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getServiceById(id: string): Promise<ApiResponse<Service>> {
        try {
            this.validateEntityId(id);
            const response: any = await axiosInstance.get(SERVICE_ENDPOINTS.GET_ENTITY(id));
            return this.formatResponse(
                response,
                `Lấy thông tin ${this.entityName.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async createService(serviceData: ServiceFormData): Promise<ApiResponse<Service>> {
        try {
            this.validateEntityData(serviceData);

            const payload = {
                name: serviceData.name.trim(),
                description: serviceData.description?.trim() || '',
                price: serviceData.price,
                durationTime: serviceData.durationTime,
                hospitalId: serviceData.hospitalId,
                serviceCategoryId: serviceData.serviceTypeId, // Map serviceTypeId to serviceCategoryId for API
                serviceTypeId: serviceData.serviceTypeId, // Keep for backward compatibility
                status: serviceData.status ?? 'ACTIVE',
            };

            const response: any = await axiosInstance.post(
                SERVICE_ENDPOINTS.CREATE_ENTITY,
                payload
            );

            return this.formatResponse(response, `Tạo ${this.entityName.toLowerCase()} thành công`);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async updateService(id: string, serviceData: ServiceFormData): Promise<ApiResponse<Service>> {
        try {
            this.validateEntityId(id);
            this.validateEntityData(serviceData);

            const payload = {
                id: id,
                name: serviceData.name.trim(),
                description: serviceData.description?.trim() || '',
                price: serviceData.price,
                durationTime: serviceData.durationTime,
                hospitalId: serviceData.hospitalId,
                serviceCategoryId: serviceData.serviceTypeId, // Map serviceTypeId to serviceCategoryId for API
                serviceTypeId: serviceData.serviceTypeId, // Keep for backward compatibility
                status: serviceData.status,
            };

            const response: any = await axiosInstance.put(
                SERVICE_ENDPOINTS.UPDATE_ENTITY(id),
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

    async deleteService(id: string): Promise<ApiResponse<void>> {
        try {
            this.validateEntityId(id);

            // Backend uses DELETE method: [HttpDelete("{id}")]
            const response: any = await axiosInstance.delete(SERVICE_ENDPOINTS.DELETE_ENTITY(id));

            return this.formatResponse(response, `Xóa ${this.entityName.toLowerCase()} thành công`);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Create service with image upload
     */
    async createServiceWithImage(
        serviceData: ServiceFormData & { imageFile: File }
    ): Promise<ApiResponse<Service>> {
        try {
            this.validateEntityData(serviceData);

            const formData = new FormData();
            formData.append('Name', serviceData.name.trim());
            formData.append('Description', serviceData.description?.trim() || '');
            formData.append('Price', serviceData.price.toString());
            formData.append('DurationTime', serviceData.durationTime.toString());
            formData.append('HospitalId', serviceData.hospitalId);
            formData.append('ServiceCategoryId', serviceData.serviceTypeId);
            // Ensure the created service is active by default
            formData.append('Status', serviceData.status ?? 'ACTIVE');
            formData.append('imageFile', serviceData.imageFile);

            const response: any = await axiosInstance.post(
                `${SERVICE_ENDPOINTS.CREATE_ENTITY}/upload-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return this.formatResponse(
                response,
                `Tạo ${this.entityName.toLowerCase()} với hình ảnh thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Update service with image upload
     */
    async updateServiceWithImage(
        id: string,
        serviceData: ServiceFormData & { imageFile: File }
    ): Promise<ApiResponse<Service>> {
        try {
            this.validateEntityId(id);
            this.validateEntityData(serviceData);

            const formData = new FormData();
            formData.append('Id', id);
            formData.append('Name', serviceData.name.trim());
            formData.append('Description', serviceData.description?.trim() || '');
            formData.append('Price', serviceData.price.toString());
            formData.append('DurationTime', serviceData.durationTime.toString());
            formData.append('HospitalId', serviceData.hospitalId);
            formData.append('ServiceCategoryId', serviceData.serviceTypeId);
            formData.append('Status', serviceData.status);
            formData.append('imageFile', serviceData.imageFile);

            const response: any = await axiosInstance.put(
                `${SERVICE_ENDPOINTS.UPDATE_ENTITY(id)}/upload-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return this.formatResponse(
                response,
                `Cập nhật ${this.entityName.toLowerCase()} với hình ảnh thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async getFilterOptions(): Promise<ApiResponse<FilterOptionsResponse>> {
        try {
            const response: any = await axiosInstance.get(SERVICE_ENDPOINTS.GET_FILTER_OPTIONS);

            // Axios interceptor already returns response.data, so response is the actual data
            const filterOptions = {
                hospitals: response?.hospitals || response?.data?.hospitals || [],
                serviceCategories:
                    response?.serviceCategories || response?.data?.serviceCategories || [],
            };

            return this.formatResponse(
                { data: filterOptions },
                `Lấy danh sách tùy chọn lọc thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    async filterServices(params: ServiceSearchParams): Promise<ApiResponse<ServiceListResponse>> {
        try {
            // Build query parameters for the new API endpoint
            const queryParams: any = {};

            // Map serviceTypeId to serviceCategoryId if provided
            if (params.serviceCategoryId) {
                queryParams.serviceCategoryId = params.serviceCategoryId;
            } else if (params.serviceTypeId) {
                queryParams.serviceCategoryId = params.serviceTypeId;
            }

            if (params.hospitalId) {
                queryParams.hospitalId = params.hospitalId;
            }

            if (params.minPrice !== undefined) {
                queryParams.minPrice = params.minPrice;
            }

            if (params.maxPrice !== undefined) {
                queryParams.maxPrice = params.maxPrice;
            }

            if (params.status) {
                queryParams.status = params.status;
            }

            // Map sortBy and sortDirection
            if (params.sortBy) {
                queryParams.sortBy = params.sortBy;
            }

            // Use sortDirection if provided, otherwise fall back to sortOrder
            if (params.sortDirection) {
                queryParams.sortDirection = params.sortDirection;
            } else if (params.sortOrder) {
                queryParams.sortDirection = params.sortOrder;
            }

            // Map pageNumber to page
            const page = params.page ?? params.pageNumber ?? 1;
            queryParams.page = page;

            if (params.pageSize) {
                queryParams.pageSize = params.pageSize;
            }

            // Use the new endpoint
            const response: any = await axiosInstance.get(SERVICE_ENDPOINTS.GET_ALL_DETAILS, {
                params: queryParams,
            });

            // Transform response to match expected format
            // API returns { services: [...], ... } but we need { items: [...], ... }
            // Axios interceptor already returns response.data, so response is the actual data
            const servicesArray = response?.services || response?.data?.services || [];
            const totalCount =
                response?.totalCount || response?.data?.totalCount || servicesArray.length;
            const pageSize =
                response?.pageSize || response?.data?.pageSize || params.pageSize || 10;
            const totalPages =
                response?.totalPages ||
                response?.data?.totalPages ||
                Math.ceil(totalCount / pageSize);

            const transformedData = {
                items: servicesArray,
                totalCount,
                pageNumber: response?.page || response?.data?.page || page,
                pageSize,
                totalPages,
            };

            return this.formatResponse(
                { data: transformedData },
                `Lọc ${this.entityNamePlural.toLowerCase()} thành công`
            );
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get services by hospital ID
     * Backend returns List<ServiceResponse> directly (ActionResult<List<ServiceResponse>>)
     * Axios interceptor returns response.data, so response is the array directly
     */
    async getServicesByHospital(hospitalId: string): Promise<ApiResponse<Service[]>> {
        try {
            this.validateEntityId(hospitalId);
            const response: any = await axiosInstance.get(
                SERVICE_ENDPOINTS.GET_BY_HOSPITAL(hospitalId)
            );

            // Axios interceptor returns response.data, so response is the array directly
            // But formatResponse expects { data: ... }, so we need to handle it
            let services: Service[] = [];

            if (Array.isArray(response)) {
                services = response;
            } else if (response?.data && Array.isArray(response.data)) {
                services = response.data;
            } else if (Array.isArray(response?.data?.data)) {
                services = response.data.data;
            }

            return {
                success: true,
                data: services,
                message: `Lấy danh sách ${this.entityNamePlural.toLowerCase()} theo bệnh viện thành công`,
            };
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Get service IDs by hospital (optimized for performance - returns only IDs)
     */
    async getServiceIdsByHospital(hospitalId: string): Promise<ApiResponse<string[]>> {
        try {
            this.validateEntityId(hospitalId);
            const response: any = await axiosInstance.get(
                `/medical-services/services/hospital/${hospitalId}/ids`
            );

            return {
                success: true,
                data: response?.serviceIds || response?.data?.serviceIds || [],
                message: 'Service IDs retrieved successfully',
            };
        } catch (error: any) {
            this.handleError(error);
        }
    }
}

// Export singleton instance
export const serviceService = new ServiceService();

// Export individual functions for convenience
export const getAllServices = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
): Promise<ApiResponse<ServiceListResponse>> => {
    return serviceService.getAllServices(pageNumber, pageSize, sortBy, sortOrder);
};

export const getServiceById = async (id: string): Promise<ApiResponse<Service>> => {
    return serviceService.getServiceById(id);
};

export const createService = async (data: ServiceFormData): Promise<ApiResponse<Service>> => {
    return serviceService.createService(data);
};

export const updateService = async (
    id: string,
    data: ServiceFormData
): Promise<ApiResponse<Service>> => {
    return serviceService.updateService(id, data);
};

export const deleteService = async (id: string): Promise<ApiResponse<void>> => {
    return serviceService.deleteService(id);
};

export const filterServices = async (
    params: ServiceSearchParams
): Promise<ApiResponse<ServiceListResponse>> => {
    return serviceService.filterServices(params);
};

export const getFilterOptions = async (): Promise<ApiResponse<FilterOptionsResponse>> => {
    return serviceService.getFilterOptions();
};

export const createServiceWithImage = async (
    data: ServiceFormData & { imageFile: File }
): Promise<ApiResponse<Service>> => {
    return serviceService.createServiceWithImage(data);
};

export const updateServiceWithImage = async (
    id: string,
    data: ServiceFormData & { imageFile: File }
): Promise<ApiResponse<Service>> => {
    return serviceService.updateServiceWithImage(id, data);
};

export const getServicesByHospital = async (
    hospitalId: string
): Promise<ApiResponse<Service[]>> => {
    return serviceService.getServicesByHospital(hospitalId);
};

export const getServiceIdsByHospital = async (
    hospitalId: string
): Promise<ApiResponse<string[]>> => {
    try {
        const response: any = await axiosInstance.get(`/services/hospital/${hospitalId}/ids`);
        return {
            success: response.success ?? true,
            data: response.data?.serviceIds || response.serviceIds || [],
            message: response.message || 'Service IDs retrieved successfully',
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to retrieve service IDs');
    }
};

export const getAllServiceIds = async (): Promise<ApiResponse<string[]>> => {
    try {
        const response: any = await axiosInstance.get('/medical-services/services/ids');
        return {
            success: response.success ?? true,
            data: response.data?.serviceIds || response.serviceIds || [],
            message: response.message || 'All service IDs retrieved successfully',
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to retrieve all service IDs');
    }
};
