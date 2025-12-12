/**
 * Review Types
 * Type definitions for review management features
 */

export interface UserInfo {
    userId: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    found: boolean;
}

export interface AccountInfo {
    accountId: string;
    email: string;
    fullName: string;
    avatarUrl: string;
    role: string;
    found: boolean;
}

export interface Reply {
    id: string;
    authorId: string;
    authorInfo?: AccountInfo;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: string;
    patientId: string;
    patientInfo?: UserInfo;
    doctorId?: string;
    serviceId?: string;
    rating: number;
    comment: string;
    replies: Reply[];
    createdAt: string;
    updatedAt: string;
}

export interface PagedReviewsResponse {
    reviews: Review[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface AddReplyRequest {
    reviewId: string;
    authorId: string;
    content: string;
}

export interface UpdateReplyRequest {
    reviewId: string;
    replyId: string;
    content: string;
}

export interface ReviewFilters {
    searchTerm?: string;
    minRating?: number;
    maxRating?: number;
    page: number;
    pageSize: number;
}
