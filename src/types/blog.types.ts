// Blog Status Enum
export enum BlogStatus {
    Pending = 'Pending',
    Approved = 'Approved',
    Rejected = 'Rejected',
    Active = 'Active',
    Inactive = 'Inactive',
}

// Category Status Enum
export enum CategoryStatus {
    Active = 'Active',
    Inactive = 'Inactive',
}

// Blog Category DTO
export interface BlogCategoryDto {
    id: string; // Guid from backend
    categoryName: string;
    description?: string;
    imageUrl?: string;
    status: CategoryStatus;
    parentId?: string; // Guid from backend
    createdAt: string;
    updatedAt: string;
    children?: BlogCategoryDto[];
}

// Blog Summary DTO (for list views)
export interface BlogSummaryDto {
    id: string; // Guid from backend
    titleVi: string;
    thumbnailUrl?: string;
    tag?: string;
    source?: string;
    status: BlogStatus;
    featured: boolean;
    publishedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    category?: BlogCategoryDto;
}

// Blog Detail DTO (for detail view)
export interface BlogDetailDto {
    id: string; // Guid from backend
    titleVi: string;
    contentVi: string;
    titleEn?: string;
    contentEn?: string;
    thumbnailUrl?: string;
    heroImageUrl?: string;
    tag?: string;
    source?: string;
    createdByName?: string;
    status: BlogStatus;
    featured: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    category?: BlogCategoryDto;
    relatedBlogs: BlogSummaryDto[];
}

// Blog Filter Parameters
export interface BlogFilterParameters {
    tag?: string;
    source?: string;
    status?: BlogStatus;
    featured?: boolean;
    keyword?: string;
    page?: number;
    pageSize?: number;
    categoryId?: string; // Guid from backend
    createdByAccountId?: string; // Optional filter from admin
}

// Paged Response
export interface PagedResponse<T> {
    items: T[];
    totalItems: number;
    page: number;
    pageSize: number;
}

// Create Blog Request
export interface CreateBlogRequest {
    blogCategoryId?: string; // Guid from backend
    titleVi: string;
    contentVi: string;
    titleEn?: string;
    contentEn?: string;
    thumbnailUrl?: string;
    heroImageUrl?: string;
    tag?: string;
    source?: string;
    status?: BlogStatus;
    featured?: boolean;
    publishedAt?: string;
}

// Update Blog Request
export type UpdateBlogRequest = CreateBlogRequest;

// Create Blog Category Request
export interface CreateBlogCategoryRequest {
    categoryName: string;
    description?: string;
    imageUrl?: string;
    status?: CategoryStatus;
    parentId?: string; // Guid from backend
}

// Update Blog Category Request
export type UpdateBlogCategoryRequest = CreateBlogCategoryRequest;
