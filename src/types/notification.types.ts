import { NotificationType } from '@/enums/notification.enums';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    titleVi: string;
    titleEn: string;
    contentVi: string;
    contentEn: string;
    metadata?: Record<string, unknown>;
    actionUrl?: string;
    icon?: string;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    priority: string;
}

// Helper function to get localized notification content
export function getLocalizedNotification(
    notification: Notification,
    language: 'vi' | 'en' = 'vi'
): Notification & { title: string; content: string } {
    return {
        ...notification,
        title: language === 'en' ? notification.titleEn : notification.titleVi,
        content: language === 'en' ? notification.contentEn : notification.contentVi,
    };
}

export interface NotificationSummary {
    totalCount: number;
    unreadCount: number;
}

export interface NotificationCountsByType {
    [key: string]: number;
}

export interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
    isConnected: boolean;
    pageNumber: number;
    hasMore: boolean;
    countsByType: NotificationCountsByType;
}
