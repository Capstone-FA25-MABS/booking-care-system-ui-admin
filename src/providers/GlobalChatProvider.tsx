import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { RootState } from '@/store';
import { useSharedChatHub } from '@/hooks/useSharedChatHub';
import { ChatHubCallbacks, IncomingCallData } from '@/hooks/useChatHub';
import { SignalRMessageReceived } from '@/types/communication.types';
import IncomingCallNotification from '@/components/IncomingCallNotification';

interface GlobalChatContextValue {
    isConnected: boolean;
    connection: any;
    onlineUsers: Set<string>;
    isUserOnline: (userId: string) => boolean;
    incomingCall: IncomingCallData | null;
    acceptIncomingCall: () => void;
    declineIncomingCall: () => void;
    clearIncomingCall: () => void;
    clearProcessedCall: (callerId: string, conversationId: string) => void; // ✅ Add new function
}

const GlobalChatContext = createContext<GlobalChatContextValue | undefined>(undefined);

interface GlobalChatProviderProps {
    children: React.ReactNode;
}

/**
 * Global ChatProvider for Admin - Handles global chat notifications
 * - Uses shared ChatHub connection from ChatHubContext
 * - Receives message notifications globally (not just in Messages page)
 * - Shows toast notifications when NOT on Messages page
 */
