/**
 * Tag Types for Communication Service
 * Corresponds to ConversationTagType enum in backend
 */
export enum ConversationTagType {
    CUSTOM = 0,
    SYSTEM = 1,
    IMPORTANT = 2,
    WORK = 3,
    PERSONAL = 4,
    SHOPPING = 5,
    TRAVEL = 6,
    FAMILY = 7,
    VIP = 8,
    ARCHIVED = 9,
}

/**
 * Paginated response for tag operations
 */
export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Tag entity matching backend TagEntity
 */
export interface Tag {
    id: string;
    userId: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    type: ConversationTagType;
    order: number;
    conversationCount: number;
    isPinned: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * DTO for creating a new tag
 */
export interface CreateTagDto {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    type: ConversationTagType;
    order?: number;
}

/**
 * DTO for updating a tag
 */
export interface UpdateTagDto {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    type?: ConversationTagType;
    order?: number;
    isPinned?: boolean;
    isActive?: boolean;
}

/**
 * Tag statistics
 */
export interface TagStatistics {
    tag: Tag;
    totalConversations: number;
    unreadMessagesCount: number;
    lastMessageAt?: string;
}

/**
 * Filter conversations by tags
 */
export interface FilterConversationsByTagDto {
    tagIds: string[];
    filterMode?: 'any' | 'all';
    pageNumber?: number;
    pageSize?: number;
}

/**
 * Bulk operation request
 */
export interface BulkTagOperationDto {
    tagId: string;
    conversationIds: string[];
}

/**
 * Grouped conversations by tag
 */
export interface GroupedConversations {
    [tagId: string]: any[]; // ConversationResponse[]
}
