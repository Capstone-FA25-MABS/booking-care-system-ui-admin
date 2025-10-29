import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { useAppDispatch } from '@/store/hooks';
import { logoutAsync } from '@/store/slices/authSlice';
import { clearAllUserProfiles } from '@/store/slices/userSlice';

interface AccountNotification {
    accountId: string;
    eventType: string;
    timestamp: string;
    message: string;
}

/**
 * Custom hook to handle real-time account notifications via SignalR
 * Automatically logout user when account is banned/locked
 */
export const useAccountNotification = (accessToken: string | null) => {
    const dispatch = useAppDispatch();
    const connectionRef = useRef<signalR.HubConnection | null>(null);

    useEffect(() => {
        // Only connect if user is authenticated
        if (!accessToken) {
            return;
        }

        // Create SignalR connection - connect directly to Auth service (bypass Ocelot for WebSocket)
        const authServiceUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const hubUrl = `${authServiceUrl}/hubs/account-notification`;

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => accessToken,
                transport:
                    signalR.HttpTransportType.WebSockets |
                    signalR.HttpTransportType.ServerSentEvents,
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
            .configureLogging(signalR.LogLevel.Error)
            .build();

        // Handle account status changed event
        connection.on('AccountStatusChanged', (notification: AccountNotification) => {
            const { eventType, message } = notification;

            // Show notification to user
            if (eventType === 'account_deactivated' || eventType === 'account_locked') {
                toast.error(message || 'Your account has been disabled.');

                // Force logout after a short delay
                setTimeout(async () => {
                    await dispatch(logoutAsync()).unwrap();
                    dispatch(clearAllUserProfiles()); // Clear user profile from state
                    window.location.href = '/login';
                }, 2000);
            } else if (eventType === 'account_activated' || eventType === 'account_unlocked') {
                toast.success(message || 'Your account has been reactivated.');
            }
        });

        // Handle connection lifecycle
        connection.onreconnecting(() => {
            // Reconnecting to server
        });

        connection.onreconnected(() => {
            // Reconnected successfully
        });

        connection.onclose(() => {
            // Connection closed
        });

        // Start connection
        const startConnection = async () => {
            try {
                await connection.start();
            } catch (error) {
                console.error('[SignalR] Connection failed:', error);
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
            }
        };
    }, [accessToken, dispatch]);

    return connectionRef.current;
};
