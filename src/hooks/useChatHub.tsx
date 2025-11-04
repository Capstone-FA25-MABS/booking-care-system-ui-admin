import { useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import * as signalR from '@microsoft/signalr';
import {
    SendMessageHub,
    SignalRMessageReceived,
    SignalRMessageRead,
    SignalRAllMessagesRead,
    SignalRTypingEvent,
} from '@/types/communication.types';
import { RootState } from '@/store';

export interface ChatHubCallbacks {
    onMessageReceived?: (message: SignalRMessageReceived) => void;
    onMessageRead?: (data: SignalRMessageRead) => void;
    onAllMessagesRead?: (data: SignalRAllMessagesRead) => void;
    onUserStartedTyping?: (data: SignalRTypingEvent) => void;
    onUserStoppedTyping?: (data: SignalRTypingEvent) => void;
    onUserOnline?: (userId: string) => void;
    onUserOffline?: (userId: string) => void;
    onOnlineUsers?: (userIds: string[]) => void; // Receive initial list of online users
    onJoinedConversation?: (conversationId: string) => void;
    onLeftConversation?: (conversationId: string) => void;
    onError?: (error: string) => void;
}

export interface ChatHubConnection {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
    joinConversation: (conversationId: string) => Promise<void>;
    leaveConversation: (conversationId: string) => Promise<void>;
    sendMessage: (request: SendMessageHub) => Promise<void>;
    markMessageAsRead: (messageId: string) => Promise<void>;
    markAllMessagesAsRead: (conversationId: string) => Promise<void>;
    startTyping: (conversationId: string) => Promise<void>;
    stopTyping: (conversationId: string) => Promise<void>;
    getOnlineUsers: () => Promise<void>;
}

/**
 * Custom hook to manage SignalR ChatHub connection
 * @param accessToken - User's authentication token
 * @param callbacks - Event callbacks for SignalR hub events
 * @returns ChatHub connection object with methods to interact with the hub
 */
export const useChatHub = (
    accessToken: string | null,
    callbacks?: ChatHubCallbacks
): ChatHubConnection => {
    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const isConnectedRef = useRef<boolean>(false);
    const callbacksRef = useRef<ChatHubCallbacks | undefined>(callbacks);

    // Get user profile from Redux - Admin side structure
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );

    // Get accountId from any available profile
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const userId = userProfile?.accountId || '';

    // Build hub URL through API Gateway
    // Use Gateway route: /api/v1/communication/chatHub
    const chatHubUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/v1/communication/chatHub`;

    // Update callbacks ref when callbacks change (but don't reconnect)
    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    // Initialize SignalR connection
    useEffect(() => {
        // ⚠️ NOTE: ChatHub is currently [AllowAnonymous] for testing
        // So we allow connection even without token
        // When backend enables [Authorize], user must be authenticated

        // Get userId from Redux for query string fallback
        if (!userId) {
            console.log('[ChatHub] ⏳ Waiting for user profile...');
            return;
        }

        // Build URL with userId query string (fallback if JWT claims don't work)
        const hubUrlWithUserId = userId
            ? `${chatHubUrl}?userId=${encodeURIComponent(userId)}`
            : chatHubUrl;

        console.log('[ChatHub] Connecting with URL:', hubUrlWithUserId);
        console.log('[ChatHub] UserId from profile:', userId);

        // Create SignalR connection
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrlWithUserId, {
                // Provide token factory (will return empty string if no token)
                // This is fine because backend is [AllowAnonymous]
                accessTokenFactory: () => accessToken || '',
                transport:
                    signalR.HttpTransportType.WebSockets |
                    signalR.HttpTransportType.ServerSentEvents,
                skipNegotiation: false, // Let SignalR negotiate the best transport
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff: 0, 2, 10, 30 seconds
                    if (retryContext.previousRetryCount === 0) return 0;
                    if (retryContext.previousRetryCount === 1) return 2000;
                    if (retryContext.previousRetryCount === 2) return 10000;
                    return 30000;
                },
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Register event handlers using refs to avoid re-connection on callback changes
        connection.on('ReceiveMessage', (message) => {
            console.log('[ChatHub] 🔔 ReceiveMessage event from server:', message);
            callbacksRef.current?.onMessageReceived?.(message);
        });

        connection.on('MessageRead', (data) => {
            callbacksRef.current?.onMessageRead?.(data);
        });

        connection.on('AllMessagesRead', (data) => {
            callbacksRef.current?.onAllMessagesRead?.(data);
        });

        connection.on('UserStartedTyping', (data) => {
            callbacksRef.current?.onUserStartedTyping?.(data);
        });

        connection.on('UserStoppedTyping', (data) => {
            callbacksRef.current?.onUserStoppedTyping?.(data);
        });

        connection.on('OnlineUsers', (userIds) => {
            console.log('[ChatHub] 📥 Received OnlineUsers:', userIds);
            callbacksRef.current?.onOnlineUsers?.(userIds);
        });

        connection.on('UserOnline', (userId) => {
            console.log('[ChatHub] 📥 User came online:', userId);
            callbacksRef.current?.onUserOnline?.(userId);
        });

        connection.on('UserOffline', (userId) => {
            console.log('[ChatHub] 📥 User went offline:', userId);
            callbacksRef.current?.onUserOffline?.(userId);
        });

        connection.on('JoinedConversation', (conversationId) => {
            callbacksRef.current?.onJoinedConversation?.(conversationId);
        });

        connection.on('LeftConversation', (conversationId) => {
            callbacksRef.current?.onLeftConversation?.(conversationId);
        });

        // Error events - listen to multiple event names
        connection.on('ErrorMessage', (error) => {
            console.error('[ChatHub] ❌ ErrorMessage event:', error);
            callbacksRef.current?.onError?.(error);
        });

        connection.on('Error', (error) => {
            console.error('[ChatHub] ❌ Error event:', error);
            callbacksRef.current?.onError?.(error);
        });

        connection.on('error', (error) => {
            console.error('[ChatHub] ❌ error event (lowercase):', error);
            callbacksRef.current?.onError?.(error);
        });

        // Handle connection lifecycle
        connection.onreconnecting(() => {
            console.log('[ChatHub] Reconnecting...');
            isConnectedRef.current = false;
        });

        connection.onreconnected(() => {
            console.log('[ChatHub] Reconnected successfully');
            isConnectedRef.current = true;
        });

        connection.onclose((error) => {
            console.log('[ChatHub] Connection closed', error);
            isConnectedRef.current = false;
        });

        // Start connection
        const startConnection = async () => {
            try {
                await connection.start();
                console.log('[ChatHub] Connected successfully');
                isConnectedRef.current = true;
            } catch (error) {
                console.error('[ChatHub] Connection failed:', error);
                isConnectedRef.current = false;
                // Retry after 5 seconds
                setTimeout(startConnection, 5000);
            }
        };

        startConnection();

        // Store connection reference
        connectionRef.current = connection;

        // Cleanup on unmount
        return () => {
            if (connectionRef.current) {
                connectionRef.current.stop();
                isConnectedRef.current = false;
            }
        };
    }, [chatHubUrl, userId]); // Connect immediately, don't wait for accessToken since backend is [AllowAnonymous]

    // Hub methods
    const joinConversation = useCallback(async (conversationId: string) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            await connectionRef.current.invoke('JoinConversation', conversationId);
            console.log(`[ChatHub] Joined conversation: ${conversationId}`);
        } catch (error) {
            console.error('[ChatHub] Error joining conversation:', error);
            throw error;
        }
    }, []);

    const leaveConversation = useCallback(async (conversationId: string) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            await connectionRef.current.invoke('LeaveConversation', conversationId);
            console.log(`[ChatHub] Left conversation: ${conversationId}`);
        } catch (error) {
            console.error('[ChatHub] Error leaving conversation:', error);
            throw error;
        }
    }, []);

    const sendMessage = useCallback(async (request: SendMessageHub) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            // ⚠️ SignalR expects PascalCase for C# backend
            // Convert camelCase JavaScript to PascalCase C#
            const pascalCaseRequest = {
                ConversationId: request.conversationId,
                Content: request.content,
                ReceiverId: request.receiverId,
            };

            console.log('[ChatHub] Sending message:', pascalCaseRequest);
            await connectionRef.current.invoke('SendMessage', pascalCaseRequest);
            console.log('[ChatHub] Message sent via SignalR');
        } catch (error) {
            console.error('[ChatHub] Error sending message:', error);
            throw error;
        }
    }, []);

    const markMessageAsRead = useCallback(async (messageId: string) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            await connectionRef.current.invoke('MarkMessageAsRead', messageId);
            console.log(`[ChatHub] Marked message as read: ${messageId}`);
        } catch (error) {
            console.error('[ChatHub] Error marking message as read:', error);
            throw error;
        }
    }, []);

    const markAllMessagesAsRead = useCallback(async (conversationId: string) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            await connectionRef.current.invoke('MarkAllMessagesAsRead', conversationId);
            console.log(`[ChatHub] Marked all messages as read in conversation: ${conversationId}`);
        } catch (error: any) {
            // Extract error message from SignalR error
            const errorMessage = error?.message || error?.toString() || '';

            // If error is because all messages are already read, don't throw
            if (
                errorMessage.includes('không có tin nhắn chưa đọc') ||
                errorMessage.includes('Không thể đánh dấu tất cả tin nhắn là đã đọc') ||
                errorMessage.includes('no unread messages') ||
                errorMessage.toLowerCase().includes('already read')
            ) {
                console.log('[ChatHub] All messages already read, skipping mark as read');
                return; // Don't throw error
            }

            console.error('[ChatHub] Error marking all messages as read:', error);
            throw error;
        }
    }, []);

    const startTyping = useCallback(async (conversationId: string) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            return; // Don't throw error for typing indicators
        }
        try {
            await connectionRef.current.invoke('StartTyping', conversationId);
        } catch (error) {
            console.error('[ChatHub] Error sending typing indicator:', error);
        }
    }, []);

    const stopTyping = useCallback(async (conversationId: string) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            return; // Don't throw error for typing indicators
        }
        try {
            await connectionRef.current.invoke('StopTyping', conversationId);
        } catch (error) {
            console.error('[ChatHub] Error stopping typing indicator:', error);
        }
    }, []);

    const getOnlineUsers = useCallback(async () => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            await connectionRef.current.invoke('GetOnlineUsers');
        } catch (error) {
            console.error('[ChatHub] Error getting online users:', error);
            throw error;
        }
    }, []);

    return {
        connection: connectionRef.current,
        isConnected: isConnectedRef.current,
        joinConversation,
        leaveConversation,
        sendMessage,
        markMessageAsRead,
        markAllMessagesAsRead,
        startTyping,
        stopTyping,
        getOnlineUsers,
    };
};
