import React, { createContext, useContext, useRef, useEffect, useState, useMemo } from 'react';
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

    const chatServiceUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const chatHubUrl = `${chatServiceUrl}/chatHub`;

    // Create and manage SignalR connection
    useEffect(() => {
        let isMounted = true;
        let currentConnection: signalR.HubConnection | null = null;

        // Only connect if we have a userId
        if (!userId || !accessToken) {
            console.log('[ChatHubContext] ⏳ Waiting for user authentication...');
            return;
        }

        // Build URL with userId query param (same pattern as Patient app)
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
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        currentConnection = connection;

        // Connection lifecycle handlers
        connection.onreconnecting(() => {
            console.log('[ChatHubContext] 🔄 Reconnecting...');
            if (isMounted) {
                setIsConnected(false);
            }
        });

        connection.onreconnected(() => {
            console.log('[ChatHubContext] ✅ Reconnected successfully');
            if (isMounted) {
                setIsConnected(true);
            }
        });

        connection.onclose((error) => {
            if (isMounted) {
                console.log('[ChatHubContext] ❌ Connection closed', error);
                setIsConnected(false);
            }
        });

        // Start connection
        const startConnection = async () => {
            if (!isMounted) return;

            try {
                await connection.start();
                if (isMounted) {
                    console.log('[ChatHubContext] ✅ Connected successfully with userId:', userId);
                    setIsConnected(true);
                    connectionRef.current = connection;
                }
            } catch (error) {
                if (isMounted) {
                    console.error('[ChatHubContext] ❌ Connection failed:', error);
                    setIsConnected(false);
                    // Retry after 5 seconds only if still mounted
                    setTimeout(() => {
                        if (isMounted) {
                            startConnection();
                        }
                    }, 5000);
                }
            }
        };

        startConnection();

        // Cleanup on unmount or userId change
        return () => {
            isMounted = false;
            console.log('[ChatHubContext] 🔌 Disconnecting...');
            if (currentConnection) {
                // Only stop if connection is in a stable state
                const state = currentConnection.state;
                if (
                    state === signalR.HubConnectionState.Connected ||
                    state === signalR.HubConnectionState.Disconnected
                ) {
                    currentConnection.stop().catch(() => {
                        // Silently ignore stop errors during unmount
                    });
                }
            }
            connectionRef.current = null;
        };
    }, [userId, accessToken, chatHubUrl]);

    const value: ChatHubContextValue = useMemo(
        () => ({
            connection: connectionRef.current,
            isConnected,
        }),
        [isConnected]
    );

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
