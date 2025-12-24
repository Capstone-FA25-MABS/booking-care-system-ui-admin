import {
    BaseEntityService,
    BaseEntityFormData,
    BaseEntitySearchParams,
    BaseEntityListResponse,
} from './baseEntity.service';
import { Position } from '@/types/position.types';

// Use base types directly since no additional properties are needed
export type PositionFormData = BaseEntityFormData;
export type PositionSearchParams = BaseEntitySearchParams;
export type PositionListResponse = BaseEntityListResponse<Position>;

// Position service endpoints
const POSITION_ENDPOINTS = {
    BASE: '/positions',
    HEALTH: '/positions/health',
    GET_ENTITY: (id: string) => `/positions/${id}`,
    GET_ENTITIES: '/positions',
    GET_ALL_ENTITIES: '/positions/all',
    CREATE_ENTITY: '/positions',
    UPDATE_ENTITY: (id: string) => `/positions/${id}`,
    DELETE_ENTITY: (id: string) => `/positions/${id}`,
    FILTER_ENTITIES: '/positions',
} as const;

export class PositionService extends BaseEntityService<
    Position,
    PositionFormData,
    PositionSearchParams
> {
    protected endpoints = POSITION_ENDPOINTS;
    protected entityName = 'Chức vụ';
    protected entityNamePlural = 'Chức vụ';
}

// Export individual methods for convenience
const positionService = new PositionService();
export const getAllPositions = positionService.getAllEntities.bind(positionService);
export const getAllPositionsSimple = positionService.getAllEntitiesSimple.bind(positionService);
export const getPositionById = positionService.getEntityById.bind(positionService);
export const createPosition = positionService.createEntity.bind(positionService);
export const updatePosition = positionService.updateEntity.bind(positionService);
export const deletePosition = positionService.deleteEntity.bind(positionService);
export const filterPositions = positionService.filterEntities.bind(positionService);
export const healthCheck = positionService.healthCheck.bind(positionService);

// Export the service instance for direct use
export { positionService };
