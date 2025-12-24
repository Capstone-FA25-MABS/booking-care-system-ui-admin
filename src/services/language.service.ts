import {
    BaseEntityService,
    BaseEntityFormData,
    BaseEntitySearchParams,
    BaseEntityListResponse,
} from './baseEntity.service';
import { Language } from '@/types/language.types';

// Use base types directly since no additional properties are needed
export type LanguageFormData = BaseEntityFormData;
export type LanguageSearchParams = BaseEntitySearchParams;
export type LanguageListResponse = BaseEntityListResponse<Language>;

// Language service endpoints
const LANGUAGE_ENDPOINTS = {
    BASE: '/languages',
    HEALTH: '/languages/health',
    GET_ENTITY: (id: string) => `/languages/${id}`,
    GET_ENTITIES: '/languages',
    GET_ALL_ENTITIES: '/languages/all',
    CREATE_ENTITY: '/languages',
    UPDATE_ENTITY: (id: string) => `/languages/${id}`,
    DELETE_ENTITY: (id: string) => `/languages/${id}`,
    FILTER_ENTITIES: '/languages',
} as const;

export class LanguageService extends BaseEntityService<
    Language,
    LanguageFormData,
    LanguageSearchParams
> {
    protected endpoints = LANGUAGE_ENDPOINTS;
    protected entityName = 'Ngôn ngữ';
    protected entityNamePlural = 'Ngôn ngữ';
}

// Export individual methods for convenience
const languageService = new LanguageService();
export const getAllLanguages = languageService.getAllEntities.bind(languageService);
export const getAllLanguagesSimple = languageService.getAllEntitiesSimple.bind(languageService);
export const getLanguageById = languageService.getEntityById.bind(languageService);
export const createLanguage = languageService.createEntity.bind(languageService);
export const updateLanguage = languageService.updateEntity.bind(languageService);
export const deleteLanguage = languageService.deleteEntity.bind(languageService);
export const filterLanguages = languageService.filterEntities.bind(languageService);
export const healthCheck = languageService.healthCheck.bind(languageService);

// Export the service instance for direct use
export { languageService };
