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
    // Chat callbacks
    onMessageReceived?: (message: SignalRMessageReceived) => void;
    onMessageRead?: (data: SignalRMessageRead) => void;
    onAllMessagesRead?: (data: SignalRAllMessagesRead) => void;
    onMessageRecalled?: (data: any) => void; // Message recalled event
    onUserStartedTyping?: (data: SignalRTypingEvent) => void;
    onUserStoppedTyping?: (data: SignalRTypingEvent) => void;
    onUserOnline?: (userId: string) => void;
    onUserOffline?: (userId: string) => void;
    onOnlineUsers?: (userIds: string[]) => void; // Receive initial list of online users
    onJoinedConversation?: (conversationId: string) => void;
    onLeftConversation?: (conversationId: string) => void;
    onError?: (error: string) => void;

    // WebRTC Call callbacks
    onIncomingCall?: (data: IncomingCallData) => void;
    onCallAccepted?: (data: CallAcceptedData) => void;
    onCallDeclined?: (data: CallDeclinedData) => void;
    onCallEnded?: (data: CallEndedData) => void;
    onUserBusy?: (data: UserBusyData) => void;
    onReceiveOffer?: (data: WebRTCOfferData) => void;
    onReceiveAnswer?: (data: WebRTCAnswerData) => void;
    onReceiveIceCandidate?: (data: ICECandidateData) => void;
    onCallLogUpdated?: (data: any) => void; // ✅ New: Call log updated event
}

// WebRTC Data Types
export interface IncomingCallData {
    callerId: string;
    calleeId: string;
    conversationId: string;
    callType: string;
    callerName?: string;
    callerAvatar?: string;
}

export interface CallAcceptedData {
    calleeId: string;
    callerId: string;
    conversationId: string;
}

export interface CallDeclinedData {
    calleeId: string;
    callerId: string;
    reason?: string;
}

export interface CallEndedData {
    userId: string;
    otherUserId: string;
    reason?: string;
}

export interface UserBusyData {
    userId: string;
    callerId: string;
}

export interface WebRTCOfferData {
    senderId: string;
    receiverId: string;
    offer: RTCSessionDescriptionInit;
}

export interface WebRTCAnswerData {
    senderId: string;
    receiverId: string;
    answer: RTCSessionDescriptionInit;
}

export interface ICECandidateData {
    senderId: string;
    receiverId: string;
    candidate: RTCIceCandidateInit;
}

export interface ChatHubConnection {
    connection: signalR.HubConnection | null;
    isConnected: boolean;

    // Chat methods
    joinConversation: (conversationId: string) => Promise<void>;
    leaveConversation: (conversationId: string) => Promise<void>;
    sendMessage: (request: SendMessageHub) => Promise<void>;
    markMessageAsRead: (messageId: string) => Promise<void>;
    markAllMessagesAsRead: (conversationId: string) => Promise<void>;
    startTyping: (conversationId: string) => Promise<void>;
    stopTyping: (conversationId: string) => Promise<void>;
    getOnlineUsers: () => Promise<void>;

    // WebRTC Call methods
    startCall: (calleeId: string, conversationId: string, callType?: string) => Promise<void>;
    acceptCall: (callerId: string, conversationId: string) => Promise<void>;
    declineCall: (callerId: string, reason?: string) => Promise<void>;
    endCall: (otherUserId: string, reason?: string) => Promise<void>;
    sendOffer: (receiverId: string, offer: RTCSessionDescriptionInit) => Promise<void>;
    sendAnswer: (receiverId: string, answer: RTCSessionDescriptionInit) => Promise<void>;
    sendIceCandidate: (receiverId: string, candidate: RTCIceCandidateInit) => Promise<void>;
    callBusy: (callerId: string) => Promise<void>;
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

        // WebRTC Call event handlers
        connection.on('IncomingCall', (data) => {
            console.log('[ChatHub] 📞 IncomingCall event:', data);
            callbacksRef.current?.onIncomingCall?.(data);
        });

        connection.on('CallAccepted', (data) => {
            console.log('[ChatHub] ✅ CallAccepted event:', data);
            callbacksRef.current?.onCallAccepted?.(data);
        });

        connection.on('CallDeclined', (data) => {
            console.log('[ChatHub] ❌ CallDeclined event:', data);
            callbacksRef.current?.onCallDeclined?.(data);
        });

        connection.on('CallEnded', (data) => {
            console.log('[ChatHub] 📵 CallEnded event:', data);
            callbacksRef.current?.onCallEnded?.(data);
        });

        connection.on('UserBusy', (data) => {
            console.log('[ChatHub] 📞 UserBusy event:', data);
            callbacksRef.current?.onUserBusy?.(data);
        });

        connection.on('ReceiveOffer', (data) => {
            console.log('[ChatHub] 📡 ReceiveOffer event:', data);
            callbacksRef.current?.onReceiveOffer?.(data);
        });

