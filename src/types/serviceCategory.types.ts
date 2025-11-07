export interface ServiceCategory {
    id: string;
    name: string;
    description?: string;
    imageUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
    parentId?: string | null; // For parent-child relationship (null = parent, string = child)
    createdAt?: string;
    updatedAt?: string;
}

export interface ServiceCategoryFormData {
    name: string;
    description?: string;
    imageUrl: string;
    status: 'ACTIVE' | 'INACTIVE';
    parentId?: string | null; // For parent-child relationship (null = parent, string = child)
}

export interface ServiceCategorySearchParams {
    searchTerm?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}

export interface ServiceCategoryListResponse {
    serviceCategories: ServiceCategory[];
    totalCount: number;
}
