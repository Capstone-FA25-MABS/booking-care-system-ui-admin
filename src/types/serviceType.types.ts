export interface ServiceType {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt?: string;
    updatedAt?: string;
}

export interface ServiceTypeFormData {
    name: string;
    description?: string;
    imageUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
}

export interface ServiceTypeSearchParams {
    searchTerm?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    pageNumber?: number;
    pageSize?: number;
}

export interface DoctorPrice {
    id: string;
    serviceTypeId: string;
    amount: number;
}

export interface DoctorPriceBasicInfo {
    id: string;
    serviceTypeName: string;
    amount: number;
}
