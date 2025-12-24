import axiosInstance, { ApiResponse } from '@/configs/axios.config';
import {
    Notification,
    NotificationSummary,
    NotificationCountsByType,
} from '@/types/notification.types';
import { NotificationType } from '@/enums/notification.enums';

// Base API endpoints for notifications
const NOTIFICATION_ENDPOINTS = {
    BASE: '/notifications',
    SUMMARY: '/notifications/summary',
    COUNTS_BY_TYPE: '/notifications/counts-by-type',
    READ_ALL: '/notifications/read-all',
    DELETE_ALL: '/notifications/delete-all',
    READ: (notificationId: string) => `/notifications/${notificationId}/read`,
    DELETE: (notificationId: string) => `/notifications/${notificationId}`,
} as const;

/**
 * Notification Service
 * Handles all notification-related API operations for admin panel
 */
export class NotificationService {
    /**
     * Get user notifications with pagination and optional filters
     * @param pageNumber - Page number (default: 1)
     * @param pageSize - Page size (default: 20)
     * @param isRead - Filter by read status (optional)
     * @param notificationType - Filter by notification type (optional)
     * @returns Promise with ApiResponse containing notifications array
     */
    static async getNotifications(
        pageNumber = 1,
        pageSize = 20,
        isRead?: boolean,
        notificationType?: NotificationType
    ): Promise<ApiResponse<Notification[]>> {
        try {
            const params = new URLSearchParams({
                pageNumber: pageNumber.toString(),
                pageSize: pageSize.toString(),
            });

            if (isRead !== undefined) {
                params.append('isRead', isRead.toString());
            }

            if (notificationType !== undefined) {
                params.append('notificationType', notificationType.toString());
            }

            const response: any = await axiosInstance.get(
                `${NOTIFICATION_ENDPOINTS.BASE}?${params.toString()}`
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Notifications retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch notifications');
        }
    }

    /**
     * Get notification summary (total and unread count)
     * @returns Promise with ApiResponse containing notification summary
     */
    static async getSummary(): Promise<ApiResponse<NotificationSummary>> {
        try {
            const response: any = await axiosInstance.get(NOTIFICATION_ENDPOINTS.SUMMARY);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Summary retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch notification summary');
        }
    }

    /**
     * Mark a specific notification as read
     * @param notificationId - ID of the notification to mark as read
     * @returns Promise with ApiResponse containing boolean result
     */
    static async markAsRead(notificationId: string): Promise<ApiResponse<boolean>> {
        try {
            const response: any = await axiosInstance.put(
                NOTIFICATION_ENDPOINTS.READ(notificationId)
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Notification marked as read',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to mark notification as read');
        }
    }

    /**
     * Mark all notifications as read for current user
     * @returns Promise with ApiResponse containing count of marked notifications
     */
    static async markAllAsRead(): Promise<ApiResponse<number>> {
        try {
            const response: any = await axiosInstance.put(NOTIFICATION_ENDPOINTS.READ_ALL);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'All notifications marked as read',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to mark all notifications as read');
        }
    }

    /**
     * Delete a specific notification
     * @param notificationId - ID of the notification to delete
     * @returns Promise with ApiResponse containing boolean result
     */
    static async deleteNotification(notificationId: string): Promise<ApiResponse<boolean>> {
        try {
            const response: any = await axiosInstance.delete(
                NOTIFICATION_ENDPOINTS.DELETE(notificationId)
            );

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Notification deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete notification');
        }
    }

    /**
     * Delete all notifications for current user
     * @returns Promise with ApiResponse containing count of deleted notifications
     */
    static async deleteAllNotifications(): Promise<ApiResponse<number>> {
        try {
            const response: any = await axiosInstance.delete(NOTIFICATION_ENDPOINTS.DELETE_ALL);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'All notifications deleted successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to delete all notifications');
        }
    }

    /**
     * Get notification counts by type
     * @param isRead - Optional filter for read/unread notifications
     * @returns Promise with ApiResponse containing counts by type
     */
    static async getCountsByType(isRead?: boolean): Promise<ApiResponse<NotificationCountsByType>> {
        try {
            const params = new URLSearchParams();
            if (isRead !== undefined) {
                params.append('isRead', String(isRead));
            }

            const queryString = params.toString();
            const url = queryString
                ? `${NOTIFICATION_ENDPOINTS.COUNTS_BY_TYPE}?${queryString}`
                : NOTIFICATION_ENDPOINTS.COUNTS_BY_TYPE;
            const response: any = await axiosInstance.get(url);

            return {
                success: response.success ?? true,
                data: response.data || response,
                message: response.message || 'Counts retrieved successfully',
            };
        } catch (error: any) {
            throw new Error(error.message || 'Failed to fetch notification counts');
        }
    }
}

// Export individual methods for convenience
export const {
    getNotifications,
    getSummary,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    getCountsByType,
} = NotificationService;

// Default export
export default NotificationService;
