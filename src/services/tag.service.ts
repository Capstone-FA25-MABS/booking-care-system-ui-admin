import axiosInstance from '@/configs/axios.config';
import type { ApiResponse, ConversationResponse } from '@/types/communication.types';
import type {
    Tag,
    CreateTagDto,
    UpdateTagDto,
    TagStatistics,
    FilterConversationsByTagDto,
    BulkTagOperationDto,
    GroupedConversations,
    PaginatedResponse,
} from '@/types/tag.types';
import { transformToPascalCase } from '@/utils/communication.utils';

// API Endpoints
const TAG_ENDPOINTS = {
    // Tag CRUD
    CREATE_TAG: (userId: string) => `/tags/users/${userId.toUpperCase()}/tags`,
    GET_USER_TAGS: (userId: string) => `/tags/users/${userId.toUpperCase()}/tags`,
    GET_TAG_BY_ID: (userId: string, tagId: string) =>
        `/tags/users/${userId.toUpperCase()}/tags/${tagId.toUpperCase()}`,
    UPDATE_TAG: (userId: string, tagId: string) =>
        `/tags/users/${userId.toUpperCase()}/tags/${tagId.toUpperCase()}`,
    DELETE_TAG: (userId: string, tagId: string) =>
        `/tags/users/${userId.toUpperCase()}/tags/${tagId.toUpperCase()}`,

    // Conversation-Tag association
    ADD_TAG_TO_CONVERSATION: (userId: string) =>
        `/tags/users/${userId.toUpperCase()}/conversations/tags/add`,
    REMOVE_TAG_FROM_CONVERSATION: (userId: string) =>
        `/tags/users/${userId.toUpperCase()}/conversations/tags/remove`,
    REMOVE_ALL_TAGS: (userId: string, conversationId: string) =>
        `/tags/users/${userId.toUpperCase()}/conversations/${conversationId.toUpperCase()}/tags`,
    UPDATE_CONVERSATION_TAGS: (userId: string, conversationId: string) =>
        `/tags/users/${userId.toUpperCase()}/conversations/${conversationId.toUpperCase()}/tags`,
    GET_CONVERSATION_TAGS: (userId: string, conversationId: string) =>
        `/tags/users/${userId.toUpperCase()}/conversations/${conversationId.toUpperCase()}/tags`,

    // Filtering and statistics
    FILTER_BY_TAGS: (userId: string) =>
        `/tags/users/${userId.toUpperCase()}/conversations/filter-by-tags`,
    GROUP_BY_TAGS: (userId: string) =>
        `/tags/users/${userId.toUpperCase()}/conversations/group-by-tags`,
    GET_TAG_STATISTICS: (userId: string, tagId: string) =>
        `/tags/users/${userId.toUpperCase()}/tags/${tagId.toUpperCase()}/statistics`,
    GET_ALL_STATISTICS: (userId: string) => `/tags/users/${userId.toUpperCase()}/tags/statistics`,
    GET_CONVERSATION_COUNT: (userId: string) =>
        `/tags/users/${userId.toUpperCase()}/tags/conversation-counts`,

    // Bulk operations
    BULK_ADD_TAG: (userId: string, tagId: string) =>
        `/tags/users/${userId.toUpperCase()}/tags/${tagId.toUpperCase()}/bulk-add`,
    BULK_REMOVE_TAG: (userId: string, tagId: string) =>
        `/tags/users/${userId.toUpperCase()}/tags/${tagId.toUpperCase()}/bulk-remove`,
} as const;