export const GlobalChatProvider: React.FC<GlobalChatProviderProps> = ({ children }) => {
    const navigate = useNavigate();
    // Admin side - get profile from any available source
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );

    // Get accountId from any available profile
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const userId = userProfile?.accountId || '';
    const location = useLocation();

    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);

    // ✅ Track processed calls to prevent spam/duplicates
    const processedCallsRef = React.useRef<Set<string>>(new Set());
    const callTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

    // Global notification callbacks
    const hubCallbacks: ChatHubCallbacks = {
        onMessageReceived: useCallback(
            (message: SignalRMessageReceived) => {
                console.log('[GlobalChat] 🔔 New message notification:', message);

                // Only show notification if:
                // 1. Message is not from current user
                // 2. User is NOT on the Messages page (to avoid duplicate notifications)
                const isOnMessagesPage = location.pathname.toLowerCase().includes('/messages');

                if (message.senderId.toUpperCase() !== userId.toUpperCase() && !isOnMessagesPage) {
                    toast.info('💬 Bạn có tin nhắn mới!', {
                        onClick: () => {
                            // Navigate to messages page
                            window.location.href = '/hospitals/messages';
                        },
                    });
                }
            },
            [userId, location.pathname]
        ),

        onOnlineUsers: useCallback((userIds: string[]) => {
            console.log('[GlobalChat] 👥 Received online users list:', userIds);
            // Normalize to UPPERCASE for case-insensitive matching
            const normalizedIds = userIds.map((id) => id.toUpperCase());
            setOnlineUsers(new Set(normalizedIds));
        }, []),

        onUserOnline: useCallback((userId: string) => {
            console.log('[GlobalChat] 🟢 User online:', userId);
            // Normalize to UPPERCASE for case-insensitive matching
            const normalizedId = userId.toUpperCase();
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.add(normalizedId);
                return newSet;
            });
        }, []),

        onUserOffline: useCallback((userId: string) => {
            console.log('[GlobalChat] 🔴 User offline:', userId);
            // Normalize to UPPERCASE for case-insensitive matching
            const normalizedId = userId.toUpperCase();
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(normalizedId);
                return newSet;
            });
        }, []),

        onError: useCallback((error: string) => {
            console.error('[GlobalChat] ❌ SignalR error:', error);
            // Don't show error toast for connection issues - too noisy
        }, []),

        onIncomingCall: useCallback((data: IncomingCallData) => {
            console.log('[GlobalChat] 📞 Incoming call:', data);

            // ✅ Create unique call ID from caller and conversation
            const callId = `${data.callerId}-${data.conversationId}`;

            // ✅ Check if this call has already been processed/dismissed
            if (processedCallsRef.current.has(callId)) {
                console.log('[GlobalChat] ⏭️ Call already processed, ignoring:', callId);
                return;
            }

            // ✅ Clear any existing timeout
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
            }

            // ✅ Mark call as processed immediately to prevent duplicates
            processedCallsRef.current.add(callId);

            // ✅ Set incoming call state
            setIncomingCall(data);

            // ✅ Auto-cleanup after 60 seconds (in case call is abandoned)
            callTimeoutRef.current = setTimeout(() => {
                console.log('[GlobalChat] ⏰ Auto-clearing abandoned call:', callId);
                processedCallsRef.current.delete(callId);
                setIncomingCall((prev) => {
                    // Only clear if it's the same call
                    if (prev && `${prev.callerId}-${prev.conversationId}` === callId) {
                        return null;
                    }
                    return prev;
                });
            }, 60000);
        }, []),

        onCallEnded: useCallback((data: any) => {
            console.log('[GlobalChat] 📵 Call ended:', data);

            // ✅ Clear timeout
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
            }

            // ✅ If there's an incoming call, check if it's from the user who ended the call
            setIncomingCall((prev) => {
                if (!prev) return prev;

                // data.userId is the one who ended the call
                // data.otherUserId is the other participant
                // If the caller (data.userId) ended the call, clear the notification
                const isCallerWhoEnded = prev.callerId.toUpperCase() === data.userId?.toUpperCase();

                if (isCallerWhoEnded) {
                    console.log(
                        '[GlobalChat] Clearing incoming call notification (caller ended call)'
                    );
                    // ✅ Clear from processed set to allow same user to call again
                    const callId = `${prev.callerId}-${prev.conversationId}`;
                    processedCallsRef.current.delete(callId);
                    return null;
                }
                return prev;
            });
        }, []),

        onCallLogUpdated: useCallback((data: any) => {
            console.log('[GlobalChat] 📝 Call log updated:', data);
            // ℹ️ The backend has already updated the conversation's LastMessage
            // Components that display conversation lists can listen to this event
            // and refetch/invalidate their queries to show the updated LastMessage
            // No action needed here - this is for page-level handlers
        }, []),

        onCallDeclined: useCallback((data: any) => {
            console.log('[GlobalChat] ❌ Call declined:', data);

            // ✅ Clear timeout
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
            }

            // ✅ If there's an incoming call, check if caller declined
            setIncomingCall((prev) => {
                if (!prev) return prev;

                // data.callerId is the one who initiated the call and declined it
                // If the caller declined their own call, clear the notification
                const isCallerWhoDeclined =
                    prev.callerId.toUpperCase() === data.callerId?.toUpperCase();

                if (isCallerWhoDeclined) {
                    console.log(
                        '[GlobalChat] Clearing incoming call notification (caller declined their own call)'
                    );
                    // ✅ Clear from processed set to allow same user to call again
                    const callId = `${prev.callerId}-${prev.conversationId}`;
                    processedCallsRef.current.delete(callId);
                    return null;
                }
                return prev;
            });
        }, []),
    };

    // Use shared ChatHub connection
    const chatHub = useSharedChatHub(hubCallbacks);

    // ✅ Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (callTimeoutRef.current) {
                clearTimeout(callTimeoutRef.current);
            }
        };
    }, []);

    // Handle accepting incoming call
    const acceptIncomingCall = useCallback(() => {
        if (!incomingCall) return;
        console.log('[GlobalChat] ✅ Accepting call, navigating to messages...');

        // ✅ Clear timeout
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
        }

        const callData = { ...incomingCall }; // Copy call data before clearing
        setIncomingCall(null); // Clear immediately to prevent duplicate notifications

        // ✅ Keep the call in processed set to prevent re-showing
        // (It will be cleaned up by Messages component or auto-timeout)

        // Navigate to messages page - the Messages component will handle the call
        navigate('/hospitals/messages', { state: { incomingCall: callData } });
    }, [incomingCall, navigate]);

    // Handle declining incoming call
    const declineIncomingCall = useCallback(async () => {
        if (!incomingCall) return;
        console.log('[GlobalChat] ❌ Declining call from:', incomingCall.callerId);

        // ✅ Clear timeout
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
        }

        try {
            // ✅ Send decline signal to backend
            await chatHub.declineCall(incomingCall.callerId, 'User declined');

            // ✅ Clear from processed set to allow same user to call again
            const callId = `${incomingCall.callerId}-${incomingCall.conversationId}`;
            console.log('[GlobalChat] Clearing declined call from processed set:', callId);
            processedCallsRef.current.delete(callId);

            // ✅ Clear state
            setIncomingCall(null);
        } catch (error) {
            console.error('[GlobalChat] Error declining call:', error);

            // ✅ Clear from processed set even on error
            if (incomingCall) {
                const callId = `${incomingCall.callerId}-${incomingCall.conversationId}`;
                console.log(
                    '[GlobalChat] Clearing declined call from processed set (error):',
                    callId
                );
                processedCallsRef.current.delete(callId);
            }

            // Clear state even if decline fails
            setIncomingCall(null);
        }
    }, [incomingCall, chatHub]);

    // Clear incoming call (used by Messages when it takes over the call)
    const clearIncomingCall = useCallback(() => {
        console.log('[GlobalChat] Clearing incoming call');

        // ✅ Clear timeout
        if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
        }

        setIncomingCall(null);
        // ✅ Note: We keep the call in processed set to prevent re-showing
    }, []);

    // ✅ Clear processed call (allows same user to call again)
    const clearProcessedCall = useCallback((callerId: string, conversationId: string) => {
        const callId = `${callerId}-${conversationId}`;
        console.log('[GlobalChat] Clearing processed call from set:', callId);
        processedCallsRef.current.delete(callId);
    }, []);

    // Helper function to check if user is online (case-insensitive)
    const isUserOnline = useCallback(
        (userId: string) => {
            if (!userId) return false;
            const normalizedId = userId.toUpperCase();
            return onlineUsers.has(normalizedId);
        },
        [onlineUsers]
    );

    const value: GlobalChatContextValue = {
        isConnected: chatHub.isConnected,
        connection: chatHub.connection,
        onlineUsers,
        isUserOnline,
        incomingCall,
        acceptIncomingCall,
        declineIncomingCall,
        clearIncomingCall,
        clearProcessedCall, // ✅ Add new function
    };

    return (
        <GlobalChatContext.Provider value={value}>
            {children}
            {/* Global Incoming Call Notification */}
            {incomingCall && (
                <IncomingCallNotification
                    callerName={incomingCall.callerName || 'Unknown'}
                    callerAvatar={incomingCall.callerAvatar}
                    onAccept={acceptIncomingCall}
                    onDecline={declineIncomingCall}
                />
            )}
        </GlobalChatContext.Provider>
    );
};

/**
 * Hook to access global chat context
 */
export const useGlobalChat = (): GlobalChatContextValue => {
    const context = useContext(GlobalChatContext);
    if (!context) {
        throw new Error('useGlobalChat must be used within GlobalChatProvider');
    }
    return context;
};
