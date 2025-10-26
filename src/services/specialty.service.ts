import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    BaseEntityService,
    BaseEntityFormData,
    BaseEntitySearchParams,
    BaseEntityListResponse,
} from './baseEntity.service';
import { Specialty } from '@/types/specialty.types';

// Specialty-specific form data interface
export interface SpecialtyFormData extends BaseEntityFormData {
    imageUrl: string;
}

// Use base types directly since no additional properties are needed
export type SpecialtySearchParams = BaseEntitySearchParams;
export type SpecialtyListResponse = BaseEntityListResponse<Specialty>;

// Specialty service endpoints
const SPECIALTY_ENDPOINTS = {
    BASE: '/specialties',
    HEALTH: '/specialties/health',
    GET_ENTITY: (id: string) => `/specialties/${id}`,
    GET_ENTITIES: '/specialties',
    GET_ALL_ENTITIES: '/specialties/all',
    CREATE_ENTITY: '/specialties',
    UPDATE_ENTITY: (id: string) => `/specialties/${id}`,
    DELETE_ENTITY: (id: string) => `/specialties/${id}`,
    FILTER_ENTITIES: '/specialties',
} as const;

export class SpecialtyService extends BaseEntityService<
    Specialty,
    SpecialtyFormData,
    SpecialtySearchParams
> {
    protected endpoints = SPECIALTY_ENDPOINTS;
    protected entityName = 'Chuyên Khoa';
    protected entityNamePlural = 'Chuyên Khoa';

    /**
     * Override validateEntityData to include imageUrl validation
     */
    protected validateEntityData(specialtyData: SpecialtyFormData): void {
        super.validateEntityData(specialtyData);

        if (!specialtyData.imageUrl || specialtyData.imageUrl.trim().length === 0) {
            throw new Error('Hình ảnh chuyên khoa không được để trống');
        }
    }

    /**
     * Override createEntity to include imageUrl in payload
     */
    async createEntity(specialtyData: SpecialtyFormData): Promise<ApiResponse<Specialty>> {
        try {
            // Validate input data
            this.validateEntityData(specialtyData);

            console.log('Creating specialty with data:', {
                name: specialtyData.name.trim(),
                imageUrl: specialtyData.imageUrl.trim(),
                status: specialtyData.status,
            });

            const response: any = await axiosInstance.post(this.endpoints.CREATE_ENTITY, {
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
     * Override updateEntity to include imageUrl in payload
     */
    async updateEntity(
        id: string,
        specialtyData: SpecialtyFormData
    ): Promise<ApiResponse<Specialty>> {
        try {
            // Validate input data
            this.validateEntityId(id);
            this.validateEntityData(specialtyData);

            const payload = {
                id: id,
                name: specialtyData.name.trim(),
                imageUrl: specialtyData.imageUrl.trim(),
                status: specialtyData.status,
            };

            console.log('Update Specialty API Call:', {
                url: this.endpoints.UPDATE_ENTITY(id),
                payload: payload,
            });

            const response: any = await axiosInstance.put(
                this.endpoints.UPDATE_ENTITY(id),
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
     * Create new specialty with image upload
     */
    async createSpecialtyWithImage(
        specialtyData: SpecialtyFormData & { imageFile: File }
    ): Promise<ApiResponse<Specialty>> {
        try {
            // Validate input data
            this.validateEntityData(specialtyData);

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
     * Update specialty with image upload
     */
    async updateSpecialtyWithImage(
        id: string,
        specialtyData: SpecialtyFormData & { imageFile: File }
    ): Promise<ApiResponse<Specialty>> {
        try {
            // Validate input data
            this.validateEntityId(id);
            this.validateEntityData(specialtyData);

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
}

// Export individual methods for convenience
const specialtyService = new SpecialtyService();
export const getAllSpecialties = specialtyService.getAllEntities.bind(specialtyService);
export const getAllSpecialtiesSimple = specialtyService.getAllEntitiesSimple.bind(specialtyService);
export const getSpecialtyById = specialtyService.getEntityById.bind(specialtyService);
export const createSpecialty = specialtyService.createEntity.bind(specialtyService);
export const updateSpecialty = specialtyService.updateEntity.bind(specialtyService);
export const deleteSpecialty = specialtyService.deleteEntity.bind(specialtyService);
export const filterSpecialties = specialtyService.filterEntities.bind(specialtyService);
export const healthCheck = specialtyService.healthCheck.bind(specialtyService);
export const createSpecialtyWithImage =
    specialtyService.createSpecialtyWithImage.bind(specialtyService);
export const updateSpecialtyWithImage =
    specialtyService.updateSpecialtyWithImage.bind(specialtyService);

// Export the service instance for direct use
export { specialtyService };
