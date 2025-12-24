import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    BlogCategoryDto,
    CreateBlogCategoryRequest,
    UpdateBlogCategoryRequest,
} from '@/types/blog.types';

// Base API endpoints for blog category service
const BLOG_CATEGORY_ENDPOINTS = {
    BASE: '/blog/categories',
    GET_CATEGORY: (id: string) => `/blog/categories/${id}`,
    CREATE_CATEGORY: '/blog/categories',
    UPDATE_CATEGORY: (id: string) => `/blog/categories/${id}`,
    DELETE_CATEGORY: (id: string) => `/blog/categories/${id}`,
} as const;

/**
 * Blog Category Service
 * Handles all blog category-related API operations for admin panel
 */
export class BlogCategoryService {
    /**
     * Get all blog categories
     */
    static async getCategories(
        includeChildren: boolean = true
    ): Promise<ApiResponse<BlogCategoryDto[]>> {
        try {
            const response: any = await axiosInstance.get(BLOG_CATEGORY_ENDPOINTS.BASE, {
                params: {
                    includeChildren: includeChildren.toString(),
                },
            });

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog categories retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch blog categories');
        }
    }

    /**
     * Get blog category by ID
     */
    static async getCategoryById(
        id: string,
        includeChildren: boolean = true
    ): Promise<ApiResponse<BlogCategoryDto>> {
        try {
            const response: any = await axiosInstance.get(
                BLOG_CATEGORY_ENDPOINTS.GET_CATEGORY(id),
                {
                    params: {
                        includeChildren: includeChildren.toString(),
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog category retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve blog category');
        }
    }

    /**
     * Create a new blog category
     */
    static async createCategory(
        request: CreateBlogCategoryRequest
    ): Promise<ApiResponse<BlogCategoryDto>> {
        try {
            const response: any = await axiosInstance.post(
                BLOG_CATEGORY_ENDPOINTS.CREATE_CATEGORY,
                request
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog category created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create blog category');
        }
    }

    /**
     * Update an existing blog category
     */
    static async updateCategory(
        id: string,
        request: UpdateBlogCategoryRequest
    ): Promise<ApiResponse<BlogCategoryDto>> {
        try {
            const response: any = await axiosInstance.put(
                BLOG_CATEGORY_ENDPOINTS.UPDATE_CATEGORY(id),
                request
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog category updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update blog category');
        }
    }

    /**
     * Delete a blog category
     */
    static async deleteCategory(id: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.delete(
                BLOG_CATEGORY_ENDPOINTS.DELETE_CATEGORY(id)
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog category deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete blog category');
        }
    }
}
