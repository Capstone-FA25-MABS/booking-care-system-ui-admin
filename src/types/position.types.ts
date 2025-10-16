export interface Position {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
    doctorCount?: number; // From backend
    createdAt?: string;
    updatedAt?: string;
}

export interface PositionBasicInfo {
    id: string;
    name: string;
}

export interface PositionFormData {
    name: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface PositionSearchParams {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PositionListResponse {
    positions: Position[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
