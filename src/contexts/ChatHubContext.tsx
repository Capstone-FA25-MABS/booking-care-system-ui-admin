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
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const isCleaningUpRef = useRef(false);
    const connectionStartTimeRef = useRef<number | null>(null);
    const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const chatHubUrl = 'http://localhost:6005/chatHub';

    // Create and manage SignalR connection
    useEffect(() => {
        // Only connect if we have a userId
        if (!userId) {
            console.log('[ChatHubContext] ⏳ Waiting for user authentication...');
            setConnection(null);
            connectionRef.current = null;
            setIsConnected(false);
            return;
        }

        // Prevent multiple connections
        if (connectionRef.current) {
            console.log('[ChatHubContext] ⚠️ Connection already exists, skipping...');
            return;
        }

        isCleaningUpRef.current = false;
        connectionStartTimeRef.current = Date.now();

        // Build URL with userId query string (fallback if JWT claims don't work)
        const hubUrlWithUserId = `${chatHubUrl}?userId=${encodeURIComponent(userId)}`;

        // Create SignalR connection
        const newConnection = new signalR.HubConnectionBuilder()
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

        // Store connection reference immediately
        const currentConnectionForCleanup = newConnection; // Store reference for cleanup check
        connectionRef.current = newConnection;
        setConnection(newConnection);

        // Connection lifecycle handlers
        newConnection.onreconnecting(() => {
            if (isCleaningUpRef.current) return;
            console.log('[ChatHubContext] 🔄 Reconnecting...');
            setIsConnected(false);
        });

        newConnection.onreconnected(() => {
            if (isCleaningUpRef.current) return;
            console.log('[ChatHubContext] ✅ Reconnected successfully');
            setIsConnected(true);
        });

        newConnection.onclose((error) => {
            if (isCleaningUpRef.current) return;
            console.log('[ChatHubContext] ❌ Connection closed', error);
            setIsConnected(false);
        });

        // Start connection
        const startConnection = async () => {
            if (isCleaningUpRef.current) {
                console.log('[ChatHubContext] ⚠️ Cleanup in progress, skipping connection start');
                return;
            }

            try {
                // Check if connection still exists and is not being cleaned up
                if (!connectionRef.current || isCleaningUpRef.current) {
                    return;
                }

                await connectionRef.current.start();
                console.log('[ChatHubContext] ✅ Connected successfully with userId:', userId);
                setIsConnected(true);
                connectionStartTimeRef.current = Date.now();
            } catch (error) {
                if (isCleaningUpRef.current) {
                    return;
                }
                console.error('[ChatHubContext] ❌ Connection failed:', error);
                setIsConnected(false);
                // Only retry if not cleaning up
                if (!isCleaningUpRef.current && connectionRef.current) {
                    setTimeout(startConnection, 5000);
                }
            }
        };

        startConnection();

        // Cleanup on unmount or userId change
        return () => {
            // Set cleanup flag immediately
            isCleaningUpRef.current = true;

            // Clear any pending cleanup timeout
            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current);
                cleanupTimeoutRef.current = null;
            }

            // Check if connection was just started (React Strict Mode double mount)
            const timeSinceStart = connectionStartTimeRef.current
                ? Date.now() - connectionStartTimeRef.current
                : Infinity;

            // If connection was just started (< 500ms), delay cleanup to avoid race condition
            // This gives React Strict Mode time to complete its double mount cycle
            if (timeSinceStart < 500) {
                console.log(
                    `[ChatHubContext] ⚠️ Connection just started (${timeSinceStart}ms ago), delaying cleanup to avoid race condition`
                );
                cleanupTimeoutRef.current = setTimeout(() => {
                    // Double-check if we still need to cleanup (component might have remounted)
                    performCleanup();
                }, 1000);
            } else {
                performCleanup();
            }

            function performCleanup() {
                // Check if component has remounted (connection might have been recreated)
                if (
                    !connectionRef.current ||
                    connectionRef.current !== currentConnectionForCleanup
                ) {
                    console.log('[ChatHubContext] ⚠️ Connection was recreated, skipping cleanup');
                    isCleaningUpRef.current = false; // Reset flag if component remounted
                    return;
                }

                console.log('[ChatHubContext] 🔌 Disconnecting...');

                const currentConnection = connectionRef.current;
                if (currentConnection) {
                    // Check connection state before stopping
                    const state = currentConnection.state;
                    if (
                        state === signalR.HubConnectionState.Connected ||
                        state === signalR.HubConnectionState.Connecting ||
                        state === signalR.HubConnectionState.Reconnecting
                    ) {
                        currentConnection
                            .stop()
                            .then(() => {
                                console.log('[ChatHubContext] ✅ Connection stopped successfully');
                            })
                            .catch((error) => {
                                console.warn(
                                    '[ChatHubContext] ⚠️ Error stopping connection:',
                                    error
                                );
                            })
                            .finally(() => {
                                // Only clear if we're still cleaning up (component might have remounted)
                                if (isCleaningUpRef.current) {
                                    connectionRef.current = null;
                                    setConnection(null);
                                    setIsConnected(false);
                                    connectionStartTimeRef.current = null;
                                }
                            });
                    } else {
                        if (isCleaningUpRef.current) {
                            connectionRef.current = null;
                            setConnection(null);
                            setIsConnected(false);
                            connectionStartTimeRef.current = null;
                        }
                    }
                } else {
                    if (isCleaningUpRef.current) {
                        connectionRef.current = null;
                        setConnection(null);
                        setIsConnected(false);
                        connectionStartTimeRef.current = null;
                    }
                }
            }
        };
    }, [userId, accessToken]);

    const value: ChatHubContextValue = useMemo(
        () => ({
            connection,
            isConnected,
        }),
        [connection, isConnected]
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
