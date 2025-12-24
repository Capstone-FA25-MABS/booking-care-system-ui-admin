import axiosInstance from '@/configs/axios.config';
import {
    ConversationResponse,
    MessageResponse,
    CreateConversationRequest,
    CreateMessageRequest,
    CreateMessageWithFilesRequest,
    GetConversationsQueryParameters,
    GetMessagesQueryParameters,
    MarkMessageAsReadRequest,
    MarkAllMessagesAsReadRequest,
    CreateCallLogRequest,
    UpdateCallLogRequest,
    CallLogResponse,
    ApiResponse,
    CursorPaginationResponse,
    MessageAttachment,
} from '@/types/communication.types';
import { transformToPascalCase } from '@/utils/communication.utils';

// ==================================================================================
// HELPER FUNCTIONS FOR COMMUNICATION SERVICE
// ==================================================================================
// Communication Service backend (ASP.NET Core) expects:
// 1. PascalCase for all property names
// 2. UPPERCASE for all GUID/UUID values (userId, conversationId, etc.)
// These helpers automatically transform both keys and values
// NOTE: Only used in this service - does NOT affect other services
// ==================================================================================

/**
 * Check if error is "no unread messages" error
 * Backend returns 400 Bad Request with this message when all messages are already read
 * Note: Axios interceptor transforms the error, so we check the error message string
 */
const isNoUnreadMessagesError = (error: any): boolean => {
    // After axios interceptor, error.message contains the backend message
    const errorMessage = error.message || error.response?.data?.message || '';

    return (
        errorMessage.includes('không có tin nhắn chưa đọc') ||
        errorMessage.includes('Không thể đánh dấu tất cả tin nhắn là đã đọc') ||
        errorMessage.includes('no unread messages') ||
        errorMessage.toLowerCase().includes('already read')
    );
};

// API Endpoints (relative paths - baseURL already includes /api/v1)
// NOTE: All GUID parameters are uppercased for consistency with backend
const COMMUNICATION_ENDPOINTS = {
    CONVERSATIONS: (userId: string) =>
        `/communications/users/${userId.toUpperCase()}/conversations`,
    CONVERSATION_BY_ID: (conversationId: string) =>
        `/communications/conversations/${conversationId.toUpperCase()}`,
    CONVERSATION_DETAILS: (conversationId: string) =>
        `/communications/conversations/${conversationId.toUpperCase()}/details`,
    CREATE_CONVERSATION: `/communications/conversations`,
    CONVERSATION_BETWEEN_USERS: `/communications/conversations/between`,
    MESSAGES: (conversationId: string) =>
        `/communications/conversations/${conversationId.toUpperCase()}/messages`,
    MESSAGE_BY_ID: (messageId: string) => `/communications/messages/${messageId.toUpperCase()}`,
    CREATE_MESSAGE: `/communications/messages`,
    CREATE_MESSAGE_WITH_FILES: `/communications/messages/with-files`,
    CREATE_MESSAGE_WITH_ATTACHMENTS: `/communications/messages/with-attachments`,
    MARK_AS_READ: `/communications/messages/mark-as-read`,
    MARK_ALL_AS_READ: `/communications/messages/mark-all-as-read`,
    RECALL_MESSAGE: `/communications/messages/recall`,
    UNREAD_COUNT: (conversationId: string) =>
        `/communications/conversations/${conversationId.toUpperCase()}/unread-count`,
    UPLOAD_FILE: `/fileupload/upload`,
    UPLOAD_MULTIPLE_FILES: `/fileupload/upload-multiple`,
    DELETE_MESSAGE: (messageId: string) => `/communications/messages/${messageId.toUpperCase()}`,
    BLOCK_CONVERSATION: `/communications/conversations/block`,
    UNBLOCK_CONVERSATION: `/communications/conversations/unblock`,
    // Call Log endpoints
    CREATE_CALL_LOG: `/communications/call-logs`,
    UPDATE_CALL_LOG: (callLogId: string) => `/communications/call-logs/${callLogId.toUpperCase()}`,
} as const;

