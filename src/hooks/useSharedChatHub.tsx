import { useCallback, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { useChatHubConnection } from '@/contexts/ChatHubContext';
import { SendMessageHub } from '@/types/communication.types';
import { ChatHubCallbacks } from './useChatHub';

/**
 * Helper to check if connection is ready to send/invoke
 * CRITICAL: Always check this before any invoke() call
 */
const isConnectionReady = (connection: signalR.HubConnection | null): boolean => {
    if (!connection) return false;
    const state = connection.state;
    // Only Connected state is valid for sending
    return state === signalR.HubConnectionState.Connected;
};

/**
 * Get human-readable connection state for logging
 */
const getConnectionStateString = (connection: signalR.HubConnection | null): string => {
    if (!connection) return 'null';
    return signalR.HubConnectionState[connection.state] || 'unknown';
};

/**
 * Hook to use shared ChatHub connection with event callbacks
 * - Uses the shared connection from ChatHubContext
 * - Allows registering event callbacks
 * - Multiple components can use this hook with different callbacks
 */
export const useSharedChatHub = (callbacks?: ChatHubCallbacks) => {
    const { connection, isConnected, isReady } = useChatHubConnection();
    const callbacksRef = useRef<ChatHubCallbacks | undefined>(callbacks);

    // Update callbacks ref when callbacks change (but don't re-register)
    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    // Register event handlers on the shared connection
    useEffect(() => {
        if (!connection) return;

        // Register event handlers using refs to get latest callbacks
        const receiveMessageHandler = (message: any) => {
            callbacksRef.current?.onMessageReceived?.(message);
        };

        const messageReadHandler = (data: any) => {
            callbacksRef.current?.onMessageRead?.(data);
        };

        const allMessagesReadHandler = (data: any) => {
            callbacksRef.current?.onAllMessagesRead?.(data);
        };

        const messageRecalledHandler = (data: any) => {
            callbacksRef.current?.onMessageRecalled?.(data);
        };

        const userStartedTypingHandler = (data: any) => {
            callbacksRef.current?.onUserStartedTyping?.(data);
        };

        const userStoppedTypingHandler = (data: any) => {
            callbacksRef.current?.onUserStoppedTyping?.(data);
        };

        const userOnlineHandler = (userId: string) => {
            callbacksRef.current?.onUserOnline?.(userId);
        };

        const userOfflineHandler = (userId: string) => {
            callbacksRef.current?.onUserOffline?.(userId);
        };

        const onlineUsersHandler = (userIds: string[]) => {
            callbacksRef.current?.onOnlineUsers?.(userIds);
        };

        const joinedConversationHandler = (conversationId: string) => {
            callbacksRef.current?.onJoinedConversation?.(conversationId);
        };

        const leftConversationHandler = (conversationId: string) => {
            callbacksRef.current?.onLeftConversation?.(conversationId);
        };

        const errorHandler = (error: string) => {
            console.error('[useSharedChatHub] ❌ Error event:', error);
            callbacksRef.current?.onError?.(error);
        };

        // WebRTC Call event handlers
        const incomingCallHandler = (data: any) => {
            console.log('[useSharedChatHub] 📞 IncomingCall event:', data);
            callbacksRef.current?.onIncomingCall?.(data);
        };

        const callAcceptedHandler = (data: any) => {
            console.log('[useSharedChatHub] ✅ CallAccepted event:', data);
            callbacksRef.current?.onCallAccepted?.(data);
        };

        const callDeclinedHandler = (data: any) => {
            console.log('[useSharedChatHub] ❌ CallDeclined event:', data);
            callbacksRef.current?.onCallDeclined?.(data);
        };

        const callEndedHandler = (data: any) => {
            console.log('[useSharedChatHub] 📵 CallEnded event:', data);
            callbacksRef.current?.onCallEnded?.(data);
        };

        const userBusyHandler = (data: any) => {
            console.log('[useSharedChatHub] 📞 UserBusy event:', data);
            callbacksRef.current?.onUserBusy?.(data);
        };

        const receiveOfferHandler = (data: any) => {
            console.log('[useSharedChatHub] 📡 ReceiveOffer event:', data);
            callbacksRef.current?.onReceiveOffer?.(data);
        };

        const receiveAnswerHandler = (data: any) => {
            console.log('[useSharedChatHub] 📡 ReceiveAnswer event:', data);
            callbacksRef.current?.onReceiveAnswer?.(data);
        };

        const receiveIceCandidateHandler = (data: any) => {
            console.log('[useSharedChatHub] 🧊 ReceiveIceCandidate event:', data);
            callbacksRef.current?.onReceiveIceCandidate?.(data);
        };

        const callLogUpdatedHandler = (data: any) => {
            console.log('[useSharedChatHub] 📝 CallLogUpdated event:', data);
            callbacksRef.current?.onCallLogUpdated?.(data);
        };

        // Register all handlers
        connection.on('ReceiveMessage', receiveMessageHandler);
        connection.on('MessageRead', messageReadHandler);
        connection.on('AllMessagesRead', allMessagesReadHandler);
        connection.on('MessageRecalled', messageRecalledHandler);
        connection.on('UserStartedTyping', userStartedTypingHandler);
        connection.on('UserStoppedTyping', userStoppedTypingHandler);
        connection.on('UserOnline', userOnlineHandler);
        connection.on('UserOffline', userOfflineHandler);
        connection.on('OnlineUsers', onlineUsersHandler);
        connection.on('JoinedConversation', joinedConversationHandler);
        connection.on('LeftConversation', leftConversationHandler);
        connection.on('ErrorMessage', errorHandler);
        connection.on('Error', errorHandler);
        connection.on('error', errorHandler);
        // WebRTC Call events
        connection.on('IncomingCall', incomingCallHandler);
        connection.on('CallAccepted', callAcceptedHandler);
        connection.on('CallDeclined', callDeclinedHandler);
        connection.on('CallEnded', callEndedHandler);
        connection.on('UserBusy', userBusyHandler);
        connection.on('ReceiveOffer', receiveOfferHandler);
        connection.on('ReceiveAnswer', receiveAnswerHandler);
        connection.on('ReceiveIceCandidate', receiveIceCandidateHandler);
        connection.on('CallLogUpdated', callLogUpdatedHandler);

        // Cleanup - remove handlers on unmount
        return () => {
            console.log('[useSharedChatHub] 🧹 Removing event handlers');
            // Check if connection still exists and is in a valid state before removing handlers
            if (!connection) {
                // Silently skip if connection is null (already cleaned up)
                return;
            }

            try {
                const state = connection.state;
                // Only remove handlers if connection is in a stable state
                if (
                    state === signalR.HubConnectionState.Connected ||
                    state === signalR.HubConnectionState.Disconnected
                ) {
                    connection.off('ReceiveMessage', receiveMessageHandler);
                    connection.off('MessageRead', messageReadHandler);
                    connection.off('AllMessagesRead', allMessagesReadHandler);
                    connection.off('MessageRecalled', messageRecalledHandler);
                    connection.off('UserStartedTyping', userStartedTypingHandler);
                    connection.off('UserStoppedTyping', userStoppedTypingHandler);
                    connection.off('UserOnline', userOnlineHandler);
                    connection.off('UserOffline', userOfflineHandler);
                    connection.off('OnlineUsers', onlineUsersHandler);
                    connection.off('JoinedConversation', joinedConversationHandler);
                    connection.off('LeftConversation', leftConversationHandler);
                    connection.off('ErrorMessage', errorHandler);
                    connection.off('Error', errorHandler);
                    connection.off('error', errorHandler);
                    // WebRTC Call events
                    connection.off('IncomingCall', incomingCallHandler);
                    connection.off('CallAccepted', callAcceptedHandler);
                    connection.off('CallDeclined', callDeclinedHandler);
                    connection.off('CallEnded', callEndedHandler);
                    connection.off('UserBusy', userBusyHandler);
                    connection.off('ReceiveOffer', receiveOfferHandler);
                    connection.off('ReceiveAnswer', receiveAnswerHandler);
                    connection.off('ReceiveIceCandidate', receiveIceCandidateHandler);
                    connection.off('CallLogUpdated', callLogUpdatedHandler);
                }
                // Silently skip cleanup if connection is not in stable state (Connecting/Reconnecting)
                // This is expected behavior during React Strict Mode double mount
            } catch {
                // Silently fail during cleanup - connection might already be disposed
            }
        };
    }, [connection]);

    // Hub methods - All methods now include proper state checking and logging
    const joinConversation = useCallback(
        async (conversationId: string) => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot join - connection state:',
                    getConnectionStateString(connection)
                );
                throw new Error('ChatHub is not connected');
            }
            try {
                await connection!.invoke('JoinConversation', conversationId);
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error joining conversation:', error);
                throw error;
            }
        },
        [connection]
    );

    const leaveConversation = useCallback(
        async (conversationId: string) => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot leave conversation - state:',
                    getConnectionStateString(connection)
                );
                return; // ✅ Don't throw error, just return silently during cleanup
            }
            try {
                await connection!.invoke('LeaveConversation', conversationId);
                console.log('[useSharedChatHub] ✅ Left conversation:', conversationId);
            } catch (error: any) {
                // ✅ Don't throw if connection was closed (common during cleanup)
                if (error?.message?.includes('connection being closed')) {
                    console.warn(
                        '[useSharedChatHub] ⚠️ Connection closed while leaving conversation'
                    );
                    return;
                }
                console.error('[useSharedChatHub] ❌ Error leaving conversation:', error);
                // Don't throw - leaving conversation shouldn't break the app
            }
        },
        [connection]
    );

    const sendMessage = useCallback(
        async (request: SendMessageHub) => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot send message - connection state:',
                    getConnectionStateString(connection)
                );
                throw new Error('ChatHub is not connected');
            }
            try {
                const pascalCaseRequest = {
                    ConversationId: request.conversationId,
                    Content: request.content,
                    ReceiverId: request.receiverId,
                };

                console.log('[useSharedChatHub] 📤 Sending message:', pascalCaseRequest);
                await connection!.invoke('SendMessage', pascalCaseRequest);
                console.log('[useSharedChatHub] ✅ Message sent');
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error sending message:', error);
                throw error;
            }
        },
        [connection]
    );

    const markMessageAsRead = useCallback(
        async (messageId: string) => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot mark as read - state:',
                    getConnectionStateString(connection)
                );
                throw new Error('ChatHub is not connected');
            }
            try {
                await connection!.invoke('MarkMessageAsRead', messageId);
                console.log(`[useSharedChatHub] ✅ Marked message as read: ${messageId}`);
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error marking message as read:', error);
                throw error;
            }
        },
        [connection]
    );

    const markAllMessagesAsRead = useCallback(
        async (conversationId: string) => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot mark all as read - state:',
                    getConnectionStateString(connection)
                );
                throw new Error('ChatHub is not connected');
            }
            try {
                await connection!.invoke('MarkAllMessagesAsRead', conversationId);
            } catch (error: any) {
                const errorMessage = error?.message || error?.toString() || '';

                if (
                    errorMessage.includes('không có tin nhắn chưa đọc') ||
                    errorMessage.includes('Không thể đánh dấu tất cả tin nhắn là đã đọc') ||
                    errorMessage.includes('no unread messages') ||
                    errorMessage.toLowerCase().includes('already read')
                ) {
                    console.log('[useSharedChatHub] All messages already read, skipping');
                    return;
                }

                console.error('[useSharedChatHub] ❌ Error marking all as read:', error);
                throw error;
            }
        },
        [connection]
    );

    const startTyping = useCallback(
        async (conversationId: string) => {
            if (!isConnectionReady(connection)) return;
            try {
                await connection!.invoke('StartTyping', conversationId);
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error sending typing indicator:', error);
            }
        },
        [connection]
    );

    const stopTyping = useCallback(
        async (conversationId: string) => {
            if (!isConnectionReady(connection)) return;
            try {
                await connection!.invoke('StopTyping', conversationId);
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error stopping typing indicator:', error);
            }
        },
        [connection]
    );

    const getOnlineUsers = useCallback(async () => {
        if (!isConnectionReady(connection)) {
            console.warn(
                '[useSharedChatHub] ⚠️ Cannot get online users - state:',
                getConnectionStateString(connection)
            );
            throw new Error('ChatHub is not connected');
        }
        try {
            await connection!.invoke('GetOnlineUsers');
        } catch (error) {
            console.error('[useSharedChatHub] ❌ Error getting online users:', error);
            throw error;
        }
    }, [connection]);

    // WebRTC Call methods - All with proper state checking
    const startCall = useCallback(
        async (calleeId: string, conversationId: string, callType: string = 'video') => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot start call - state:',
                    getConnectionStateString(connection)
                );
                throw new Error('ChatHub is not connected');
            }
            try {
                await connection!.invoke('StartCall', {
                    CalleeId: calleeId,
                    ConversationId: conversationId,
                    CallType: callType,
                });
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error starting call:', error);
                throw error;
            }
        },
        [connection]
    );

    const acceptCall = useCallback(
        async (callerId: string, conversationId: string) => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot accept call - state:',
                    getConnectionStateString(connection)
                );
                throw new Error('ChatHub is not connected');
            }
            try {
                await connection!.invoke('AcceptCall', {
                    CallerId: callerId,
                    ConversationId: conversationId,
                });
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error accepting call:', error);
                throw error;
            }
        },
        [connection]
    );

    const declineCall = useCallback(
        async (callerId: string, reason?: string) => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot decline call - state:',
                    getConnectionStateString(connection)
                );
                throw new Error('ChatHub is not connected');
            }
            try {
                await connection!.invoke('DeclineCall', {
                    CallerId: callerId,
                    Reason: reason || 'declined',
                });
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error declining call:', error);
                throw error;
            }
        },
        [connection]
    );

    const endCall = useCallback(
        async (otherUserId: string, reason?: string) => {
            if (!isConnectionReady(connection)) {
                console.warn(
                    '[useSharedChatHub] ⚠️ Cannot end call - state:',
                    getConnectionStateString(connection)
                );
                throw new Error('ChatHub is not connected');
            }
            try {
                await connection!.invoke('EndCall', {
                    OtherUserId: otherUserId,
                    Reason: reason || 'ended',
                });
            } catch (error) {
                console.error('[useSharedChatHub] ❌ Error ending call:', error);
                throw error;
            }
        },
        [connection]
    );

    return {
        connection,
        isConnected,
        isReady, // ✅ Expose helper for checking actual connection state
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
    };
};
