// Mock data for Messages component
import user01 from '@/assets/img/users/user-01.jpg';
import user02 from '@/assets/img/users/user-02.jpg';
import user03 from '@/assets/img/users/user-03.jpg';
import user04 from '@/assets/img/users/user-04.jpg';
import user05 from '@/assets/img/users/user-05.jpg';
import user06 from '@/assets/img/users/user-06.jpg';
import user07 from '@/assets/img/users/user-07.jpg';
import user08 from '@/assets/img/users/user-08.jpg';
import user09 from '@/assets/img/users/user-09.jpg';
import user10 from '@/assets/img/users/user-10.jpg';
import user11 from '@/assets/img/users/user-11.jpg';

export interface User {
    id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    isRead: boolean;
    isActive: boolean;
    unreadCount: number;
}

export interface Message {
    id: number;
    sender: string;
    avatar: string;
    content: string;
    time: string;
    isOwn: boolean;
}

export const mockUsers: User[] = [
    {
        id: 1,
        name: 'Mark Smith',
        avatar: user01,
        lastMessage: 'Hey Sam! Did you Ch...',
        time: '10:10 AM',
        isRead: true,
        isActive: true,
        unreadCount: 0,
    },
    {
        id: 2,
        name: 'Eugene Sikora',
        avatar: user02,
        lastMessage: 'How are your Today',
        time: '08:26 AM',
        isRead: false,
        isActive: false,
        unreadCount: 5,
    },
    {
        id: 3,
        name: 'Robert Fassett',
        avatar: user03,
        lastMessage: 'Here are some of ve...',
        time: 'yesterday',
        isRead: false,
        isActive: false,
        unreadCount: 5,
    },
    {
        id: 4,
        name: 'Andrew Fletcher',
        avatar: user04,
        lastMessage: 'Use tools like Trello...',
        time: 'yesterday',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
    {
        id: 5,
        name: 'Tyron Derby',
        avatar: user05,
        lastMessage: "Let's reconvene next...",
        time: '12:55 PM',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
    {
        id: 6,
        name: 'Anna Johnson',
        avatar: user06,
        lastMessage: 'How are your Today',
        time: '12:54 PM',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
    {
        id: 7,
        name: 'Emily Davis',
        avatar: user07,
        lastMessage: 'Sure, I can help with...',
        time: '11:47 PM',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
    {
        id: 8,
        name: 'Susan Denton',
        avatar: user08,
        lastMessage: "I'll share the meeting...",
        time: '10:43 PM',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
    {
        id: 9,
        name: 'David Cruz',
        avatar: user09,
        lastMessage: 'Let me know if you...',
        time: '10:43 PM',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
];

export const mockMessages: Message[] = [
    {
        id: 1,
        sender: 'Mark Smith',
        avatar: user10,
        content: 'Hey mark! Did you check out the new logo design?',
        time: '02:39 PM',
        isOwn: false,
    },
    {
        id: 2,
        sender: 'You',
        avatar: user11,
        content: 'Not yet. Can you send it here?',
        time: '02:39 PM',
        isOwn: true,
    },
    {
        id: 3,
        sender: 'Mark Smith',
        avatar: user01,
        content: 'Sure! Please check the below logo Attached!!!',
        time: '02:39 PM',
        isOwn: false,
    },
    {
        id: 4,
        sender: 'You',
        avatar: user11,
        content: 'Looks clean! I like the font. Maybe try a slightly darker blue?',
        time: '10:00 AM',
        isOwn: true,
    },
    {
        id: 5,
        sender: 'Mark Smith',
        avatar: user10,
        content: 'Perfect! That layout will work great on the landing page. 👍',
        time: '10:05 AM',
        isOwn: false,
    },
    {
        id: 6,
        sender: 'You',
        avatar: user11,
        content: 'Perfect It looks Great!!!',
        time: '10:00 AM',
        isOwn: true,
    },
];