export class ChatService {
    /**
     * Get conversations for a user
     */
    static async getConversations(
        userId: string,
        params?: GetConversationsQueryParameters
    ): Promise<ApiResponse<CursorPaginationResponse<ConversationResponse>>> {
        try {
            const queryParams = new URLSearchParams();

            if (params?.before) queryParams.append('before', params.before);
            if (params?.after) queryParams.append('after', params.after);
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.includeParticipantDetails !== undefined)
                queryParams.append(
                    'includeParticipantDetails',
                    params.includeParticipantDetails.toString()
                );
            if (params?.includeUnreadCount !== undefined)
                queryParams.append('includeUnreadCount', params.includeUnreadCount.toString());
            if (params?.includeMetadata !== undefined)
                queryParams.append('includeMetadata', params.includeMetadata.toString());
            if (params?.includeOnlineStatus !== undefined)
                queryParams.append('includeOnlineStatus', params.includeOnlineStatus.toString());

            const url = `${COMMUNICATION_ENDPOINTS.CONVERSATIONS(userId)}?${queryParams.toString()}`;
            const response: any = await axiosInstance.get(url);

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Conversations retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get conversations');
        }
    }

    /**
     * Get conversation by ID with detailed information
     */
    static async getConversation(
        conversationId: string,
        options?: {
            includeParticipantDetails?: boolean;
            includeUnreadCount?: boolean;
            includeMetadata?: boolean;
        }
    ): Promise<ApiResponse<ConversationResponse>> {
        try {
            // Use /details endpoint with query parameters
            const queryParams = new URLSearchParams();
            queryParams.append(
                'includeParticipantDetails',
                (options?.includeParticipantDetails ?? true).toString()
            );
            queryParams.append(
                'includeUnreadCount',
                (options?.includeUnreadCount ?? true).toString()
            );
            queryParams.append('includeMetadata', (options?.includeMetadata ?? false).toString());

            const url = `${COMMUNICATION_ENDPOINTS.CONVERSATION_DETAILS(conversationId)}?${queryParams.toString()}`;
            const response: any = await axiosInstance.get(url);
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Conversation retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get conversation');
        }
    }

    /**
     * Create a new conversation
     */
    static async createConversation(
        request: CreateConversationRequest
    ): Promise<ApiResponse<ConversationResponse>> {
        try {
            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.CREATE_CONVERSATION,
                transformToPascalCase(request)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Conversation created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create conversation');
        }
    }

    /**
     * Get conversation between two users
     */
    static async getConversationBetweenUsers(
        userId1: string,
        userId2: string
    ): Promise<ApiResponse<ConversationResponse>> {
        try {
            const response: any = await axiosInstance.get(
                `${COMMUNICATION_ENDPOINTS.CONVERSATION_BETWEEN_USERS}?userId1=${userId1.toUpperCase()}&userId2=${userId2.toUpperCase()}`
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Conversation retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get conversation between users');
        }
    }

    /**
     * Get messages for a conversation (mixed timeline with call logs)
     */
    static async getMessages(
        conversationId: string,
        params?: GetMessagesQueryParameters
    ): Promise<ApiResponse<CursorPaginationResponse<MessageResponse>>> {
        try {
            const queryParams = new URLSearchParams();

            if (params?.before) queryParams.append('before', params.before);
            if (params?.after) queryParams.append('after', params.after);
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.messagesOnly !== undefined)
                queryParams.append('messagesOnly', params.messagesOnly.toString());
            if (params?.callLogsOnly !== undefined)
                queryParams.append('callLogsOnly', params.callLogsOnly.toString());
            if (params?.messageTypeFilter)
                queryParams.append('messageTypeFilter', params.messageTypeFilter);
            if (params?.callTypeFilter) queryParams.append('callTypeFilter', params.callTypeFilter);
            if (params?.includeSenderInfo !== undefined)
                queryParams.append('includeSenderInfo', params.includeSenderInfo.toString());
            if (params?.includeReceiverInfo !== undefined)
                queryParams.append('includeReceiverInfo', params.includeReceiverInfo.toString());
            if (params?.includeOnlineStatus !== undefined)
                queryParams.append('includeOnlineStatus', params.includeOnlineStatus.toString());

            const url = `${COMMUNICATION_ENDPOINTS.MESSAGES(conversationId)}?${queryParams.toString()}`;
            const response: any = await axiosInstance.get(url);

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Messages retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get messages');
        }
    }

    /**
     * Get a single message by ID
     */
    static async getMessage(messageId: string): Promise<ApiResponse<MessageResponse>> {
        try {
            const response: any = await axiosInstance.get(
                COMMUNICATION_ENDPOINTS.MESSAGE_BY_ID(messageId)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Message retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get message');
        }
    }

    /**
     * Create a text message
     */
    static async createMessage(
        request: CreateMessageRequest
    ): Promise<ApiResponse<MessageResponse>> {
        try {
            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.CREATE_MESSAGE,
                transformToPascalCase(request)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Message created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create message');
        }
    }

    /**
     * Create message with file upload (one-step)
     * Files are uploaded to S3 and message is created in one request
     */
    static async createMessageWithFiles(
        request: CreateMessageWithFilesRequest
    ): Promise<ApiResponse<MessageResponse>> {
        try {
            const formData = new FormData();
            formData.append('ConversationId', request.conversationId);
            formData.append('SenderId', request.senderId);
            if (request.receiverId) formData.append('ReceiverId', request.receiverId);
            formData.append('Content', request.content);
            formData.append('Type', request.type);

            for (const file of request.files) {
                formData.append('Files', file);
            }

            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.CREATE_MESSAGE_WITH_FILES,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Message with files created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create message with files');
        }
    }

    /**
     * Create message with pre-uploaded attachments
     */
    static async createMessageWithAttachments(
        conversationId: string,
        senderId: string,
        content: string,
        type: string,
        attachments: MessageAttachment[],
        receiverId?: string
    ): Promise<ApiResponse<MessageResponse>> {
        try {
            const request = {
                conversationId,
                senderId,
                receiverId,
                content,
                type,
                attachments,
            };
            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.CREATE_MESSAGE_WITH_ATTACHMENTS,
                transformToPascalCase(request)
            );

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Message with attachments created successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to create message with attachments');
        }
    }

    /**
     * Mark a message as read
     */
    static async markMessageAsRead(
        request: MarkMessageAsReadRequest
    ): Promise<ApiResponse<{ markedAsRead: boolean }>> {
        const response: any = await axiosInstance.post(
            COMMUNICATION_ENDPOINTS.MARK_AS_READ,
            transformToPascalCase(request)
        );
        return {
            success: response.success ?? true,
            data: response.data,
            message: response.message || 'Message marked as read',
        };
    }

    /**
     * Mark all messages in a conversation as read
     * Note: If all messages are already read, this is not considered an error
     */
    static async markAllMessagesAsRead(
        request: MarkAllMessagesAsReadRequest
    ): Promise<ApiResponse<{ markedAllAsRead: boolean }>> {
        try {
            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.MARK_ALL_AS_READ,
                transformToPascalCase(request)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'All messages marked as read',
            };
        } catch (error: any) {
            // If the error is because there are no unread messages, treat it as success
            if (isNoUnreadMessagesError(error)) {
                console.log('[ChatService] All messages already read, skipping mark as read');
                return {
                    success: true,
                    data: { markedAllAsRead: false },
                    message: 'Tất cả tin nhắn đã được đọc',
                };
            }

            // For other errors, throw as-is (axios interceptor already formatted it)
            throw error;
        }
    }

    /**
     * Thu hồi tin nhắn (chỉ trong vòng 1 giờ)
     */
    static async recallMessage(
        messageId: string,
        userId: string
    ): Promise<ApiResponse<MessageResponse>> {
        try {
            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.RECALL_MESSAGE,
                transformToPascalCase({ messageId, userId })
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Tin nhắn đã được thu hồi',
            };
        } catch (error: any) {
            console.error('[ChatService] ❌ recallMessage error:', error);
            throw new Error(error.message || 'Không thể thu hồi tin nhắn');
        }
    }

    /**
     * Get unread message count for a conversation
     */
    static async getUnreadCount(
        conversationId: string,
        userId: string
    ): Promise<ApiResponse<{ unreadCount: number }>> {
        try {
            const response: any = await axiosInstance.get(
                `${COMMUNICATION_ENDPOINTS.UNREAD_COUNT(conversationId)}?userId=${userId.toUpperCase()}`
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Unread count retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to get unread count');
        }
    }

    /**
     * Upload file to S3 (via Communication Service)
     * Note: Prefer using createMessageWithFiles for direct message + file upload
     */
    static async uploadFile(
        file: File,
        userId: string,
        messageType: string
    ): Promise<
        ApiResponse<{ fileUrl: string; fileName: string; fileSize: number; mimeType: string }>
    > {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userId', userId);
            formData.append('messageType', messageType);

            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.UPLOAD_FILE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'File uploaded successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to upload file');
        }
    }

    /**
     * Upload multiple files to S3
     * Note: Prefer using createMessageWithFiles for direct message + file upload
     */
    static async uploadMultipleFiles(
        files: File[],
        userId: string,
        messageType: string
    ): Promise<
        ApiResponse<
            {
                fileUrl: string;
                fileName: string;
                fileSize: number;
                mimeType: string;
                thumbnailUrl?: string;
            }[]
        >
    > {
        try {
            const formData = new FormData();
            for (const file of files) {
                formData.append('files', file);
            }
            formData.append('userId', userId);
            formData.append('messageType', messageType);

            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.UPLOAD_MULTIPLE_FILES,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Files uploaded successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to upload files');
        }
    }

    /**
     * Delete a message
     */
    static async deleteMessage(messageId: string): Promise<ApiResponse<{ deleted: boolean }>> {
        try {
            const response: any = await axiosInstance.delete(
                COMMUNICATION_ENDPOINTS.DELETE_MESSAGE(messageId)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Message deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete message');
        }
    }

    /**
     * Block a conversation
     */
    static async blockConversation(
        conversationId: string,
        blockedBy: string
    ): Promise<ApiResponse<{ blocked: boolean }>> {
        try {
            const request = { conversationId, blockedBy };
            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.BLOCK_CONVERSATION,
                transformToPascalCase(request)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Conversation blocked successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to block conversation');
        }
    }

    /**
     * Unblock a conversation
     */
    static async unblockConversation(
        conversationId: string
    ): Promise<ApiResponse<{ unblocked: boolean }>> {
        try {
            const request = { conversationId };
            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.UNBLOCK_CONVERSATION,
                transformToPascalCase(request)
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Conversation unblocked successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to unblock conversation');
        }
    }

    /**
     * Create a call log
     */
    static async createCallLog(
        request: CreateCallLogRequest
    ): Promise<ApiResponse<CallLogResponse>> {
        try {
            const transformedRequest = transformToPascalCase(request);
            console.log('[ChatService] 📤 Sending createCallLog request:', transformedRequest);

            const response: any = await axiosInstance.post(
                COMMUNICATION_ENDPOINTS.CREATE_CALL_LOG,
                transformedRequest
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Call log created successfully',
            };
        } catch (error: any) {
            console.error('[ChatService] ❌ createCallLog error:', error);
            throw new Error(error.message || 'Failed to create call log');
        }
    }

    /**
     * Update a call log
     */
    static async updateCallLog(
        request: UpdateCallLogRequest
    ): Promise<ApiResponse<CallLogResponse>> {
        try {
            const transformedRequest = transformToPascalCase(request);
            console.log('[ChatService] 📤 Sending updateCallLog request:', {
                url: COMMUNICATION_ENDPOINTS.UPDATE_CALL_LOG(request.id),
                body: transformedRequest,
            });

            const response: any = await axiosInstance.put(
                COMMUNICATION_ENDPOINTS.UPDATE_CALL_LOG(request.id),
                transformedRequest
            );
            return {
                success: response.success ?? true,
                data: response.data,
                message: response.message || 'Call log updated successfully',
            };
        } catch (error: any) {
            console.error('[ChatService] ❌ updateCallLog error:', error);
            throw new Error(error.message || 'Failed to update call log');
        }
    }
}

// Export individual methods for convenience
export const {
    getConversations,
    getConversation,
    createConversation,
    getConversationBetweenUsers,
    getMessages,
    getMessage,
    createMessage,
    createMessageWithFiles,
    createMessageWithAttachments,
    markMessageAsRead,
    markAllMessagesAsRead,
    recallMessage,
    getUnreadCount,
    uploadFile,
    uploadMultipleFiles,
    deleteMessage,
    blockConversation,
    unblockConversation,
    createCallLog,
    updateCallLog,
} = ChatService;

// Default export
export default ChatService;
