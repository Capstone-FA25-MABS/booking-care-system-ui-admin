import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationService } from '@/services/notification.service';
import { Notification, NotificationState } from '@/types/notification.types';
import { NotificationType } from '@/enums/notification.enums';

const initialState: NotificationState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
    isConnected: false,
    pageNumber: 1,
    hasMore: true,
    countsByType: {},
};

/**
 * Fetch notifications
 */
export const fetchNotifications = createAsyncThunk(
    'notification/fetchNotifications',
    async (
        {
            pageNumber,
            pageSize,
            isRead,
            notificationType,
        }: {
            pageNumber?: number;
            pageSize?: number;
            isRead?: boolean;
            notificationType?: NotificationType;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await NotificationService.getNotifications(
                pageNumber,
                pageSize,
                isRead,
                notificationType
            );
            return { notifications: response.data, pageNumber: pageNumber || 1 };
        } catch {
            return rejectWithValue('Failed to fetch notifications');
        }
    }
);

/**
 * Fetch notification summary
 */
export const fetchNotificationSummary = createAsyncThunk(
    'notification/fetchSummary',
    async (_, { rejectWithValue }) => {
        try {
            const response = await NotificationService.getSummary();
            return response.data;
        } catch {
            return rejectWithValue('Failed to fetch notification summary');
        }
    }
);

/**
 * Mark notification as read
 */
export const markNotificationAsRead = createAsyncThunk(
    'notification/markAsRead',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            await NotificationService.markAsRead(notificationId);
            return notificationId;
        } catch {
            return rejectWithValue('Failed to mark notification as read');
        }
    }
);

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = createAsyncThunk(
    'notification/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await NotificationService.markAllAsRead();
            return true;
        } catch {
            return rejectWithValue('Failed to mark all notifications as read');
        }
    }
);

/**
 * Delete notification
 */
export const deleteNotification = createAsyncThunk(
    'notification/delete',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            await NotificationService.deleteNotification(notificationId);
            return notificationId;
        } catch {
            return rejectWithValue('Failed to delete notification');
        }
    }
);

/**
 * Delete all notifications
 */
export const deleteAllNotifications = createAsyncThunk(
    'notification/deleteAll',
    async (_, { rejectWithValue }) => {
        try {
            await NotificationService.deleteAllNotifications();
            return true;
        } catch {
            return rejectWithValue('Failed to delete all notifications');
        }
    }
);

/**
 * Fetch notification counts by type
 */
export const fetchNotificationCountsByType = createAsyncThunk(
    'notification/fetchCountsByType',
    async (isRead: boolean | undefined, { rejectWithValue }) => {
        try {
            const response = await NotificationService.getCountsByType(isRead);
            return response.data;
        } catch {
            return rejectWithValue('Failed to fetch notification counts by type');
        }
    }
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Notification>) => {
            // ✅ Check for duplicate before adding
            const existingNotification = state.notifications.find(
                (n) => n.id === action.payload.id
            );
            if (existingNotification) {
                return; // Skip adding duplicate
            }

            // Add new notification to the beginning
            state.notifications.unshift(action.payload);
            if (!action.payload.isRead) {
                state.unreadCount += 1;
            }
        },
        updateNotification: (state, action: PayloadAction<{ id: string; isRead: boolean }>) => {
            const notification = state.notifications.find((n) => n.id === action.payload.id);
            if (notification && !notification.isRead && action.payload.isRead) {
                notification.isRead = true;
                notification.readAt = new Date().toISOString();
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        setUnreadCount: (state, action: PayloadAction<number>) => {
            state.unreadCount = action.payload;
        },
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        clearNotifications: (state) => {
            state.notifications = [];
            state.pageNumber = 1;
            state.hasMore = true;
        },
    },
    extraReducers: (builder) => {
        // Fetch notifications
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.pageNumber === 1) {
                    state.notifications = action.payload.notifications;
                } else {
                    state.notifications.push(...action.payload.notifications);
                }
                state.pageNumber = action.payload.pageNumber;
                state.hasMore = action.payload.notifications.length > 0;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch summary
        builder
            .addCase(fetchNotificationSummary.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchNotificationSummary.fulfilled, (state, action) => {
                state.unreadCount = action.payload.unreadCount;
            })
            .addCase(fetchNotificationSummary.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Mark as read
        builder
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find((n) => n.id === action.payload);
                if (notification && !notification.isRead) {
                    notification.isRead = true;
                    notification.readAt = new Date().toISOString();
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markNotificationAsRead.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Mark all as read
        builder
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                for (const notification of state.notifications) {
                    if (!notification.isRead) {
                        notification.isRead = true;
                        notification.readAt = new Date().toISOString();
                    }
                }
                state.unreadCount = 0;
            })
            .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Delete notification
        builder
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const index = state.notifications.findIndex((n) => n.id === action.payload);
                if (index !== -1) {
                    const notification = state.notifications[index];
                    if (!notification.isRead) {
                        state.unreadCount = Math.max(0, state.unreadCount - 1);
                    }
                    state.notifications.splice(index, 1);
                }
            })
            .addCase(deleteNotification.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Delete all notifications
        builder
            .addCase(deleteAllNotifications.fulfilled, (state) => {
                state.notifications = [];
                state.unreadCount = 0;
                state.pageNumber = 1;
                state.hasMore = false;
            })
            .addCase(deleteAllNotifications.rejected, (state, action) => {
                state.error = action.payload as string;
            });

        // Fetch counts by type
        builder
            .addCase(fetchNotificationCountsByType.fulfilled, (state, action) => {
                state.countsByType = action.payload;
            })
            .addCase(fetchNotificationCountsByType.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const {
    addNotification,
    updateNotification,
    setUnreadCount,
    setConnectionStatus,
    clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
