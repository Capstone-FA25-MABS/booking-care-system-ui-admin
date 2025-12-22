import React, {
    createContext,
    useContext,
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import * as signalR from '@microsoft/signalr';
import { RootState } from '@/store';

interface ChatHubContextValue {
    connection: signalR.HubConnection | null;
    isConnected: boolean;
    /** Check if connection is truly ready to send */
    isReady: () => boolean;
}

const ChatHubContext = createContext<ChatHubContextValue | undefined>(undefined);

interface ChatHubProviderProps {
    children: React.ReactNode;
}

/**
 * Helper to safely stop a SignalR connection
 * Handles all edge cases and waits for proper disconnection
 */
const safeStopConnection = async (conn: signalR.HubConnection | null): Promise<void> => {
    if (!conn) return;

    const state = conn.state;
    console.log('[ChatHubContext] 🛑 Stopping connection, current state:', state);

    // If already disconnected, nothing to do
    if (state === signalR.HubConnectionState.Disconnected) {
        console.log('[ChatHubContext] ✅ Connection already disconnected');
        return;
    }

    // If connecting or reconnecting, we need to wait for it to finish first
    if (
        state === signalR.HubConnectionState.Connecting ||
        state === signalR.HubConnectionState.Reconnecting
    ) {
        console.log('[ChatHubContext] ⏳ Waiting for connection to stabilize before stopping...');
        // Wait a bit for connection to stabilize
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    try {
        await conn.stop();
        console.log('[ChatHubContext] ✅ Connection stopped successfully');
    } catch (error) {
        // Silently ignore stop errors - connection might already be disposed
        console.warn('[ChatHubContext] ⚠️ Error stopping connection (may be expected):', error);
    }
};

/**
 * Shared ChatHub Connection Provider for Admin
 * - Creates ONE SignalR connection for the entire app
 * - Connects when user is authenticated
 * - Automatically adds user to their personal group (user_{userId})
 * - Both GlobalChatProvider and ChatProvider use this shared connection
 *
 * LIFECYCLE RULES:
 * - Each login session = new HubConnection
 * - Logout = stop + dispose completely
 * - Never reuse connection between sessions
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
    const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const chatServiceUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const chatHubUrl = `${chatServiceUrl}/chatHub`;

    // Helper to check if connection is truly ready
    const isReady = useCallback(() => {
        const conn = connectionRef.current;
        return conn !== null && conn.state === signalR.HubConnectionState.Connected;
    }, []);

    // Create and manage SignalR connection
    useEffect(() => {
        let isMounted = true;
        let currentConnection: signalR.HubConnection | null = null;

        // Clear any pending retry timeout
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        // ✅ CRITICAL: If no userId or accessToken, cleanup existing connection
        if (!userId || !accessToken) {
            console.log('[ChatHubContext] ⏳ No auth - cleaning up existing connection...');

            // Cleanup existing connection when logging out
            const existingConnection = connectionRef.current;
            if (existingConnection) {
                safeStopConnection(existingConnection).then(() => {
                    if (isMounted) {
                        connectionRef.current = null;
                        setConnection(null);
                        setIsConnected(false);
                    }
                });
            }
            return;
        }

        // Build URL with userId query param (same pattern as Patient app)
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
                    // ✅ Check if still mounted before allowing reconnect
                    if (!isMounted) return null; // Stop reconnecting if unmounted
                    if (retryContext.previousRetryCount === 0) return 0;
                    if (retryContext.previousRetryCount === 1) return 2000;
                    if (retryContext.previousRetryCount === 2) return 10000;
                    if (retryContext.previousRetryCount >= 5) return null; // Stop after 5 attempts
                    return 30000;
                },
            })
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        currentConnection = newConnection;

        // Connection lifecycle handlers
        newConnection.onreconnecting((error) => {
            console.log('[ChatHubContext] 🔄 Reconnecting...', error);
            if (isMounted) {
                setIsConnected(false);
            }
        });

        newConnection.onreconnected((connectionId) => {
            console.log(
                '[ChatHubContext] ✅ Reconnected successfully, connectionId:',
                connectionId
            );
            if (isMounted) {
                setIsConnected(true);
            }
        });

        newConnection.onclose((error) => {
            console.log('[ChatHubContext] ❌ Connection closed', error);
            if (isMounted) {
                setIsConnected(false);
                // ✅ Don't set connection to null here - let cleanup handle it
                // This prevents race conditions with reconnect logic
            }
        });

        // Start connection with state check
        const startConnection = async () => {
            if (!isMounted) {
                console.log('[ChatHubContext] ⏹️ Not starting - component unmounted');
                return;
            }

            // ✅ CRITICAL: Check connection state before starting
            const state = newConnection.state;
            if (state !== signalR.HubConnectionState.Disconnected) {
                console.warn(
                    '[ChatHubContext] ⚠️ Cannot start - connection not in Disconnected state:',
                    state
                );
                return;
            }

            try {
                console.log('[ChatHubContext] 🚀 Starting connection for userId:', userId);
                await newConnection.start();

                if (isMounted) {
                    console.log('[ChatHubContext] ✅ Connected successfully with userId:', userId);
                    connectionRef.current = newConnection;
                    setConnection(newConnection);
                    setIsConnected(true);
                }
            } catch (error) {
                console.error('[ChatHubContext] ❌ Connection failed:', error);

                if (isMounted) {
                    setIsConnected(false);
                    setConnection(null);

                    // ✅ Retry with state check
                    retryTimeoutRef.current = setTimeout(() => {
                        if (
                            isMounted &&
                            newConnection.state === signalR.HubConnectionState.Disconnected
                        ) {
                            console.log('[ChatHubContext] 🔄 Retrying connection...');
                            startConnection();
                        }
                    }, 5000);
                }
            }
        };

        startConnection();

        // ✅ CRITICAL: Proper cleanup on unmount or userId/token change
        return () => {
            isMounted = false;
            console.log('[ChatHubContext] 🔌 Cleanup triggered - stopping connection...');

            // Clear retry timeout
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
                retryTimeoutRef.current = null;
            }

            // ✅ Properly stop and dispose connection
            if (currentConnection) {
                safeStopConnection(currentConnection).finally(() => {
                    // Clear refs after stop completes
                    if (connectionRef.current === currentConnection) {
                        connectionRef.current = null;
                    }
                });
            }

            setConnection(null);
            setIsConnected(false);
        };
    }, [userId, accessToken, chatHubUrl]);

    // ✅ Memoize value - connection and isConnected are state so they trigger re-render correctly
    const value: ChatHubContextValue = useMemo(
        () => ({
            connection,
            isConnected,
            isReady,
        }),
        [connection, isConnected, isReady]
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
