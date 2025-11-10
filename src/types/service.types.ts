export interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationTime?: number; // in minutes (old field)
    duration?: number; // in minutes (new field from API)
    hospitalId: string;
    hospitalName?: string;
    serviceTypeId?: string; // old field
    serviceCategoryId?: string; // new field from API
    serviceTypeName?: string; // old field
    serviceCategoryName?: string; // new field from API
    imageUrl?: string; // Image URL from AWS
    status: 'ACTIVE' | 'INACTIVE';
    createdAt?: string;
    updatedAt?: string;
}

export interface ServiceFormData {
    name: string;
    description?: string;
    price: number;
    durationTime: number;
    hospitalId: string;
    serviceTypeId: string;
    imageUrl?: string; // Image URL from AWS (optional)
    status: 'ACTIVE' | 'INACTIVE';
}

export interface ServiceSearchParams {
    searchTerm?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    hospitalId?: string;
    serviceTypeId?: string; // old field
    serviceCategoryId?: string; // new field from API
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string; // e.g., 'Price', 'Name'
    sortDirection?: 'asc' | 'desc'; // new field from API
    sortOrder?: 'asc' | 'desc'; // old field (for backward compatibility)
    page?: number; // new field from API
    pageNumber?: number; // old field (for backward compatibility)
    pageSize?: number;
}
