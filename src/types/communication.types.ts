// Communication Service Types based on Backend DTOs

export enum MessageType {
    TEXT = 'Text',
    IMAGE = 'Image',
    VIDEO = 'Video',
    AUDIO = 'Audio',
    FILE = 'File',
    VOICE_NOTE = 'VoiceNote',
    SYSTEM = 'System',
}

export enum MessageStatus {
    SENT = 'SENT',
    DELIVERED = 'DELIVERED',
    READ = 'READ',
    FAILED = 'FAILED',
}

export enum CallType {
    VOICE = 'Voice',
    VIDEO = 'Video',
}

export enum CallStatus {
    MISSED = 'Missed',
    COMPLETED = 'Completed',
    DECLINED = 'Declined',
    BUSY = 'Busy',
    FAILED = 'Failed',
}

// Message Attachment
export interface MessageAttachment {
    // Backend returns "url" but some places expect "fileUrl"
    url?: string;
    fileUrl?: string;
    // Backend returns "name" but some places expect "fileName"
    name?: string;
    fileName?: string;
    // Backend returns "size" but some places expect "fileSize"
    size?: number;
    fileSize?: number;
    mimeType?: string;
    thumbnailUrl?: string;
}

// Account Detail (from Auth Service via gRPC)
export interface AccountDetail {
    // Backend returns "id" in some places, "accountId" in others
    id?: string;
    accountId?: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
    phoneNumber?: string;
    role?: string;
    isOnline?: boolean;
    lastOnlineAt?: string | null;
}

// Last Message in Conversation
export interface LastMessage {
    messageId: string;
    content: string;
    senderId: string;
    createdAt: string;
    type?: MessageType;
    attachments?: MessageAttachment[];
}

// Conversation Response
export interface ConversationResponse {
    id: string;
    participants: string[];
    participantDetails?: AccountDetail[];
    lastMessage?: LastMessage;
    unreadCount?: number;
    blocked?: {
        blockedBy: string;
        blockedAt: string;
        reason?: string;
    } | null;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// Message Response
export interface MessageResponse {
    id: string;
    conversationId: string;
    senderId: string;
    receiverId?: string;
    content: string;
    type: MessageType;
    status: MessageStatus;
    attachments?: MessageAttachment[];
    senderInfo?: AccountDetail;
    receiverInfo?: AccountDetail;
    createdAt: string;
    updatedAt: string;
    readAt?: string;
}

// Call Log Response
export interface CallLogResponse {
    id: string;
    conversationId: string;
    callerId: string;
    receiverId: string;
    callType: CallType;
    callStatus: CallStatus;
    duration?: number;
    startTime: string;
    endTime?: string;
    createdAt: string;
}

// Request DTOs
export interface CreateConversationRequest {
    participants: string[];
    metadata?: Record<string, unknown>;
}

export interface CreateMessageRequest {
    conversationId: string;
    senderId: string;
    receiverId?: string;
    content: string;
    type: MessageType;
    attachments?: MessageAttachment[];
}

export interface CreateMessageWithFilesRequest {
    conversationId: string;
    senderId: string;
    receiverId?: string;
    content: string;
    type: MessageType;
    files: File[];
}

export interface GetConversationsQueryParameters {
    before?: string;
    after?: string;
    limit?: number;
    includeParticipantDetails?: boolean;
    includeUnreadCount?: boolean;
    includeMetadata?: boolean;
    includeOnlineStatus?: boolean;
}

export interface GetMessagesQueryParameters {
    before?: string;
    after?: string;
    limit?: number;
    messagesOnly?: boolean;
    callLogsOnly?: boolean;
    messageTypeFilter?: MessageType;
    callTypeFilter?: CallType;
    includeSenderInfo?: boolean;
    includeReceiverInfo?: boolean;
    includeOnlineStatus?: boolean;
}

export interface MarkMessageAsReadRequest {
    messageId: string;
}

export interface MarkAllMessagesAsReadRequest {
    conversationId: string;
    userId: string;
}

// SignalR Hub DTOs
export interface SendMessageHub {
    conversationId: string;
    receiverId?: string;
    content: string;
}

export interface SignalRMessageReceived {
    messageId: string;
    conversationId: string;
    senderId: string;
    receiverId?: string;
    content: string;
    type: MessageType;
    createdAt: string;
    status: MessageStatus;
    attachments?: MessageAttachment[]; // ✅ Support file attachments
}

export interface SignalRMessageRead {
    messageId: string;
    readBy: string;
    readAt: string;
}

export interface SignalRAllMessagesRead {
    conversationId: string;
    readBy: string;
    readAt: string;
}

export interface SignalRTypingEvent {
    userId: string;
    conversationId: string;
}

// Pagination Response for Mixed Timeline (Messages)
export interface MixedTimelinePaginationResponse<T> {
    items: T[]; // Backend returns 'items' for timeline items
    nextCursor?: string;
    previousCursor?: string;
    hasNext: boolean;
    hasPrevious: boolean;
    count?: number;
    limit: number;
    enrichmentInfo?: {
        senderInfoLoaded: boolean;
        receiverInfoLoaded: boolean;
        onlineStatusLoaded: boolean;
        totalUsersEnriched: number;
        messagesWithSenderInfo: number;
        messagesWithReceiverInfo: number;
    };
}

// Pagination Response for Conversations
export interface ConversationPaginationResponse<T> {
    data: T[]; // Backend returns 'data' for conversations
    nextCursor?: string;
    previousCursor?: string;
    hasNext: boolean;
    hasPrevious: boolean;
    limit: number;
    enrichmentInfo?: {
        participantDetailsLoaded: boolean;
        unreadCountLoaded: boolean;
        metadataLoaded: boolean;
        onlineStatusLoaded: boolean;
        totalConversations: number;
        optimizationMode: string;
        totalOriginalParticipants: number;
        totalOtherParticipantsEnriched: number;
        conversationsWithOtherParticipants: number;
        performanceBenefit?: {
            participantsSkipped: number;
            cacheCallsOptimized: boolean;
            networkCallsReduced: boolean;
        };
        totalParticipantsEnriched: number;
    };
}

// Generic Pagination Response (for backward compatibility)
export interface CursorPaginationResponse<T> {
    items?: T[]; // For mixed timeline
    data?: T[]; // For conversations
    nextCursor?: string;
    previousCursor?: string;
    hasNext: boolean;
    hasPrevious: boolean;
    count?: number;
    limit: number;
    enrichmentInfo?: any;
}

// API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
