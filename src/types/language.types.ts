export interface Language {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt?: string;
    updatedAt?: string;
}

export interface LanguageBasicInfo {
    id: string;
    name: string;
}

export interface LanguageFormData {
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface LanguageSearchParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface LanguageListResponse {
    languages: Language[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface DoctorLanguage {
    languageId: string;
    proficiency: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'NATIVE';
}
