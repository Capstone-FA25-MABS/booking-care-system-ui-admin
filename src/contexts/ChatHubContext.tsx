import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import * as signalR from '@microsoft/signalr';
import { RootState } from '@/store';

interface ChatHubContextValue {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
}

const ChatHubContext = createContext<ChatHubContextValue | undefined>(undefined);

interface ChatHubProviderProps {
    children: React.ReactNode;
}

/**
 * Shared ChatHub Connection Provider for Admin
 * - Creates ONE SignalR connection for the entire app
 * - Connects when user is authenticated
 * - Automatically adds user to their personal group (user_{userId})
 * - Both GlobalChatProvider and ChatProvider use this shared connection
 */
export const ChatHubProvider: React.FC<ChatHubProviderProps> = ({ children }) => {
    const { accessToken } = useSelector((state: RootState) => state.auth);

    // Admin side - get profile from any available source
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );

    // Get accountId from any available profile
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const userId = userProfile?.accountId || '';

    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const chatHubUrl = 'http://localhost:6005/chatHub';

    // Create and manage SignalR connection
    useEffect(() => {
        // Only connect if we have a userId
        if (!userId) {
            console.log('[ChatHubContext] ⏳ Waiting for user authentication...');
            return;
        }

        // Build URL with userId query string (fallback if JWT claims don't work)
        const hubUrlWithUserId = `${chatHubUrl}?userId=${encodeURIComponent(userId)}`;

        // Create SignalR connection
        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrlWithUserId, {
                accessTokenFactory: () => accessToken || '',
                transport:
                    signalR.HttpTransportType.WebSockets |
                    signalR.HttpTransportType.ServerSentEvents,
                skipNegotiation: false,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount === 0) return 0;
                    if (retryContext.previousRetryCount === 1) return 2000;
                    if (retryContext.previousRetryCount === 2) return 10000;
                    return 30000;
                },
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Connection lifecycle handlers
        connection.onreconnecting(() => {
            console.log('[ChatHubContext] 🔄 Reconnecting...');
            setIsConnected(false);
        });

        connection.onreconnected(() => {
            console.log('[ChatHubContext] ✅ Reconnected successfully');
            setIsConnected(true);
        });

        connection.onclose((error) => {
            console.log('[ChatHubContext] ❌ Connection closed', error);
            setIsConnected(false);
        });

        // Start connection
        const startConnection = async () => {
            try {
                await connection.start();
                console.log('[ChatHubContext] ✅ Connected successfully with userId:', userId);
                setIsConnected(true);
            } catch (error) {
                console.error('[ChatHubContext] ❌ Connection failed:', error);
                setIsConnected(false);
                // Retry after 5 seconds
                setTimeout(startConnection, 5000);
            }
        };

        startConnection();

        // Store connection reference
        connectionRef.current = connection;

        // Cleanup on unmount or userId change
        return () => {
            console.log('[ChatHubContext] 🔌 Disconnecting...');
            if (connectionRef.current) {
                connectionRef.current.stop();
                connectionRef.current = null;
            }
            setIsConnected(false);
        };
    }, [userId, accessToken, chatHubUrl]);

    const value: ChatHubContextValue = {
        connection: connectionRef.current,
        isConnected,
    };

    return <ChatHubContext.Provider value={value}>{children}</ChatHubContext.Provider>;
};

/**
 * Hook to access shared ChatHub connection
 */
export const useChatHubConnection = (): ChatHubContextValue => {
    const context = useContext(ChatHubContext);
    if (!context) {
        throw new Error('useChatHubConnection must be used within ChatHubProvider');
    }
    return context;
};
