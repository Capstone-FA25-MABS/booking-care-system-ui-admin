import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    BlogDetailDto,
    BlogSummaryDto,
    CreateBlogRequest,
    UpdateBlogRequest,
    BlogFilterParameters,
    PagedResponse,
    BlogStatus,
} from '@/types/blog.types';

// Base API endpoints for blog service
const BLOG_ENDPOINTS = {
    BASE: '/blogs',
    GET_ALL: '/blogs/all',
    GET_MY: '/blogs/mine',
    GET_BLOG: (id: string) => `/blogs/${id}`,
    CREATE_BLOG: '/blogs',
    CREATE_BLOG_WITH_IMAGES: '/blogs/upload-images',
    UPDATE_BLOG: (id: string) => `/blogs/${id}`,
    UPDATE_BLOG_WITH_IMAGES: (id: string) => `/blogs/${id}/upload-images`,
    DELETE_BLOG: (id: string) => `/blogs/${id}`,
    APPROVE_BLOG: (id: string) => `/blogs/${id}/approve`,
    REJECT_BLOG: (id: string) => `/blogs/${id}/reject`,
} as const;

type BlogMediaFiles = {
    thumbnailFile?: File;
    heroImageFile?: File;
};

/**
 * Blog Service
 * Handles all blog-related API operations for admin panel
 */
export class BlogService {
    /**
     * Get blogs with pagination and filters
     */
    static async getBlogs(
        filter?: BlogFilterParameters
    ): Promise<ApiResponse<PagedResponse<BlogSummaryDto>>> {
        try {
            const queryString = BlogService.buildFilterQuery(filter);
            const url = queryString ? `${BLOG_ENDPOINTS.BASE}?${queryString}` : BLOG_ENDPOINTS.BASE;

            const response: any = await axiosInstance.get(url);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blogs retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch blogs');
        }
    }

