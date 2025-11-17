import * as signalR from '@microsoft/signalr';
import { AppDispatch } from '@/store';
import {
    addNotification,
    updateNotification,
    setUnreadCount,
    setConnectionStatus,
} from '@/store/slices/notificationSlice';
import { Notification } from '@/types/notification.types';

class SignalRService {
    private connection: signalR.HubConnection | null = null;
    private dispatch: AppDispatch | null = null;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;
    private readonly reconnectDelay = 5000;

    /**
     * Initialize SignalR connection
     */
    async initialize(dispatch: AppDispatch, accessToken: string): Promise<void> {
        this.dispatch = dispatch;

        const notificationServiceUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const hubUrl = `${notificationServiceUrl}/noti-hubs/notification-hub`;

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => accessToken,
                // Let SignalR negotiate transport automatically
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff
                    if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
                        return null; // Stop reconnecting
                    }
                    return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                },
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Set up event handlers
        this.setupEventHandlers();

        // Start connection
        await this.start();
    }

    /**
     * Setup SignalR event handlers
     */
    private setupEventHandlers(): void {
        if (!this.connection || !this.dispatch) return;

        // ✅ Remove existing event handlers to prevent duplicates
        this.connection.off('ReceiveNotification');
        this.connection.off('NotificationUpdated');
        this.connection.off('UnreadCountUpdated');

        // Capture dispatch in a local variable to avoid null checks in callbacks
        const dispatch = this.dispatch;

        // Handle new notification
        this.connection.on('ReceiveNotification', (notification: Notification) => {
            console.log('[SignalR] Received notification:', notification);
            dispatch(addNotification(notification));
        });

        // Handle notification update (e.g., marked as read)
        this.connection.on(
            'NotificationUpdated',
            (data: { notificationId: string; isRead: boolean }) => {
                console.log('[SignalR] Notification updated:', data);
                dispatch(
                    updateNotification({
                        id: data.notificationId,
                        isRead: data.isRead,
                    })
                );
            }
        );

        // Handle unread count update
        this.connection.on('UnreadCountUpdated', (data: { unreadCount: number }) => {
            console.log('[SignalR] Unread count updated:', data.unreadCount);
            dispatch(setUnreadCount(data.unreadCount));
        });

        // Connection lifecycle events
        this.connection.onreconnecting(() => {
            console.log('[SignalR] Reconnecting...');
            if (this.dispatch) {
                this.dispatch(setConnectionStatus(false));
            }
        });

        this.connection.onreconnected(() => {
            console.log('[SignalR] Reconnected successfully');
            this.reconnectAttempts = 0;
            if (this.dispatch) {
                this.dispatch(setConnectionStatus(true));
            }
        });

        this.connection.onclose(async (error) => {
            console.error('[SignalR] Connection closed', error);
            if (this.dispatch) {
                this.dispatch(setConnectionStatus(false));
            }

            // Try to reconnect manually if automatic reconnect fails
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(
                    `[SignalR] Attempting manual reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
                );
                setTimeout(() => this.start(), this.reconnectDelay);
            }
        });
    }

    /**
     * Start SignalR connection
     */
    private async start(): Promise<void> {
        if (!this.connection) return;

        try {
            await this.connection.start();
            console.log('[SignalR] Connected successfully');
            if (this.dispatch) {
                this.dispatch(setConnectionStatus(true));
            }
            this.reconnectAttempts = 0;
        } catch (error) {
            console.error('[SignalR] Failed to connect', error);
            if (this.dispatch) {
                this.dispatch(setConnectionStatus(false));
            }

            // Retry connection
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => this.start(), this.reconnectDelay);
            }
        }
    }

    /**
     * Stop SignalR connection
     */
    async stop(): Promise<void> {
        if (this.connection) {
            try {
                // Only stop if connection is in a stable state (not negotiating)
                const state = this.connection.state;
                if (
                    state === signalR.HubConnectionState.Connected ||
                    state === signalR.HubConnectionState.Disconnected
                ) {
                    await this.connection.stop();
                    console.log('[SignalR] Disconnected');
                } else {
                    console.log('[SignalR] Connection not in stable state, skipping stop');
                }

                if (this.dispatch) {
                    this.dispatch(setConnectionStatus(false));
                }
            } catch (error) {
                console.error('[SignalR] Error stopping connection', error);
            }
        }
        this.connection = null;
        this.dispatch = null;
        this.reconnectAttempts = 0;
    }

    /**
     * Get connection status
     */
    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    /**
     * Invoke hub method (optional, for client-to-server calls)
     */
    async invoke(methodName: string, ...args: unknown[]): Promise<unknown> {
        if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
            throw new Error('SignalR connection is not active');
        }
        return await this.connection.invoke(methodName, ...args);
    }
}

// Singleton instance
export const signalRService = new SignalRService();