export class TagService {
    /**
     * Create a new tag
     */
    static async createTag(userId: string, dto: CreateTagDto): Promise<ApiResponse<Tag>> {
        try {
            const response: any = await axiosInstance.post(
                TAG_ENDPOINTS.CREATE_TAG(userId),
                transformToPascalCase(dto)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tag created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create tag');
        }
    }

    /**
     * Get all tags for a user
     */
    static async getUserTags(
        userId: string,
        includeSystem: boolean = true
    ): Promise<ApiResponse<Tag[]>> {
        try {
            const url = `${TAG_ENDPOINTS.GET_USER_TAGS(userId)}?includeSystem=${includeSystem}`;
            const response: any = await axiosInstance.get(url);
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tags retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get tags');
        }
    }

    /**
     * Get a tag by ID
     */
    static async getTagById(userId: string, tagId: string): Promise<ApiResponse<Tag>> {
        try {
            const response: any = await axiosInstance.get(
                TAG_ENDPOINTS.GET_TAG_BY_ID(userId, tagId)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tag retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get tag');
        }
    }

    /**
     * Update a tag
     */
    static async updateTag(
        userId: string,
        tagId: string,
        dto: UpdateTagDto
    ): Promise<ApiResponse<Tag>> {
        try {
            const response: any = await axiosInstance.put(
                TAG_ENDPOINTS.UPDATE_TAG(userId, tagId),
                transformToPascalCase(dto)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tag updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update tag');
        }
    }

    /**
     * Delete a tag
     */
    static async deleteTag(
        userId: string,
        tagId: string
    ): Promise<ApiResponse<{ deleted: boolean }>> {
        try {
            const response: any = await axiosInstance.delete(
                TAG_ENDPOINTS.DELETE_TAG(userId, tagId)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tag deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete tag');
        }
    }

    /**
     * Add tags to a conversation
     */
    static async addTagsToConversation(
        userId: string,
        conversationId: string,
        tagIds: string[]
    ): Promise<ApiResponse<{ success: boolean }>> {
        try {
            const response: any = await axiosInstance.post(
                TAG_ENDPOINTS.ADD_TAG_TO_CONVERSATION(userId),
                transformToPascalCase({ conversationId, tagIds })
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tags added successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to add tags');
        }
    }

    /**
     * Remove a tag from a conversation
     */
    static async removeTagFromConversation(
        userId: string,
        conversationId: string,
        tagId: string
    ): Promise<ApiResponse<{ success: boolean }>> {
        try {
            const response: any = await axiosInstance.post(
                TAG_ENDPOINTS.REMOVE_TAG_FROM_CONVERSATION(userId),
                transformToPascalCase({ conversationId, tagId })
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tag removed successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to remove tag');
        }
    }

    /**
     * Remove all tags from a conversation
     */
    static async removeAllTagsFromConversation(
        userId: string,
        conversationId: string
    ): Promise<ApiResponse<{ success: boolean }>> {
        try {
            const response: any = await axiosInstance.delete(
                TAG_ENDPOINTS.REMOVE_ALL_TAGS(userId, conversationId)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'All tags removed successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to remove tags');
        }
    }

    /**
     * Update tags for a conversation (replace all)
     */
    static async updateConversationTags(
        userId: string,
        conversationId: string,
        tagIds: string[]
    ): Promise<ApiResponse<{ success: boolean }>> {
        try {
            const response: any = await axiosInstance.put(
                TAG_ENDPOINTS.UPDATE_CONVERSATION_TAGS(userId, conversationId),
                transformToPascalCase(tagIds)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tags updated successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to update tags');
        }
    }

    /**
     * Get tags for a conversation
     */
    static async getConversationTags(
        userId: string,
        conversationId: string
    ): Promise<ApiResponse<Tag[]>> {
        try {
            const response: any = await axiosInstance.get(
                TAG_ENDPOINTS.GET_CONVERSATION_TAGS(userId, conversationId)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tags retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get conversation tags');
        }
    }

    /**
     * Filter conversations by tags
     */
    static async filterConversationsByTags(
        userId: string,
        dto: FilterConversationsByTagDto
    ): Promise<ApiResponse<PaginatedResponse<ConversationResponse>>> {
        try {
            const response: any = await axiosInstance.post(
                TAG_ENDPOINTS.FILTER_BY_TAGS(userId),
                transformToPascalCase(dto)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Conversations filtered successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to filter conversations');
        }
    }

    /**
     * Get conversations grouped by tags
     */
    static async getGroupedConversations(
        userId: string
    ): Promise<ApiResponse<GroupedConversations>> {
        try {
            const response: any = await axiosInstance.get(TAG_ENDPOINTS.GROUP_BY_TAGS(userId));
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Grouped conversations retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get grouped conversations');
        }
    }

    /**
     * Get statistics for a tag
     */
    static async getTagStatistics(
        userId: string,
        tagId: string
    ): Promise<ApiResponse<TagStatistics>> {
        try {
            const response: any = await axiosInstance.get(
                TAG_ENDPOINTS.GET_TAG_STATISTICS(userId, tagId)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get statistics');
        }
    }

    /**
     * Get statistics for all tags
     */
    static async getAllTagsStatistics(userId: string): Promise<ApiResponse<TagStatistics[]>> {
        try {
            const response: any = await axiosInstance.get(TAG_ENDPOINTS.GET_ALL_STATISTICS(userId));
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'All statistics retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get all statistics');
        }
    }

    /**
     * Get conversation count by tags
     */
    static async getConversationCountByTags(
        userId: string
    ): Promise<ApiResponse<{ [tagId: string]: number }>> {
        try {
            const response: any = await axiosInstance.get(
                TAG_ENDPOINTS.GET_CONVERSATION_COUNT(userId)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Counts retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get conversation counts');
        }
    }

    /**
     * Bulk add tag to multiple conversations
     */
    static async bulkAddTag(
        userId: string,
        dto: BulkTagOperationDto
    ): Promise<ApiResponse<{ successCount: number }>> {
        try {
            const response: any = await axiosInstance.post(
                TAG_ENDPOINTS.BULK_ADD_TAG(userId, dto.tagId),
                transformToPascalCase({ conversationIds: dto.conversationIds })
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tag added to conversations',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to bulk add tag');
        }
    }

    /**
     * Bulk remove tag from multiple conversations
     */
    static async bulkRemoveTag(
        userId: string,
        dto: BulkTagOperationDto
    ): Promise<ApiResponse<{ successCount: number }>> {
        try {
            const response: any = await axiosInstance.post(
                TAG_ENDPOINTS.BULK_REMOVE_TAG(userId, dto.tagId),
                transformToPascalCase({ conversationIds: dto.conversationIds })
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tag removed from conversations',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to bulk remove tag');
        }
    }
}

// Export individual methods
export const {
    createTag,
    getUserTags,
    getTagById,
    updateTag,
    deleteTag,
    addTagsToConversation,
    removeTagFromConversation,
    removeAllTagsFromConversation,
    updateConversationTags,
    getConversationTags,
    filterConversationsByTags,
    getGroupedConversations,
    getTagStatistics,
    getAllTagsStatistics,
    getConversationCountByTags,
    bulkAddTag,
    bulkRemoveTag,
} = TagService;

export default TagService;
