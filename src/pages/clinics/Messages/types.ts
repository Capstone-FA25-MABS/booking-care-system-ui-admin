export interface User {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unreadCount: number;
    isActive: boolean;
    isRead: boolean;
}

export interface Message {
    id: number;
    sender: string;
    content: string;
    time: string;
    avatar: string;
    isOwn: boolean;
}