    /**
     * Get blogs created by the current account
     */
    static async getMyBlogs(
        filter?: BlogFilterParameters
    ): Promise<ApiResponse<PagedResponse<BlogSummaryDto>>> {
        try {
            const queryString = BlogService.buildFilterQuery(filter);
            const url = queryString
                ? `${BLOG_ENDPOINTS.GET_MY}?${queryString}`
                : BLOG_ENDPOINTS.GET_MY;

            const response: any = await axiosInstance.get(url);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'My blogs retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch my blogs');
        }
    }

    /**
     * Get all blogs (without pagination)
     */
    static async getAllBlogs(): Promise<ApiResponse<BlogDetailDto[]>> {
        try {
            const response: any = await axiosInstance.get(BLOG_ENDPOINTS.GET_ALL);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'All blogs retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch all blogs');
        }
    }

    /**
     * Get blog by ID
     */
    static async getBlogById(id: string): Promise<ApiResponse<BlogDetailDto>> {
        try {
            const response: any = await axiosInstance.get(BLOG_ENDPOINTS.GET_BLOG(id));

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to retrieve blog');
        }
    }

    /**
     * Create a new blog
     */
    static async createBlog(
        request: CreateBlogRequest,
        media?: BlogMediaFiles
    ): Promise<ApiResponse<BlogDetailDto>> {
        try {
            if (media?.thumbnailFile || media?.heroImageFile) {
                const formData = BlogService.buildBlogFormData(request, media);
                const response: any = await axiosInstance.post(
                    BLOG_ENDPOINTS.CREATE_BLOG_WITH_IMAGES,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                return {
                    success: response.success ?? true,
                    data: response.data || response,
                    message: response.message || 'Blog created successfully',
                };
            }

            const response: any = await axiosInstance.post(BLOG_ENDPOINTS.CREATE_BLOG, request);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create blog');
        }
    }

    /**
     * Update an existing blog
     */
    static async updateBlog(
        id: string,
        request: UpdateBlogRequest,
        media?: BlogMediaFiles
    ): Promise<ApiResponse<BlogDetailDto>> {
        try {
            if (media?.thumbnailFile || media?.heroImageFile) {
                const formData = BlogService.buildBlogFormData(request, media);
                const response: any = await axiosInstance.put(
                    BLOG_ENDPOINTS.UPDATE_BLOG_WITH_IMAGES(id),
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                return {
                    success: response.success ?? true,
                    data: response.data || response,
                    message: response.message || 'Blog updated successfully',
                };
            }

            const response: any = await axiosInstance.put(BLOG_ENDPOINTS.UPDATE_BLOG(id), request);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update blog');
        }
    }

    /**
     * Delete a blog
     */
    static async deleteBlog(id: string): Promise<ApiResponse<void>> {
        try {
            const response: any = await axiosInstance.delete(BLOG_ENDPOINTS.DELETE_BLOG(id));

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete blog');
        }
    }

    /**
     * Approve a blog
     */
    static async approveBlog(id: string, featured?: boolean): Promise<ApiResponse<BlogDetailDto>> {
        try {
            const requestBody = featured !== undefined ? { featured } : undefined;
            const response: any = await axiosInstance.post(
                BLOG_ENDPOINTS.APPROVE_BLOG(id),
                requestBody
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog approved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to approve blog');
        }
    }

    /**
     * Reject a blog
     */
    static async rejectBlog(id: string): Promise<ApiResponse<BlogDetailDto>> {
        try {
            const response: any = await axiosInstance.post(BLOG_ENDPOINTS.REJECT_BLOG(id));

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Blog rejected successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to reject blog');
        }
    }

    private static buildBlogFormData(request: CreateBlogRequest, media?: BlogMediaFiles): FormData {
        const formData = new FormData();

        const appendOptional = (key: string, value?: string | number | boolean | null) => {
            if (value === undefined || value === null) {
                return;
            }
            formData.append(key, String(value));
        };

        appendOptional('BlogCategoryId', request.blogCategoryId);
        formData.append('TitleVi', request.titleVi ?? '');
        formData.append('ContentVi', request.contentVi ?? '');
        appendOptional('TitleEn', request.titleEn);
        appendOptional('ContentEn', request.contentEn);
        formData.append('ThumbnailUrl', request.thumbnailUrl ?? '');
        formData.append('HeroImageUrl', request.heroImageUrl ?? '');
        appendOptional('Tag', request.tag);
        appendOptional('Source', request.source);
        formData.append('Status', request.status ?? BlogStatus.Pending);
        formData.append('Featured', String(request.featured ?? false));
        appendOptional('PublishedAt', request.publishedAt);
        appendOptional('CreatedByDoctorId', request.createdByDoctorId);
        appendOptional('CreatedByHospitalId', request.createdByHospitalId);

        if (media?.thumbnailFile) {
            formData.append('thumbnailFile', media.thumbnailFile);
        }

        if (media?.heroImageFile) {
            formData.append('heroImageFile', media.heroImageFile);
        }

        return formData;
    }

    private static buildFilterQuery(filter?: BlogFilterParameters): string {
        if (!filter) {
            return '';
        }

        const params = new URLSearchParams();

        if (filter.page) params.append('page', filter.page.toString());
        if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());
        if (filter.categoryId) params.append('categoryId', filter.categoryId.toString());
        if (filter.tag) params.append('tag', filter.tag);
        if (filter.source) params.append('source', filter.source);
        if (filter.status) params.append('status', filter.status);
        if (filter.featured !== undefined) params.append('featured', filter.featured.toString());
        if (filter.keyword) params.append('keyword', filter.keyword);
        if (filter.createdByAccountId)
            params.append('createdByAccountId', filter.createdByAccountId);
        if (filter.createdByDoctorId) params.append('createdByDoctorId', filter.createdByDoctorId);
        if (filter.createdByHospitalId)
            params.append('createdByHospitalId', filter.createdByHospitalId);

        return params.toString();
    }
}
