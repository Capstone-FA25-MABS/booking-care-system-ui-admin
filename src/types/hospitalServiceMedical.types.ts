export interface ServiceCategory {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    status?: string;
    parentId?: string;
}

export interface Service {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    status?: string;
    hospitalId?: string;
    serviceCategoryId?: string;
    serviceCategory?: ServiceCategory;
}