        connection.on('ReceiveAnswer', (data) => {
            console.log('[ChatHub] 📡 ReceiveAnswer event:', data);
            callbacksRef.current?.onReceiveAnswer?.(data);
        });

        connection.on('ReceiveIceCandidate', (data) => {
            console.log('[ChatHub] 🧊 ReceiveIceCandidate event:', data);
            callbacksRef.current?.onReceiveIceCandidate?.(data);
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

    // WebRTC Call methods
    const startCall = useCallback(
        async (calleeId: string, conversationId: string, callType: string = 'video') => {
            if (!connectionRef.current || !isConnectedRef.current) {
                throw new Error('ChatHub is not connected');
            }
            try {
                const request = {
                    CalleeId: calleeId,
                    ConversationId: conversationId,
                    CallType: callType,
                };
                console.log('[ChatHub] 📞 Starting call:', request);
                await connectionRef.current.invoke('StartCall', request);
            } catch (error) {
                console.error('[ChatHub] Error starting call:', error);
                throw error;
            }
        },
        []
    );

    const acceptCall = useCallback(async (callerId: string, conversationId: string) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            const request = {
                CallerId: callerId,
                ConversationId: conversationId,
            };
            console.log('[ChatHub] ✅ Accepting call:', request);
            await connectionRef.current.invoke('AcceptCall', request);
        } catch (error) {
            console.error('[ChatHub] Error accepting call:', error);
            throw error;
        }
    }, []);

    const declineCall = useCallback(async (callerId: string, reason: string = 'User declined') => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            const request = {
                CallerId: callerId,
                Reason: reason,
            };
            console.log('[ChatHub] ❌ Declining call:', request);
            await connectionRef.current.invoke('DeclineCall', request);
        } catch (error) {
            console.error('[ChatHub] Error declining call:', error);
            throw error;
        }
    }, []);

    const endCall = useCallback(async (otherUserId: string, reason: string = 'Call ended') => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            const request = {
                OtherUserId: otherUserId,
                Reason: reason,
            };
            console.log('[ChatHub] 📵 Ending call:', request);
            await connectionRef.current.invoke('EndCall', request);
        } catch (error) {
            console.error('[ChatHub] Error ending call:', error);
            throw error;
        }
    }, []);

    const sendOffer = useCallback(async (receiverId: string, offer: RTCSessionDescriptionInit) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            const request = {
                ReceiverId: receiverId,
                Offer: offer,
            };
            console.log('[ChatHub] 📡 Sending offer to:', receiverId);
            await connectionRef.current.invoke('SendOffer', request);
        } catch (error) {
            console.error('[ChatHub] Error sending offer:', error);
            throw error;
        }
    }, []);

    const sendAnswer = useCallback(
        async (receiverId: string, answer: RTCSessionDescriptionInit) => {
            if (!connectionRef.current || !isConnectedRef.current) {
                throw new Error('ChatHub is not connected');
            }
            try {
                const request = {
                    ReceiverId: receiverId,
                    Answer: answer,
                };
                console.log('[ChatHub] 📡 Sending answer to:', receiverId);
                await connectionRef.current.invoke('SendAnswer', request);
            } catch (error) {
                console.error('[ChatHub] Error sending answer:', error);
                throw error;
            }
        },
        []
    );

    const sendIceCandidate = useCallback(
        async (receiverId: string, candidate: RTCIceCandidateInit) => {
            if (!connectionRef.current || !isConnectedRef.current) {
                throw new Error('ChatHub is not connected');
            }
            try {
                const request = {
                    ReceiverId: receiverId,
                    Candidate: candidate,
                };
                console.log('[ChatHub] 🧊 Sending ICE candidate to:', receiverId);
                await connectionRef.current.invoke('SendIceCandidate', request);
            } catch (error) {
                console.error('[ChatHub] Error sending ICE candidate:', error);
                throw error;
            }
        },
        []
    );

    const callBusy = useCallback(async (callerId: string) => {
        if (!connectionRef.current || !isConnectedRef.current) {
            throw new Error('ChatHub is not connected');
        }
        try {
            const request = {
                CallerId: callerId,
            };
            console.log('[ChatHub] 📞 Sending busy signal to:', callerId);
            await connectionRef.current.invoke('CallBusy', request);
        } catch (error) {
            console.error('[ChatHub] Error sending busy signal:', error);
            throw error;
        }
    }, []);

    return {
        connection: connectionRef.current,
        isConnected: isConnectedRef.current,
        // Chat methods
        joinConversation,
        leaveConversation,
        sendMessage,
        markMessageAsRead,
        markAllMessagesAsRead,
        startTyping,
        stopTyping,
        getOnlineUsers,
        // WebRTC Call methods
        startCall,
        acceptCall,
        declineCall,
        endCall,
        sendOffer,
        sendAnswer,
        sendIceCandidate,
        callBusy,
    };
};
