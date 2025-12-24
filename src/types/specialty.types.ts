export interface Specialty {
    id: string;
    name: string;
    imageUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
    doctorCount?: number; // From backend
    createdAt?: string;
    updatedAt?: string;
}

export interface SpecialtyBasicInfo {
    id: string;
    name: string;
    imageUrl?: string;
}

export interface SpecialtyFormData {
    name: string;
    imageUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface SpecialtySearchParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SpecialtyListResponse {
    specialties: Specialty[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
