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
            setIncomingCall(data);
        }, []),
    };

    // Use shared ChatHub connection
    const chatHub = useSharedChatHub(hubCallbacks);

    // Handle accepting incoming call
    const acceptIncomingCall = useCallback(() => {
        if (!incomingCall) return;
        console.log('[GlobalChat] ✅ Accepting call, navigating to messages...');
        const callData = { ...incomingCall }; // Copy call data before clearing
        setIncomingCall(null); // Clear immediately to prevent duplicate notifications
        // Navigate to messages page - the Messages component will handle the call
        navigate('/hospitals/messages', { state: { incomingCall: callData } });
    }, [incomingCall, navigate]);

    // Handle declining incoming call
    const declineIncomingCall = useCallback(async () => {
        if (!incomingCall) return;
        console.log('[GlobalChat] ❌ Declining call from:', incomingCall.callerId);

        try {
            await chatHub.declineCall(incomingCall.callerId, 'User declined');
            setIncomingCall(null);
        } catch (error) {
            console.error('[GlobalChat] Error declining call:', error);
            setIncomingCall(null);
        }
    }, [incomingCall, chatHub]);

    // Clear incoming call (used by Messages when it takes over the call)
    const clearIncomingCall = useCallback(() => {
        console.log('[GlobalChat] Clearing incoming call');
        setIncomingCall(null);
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
