// Mock data for Messages component
import { User, Message } from './types';
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

export const mockUsers: User[] = [
    {
        id: 1,
        name: 'Nguyễn Văn An',
        avatar: user01,
        lastMessage: 'Chào bạn! Bạn có th...',
        time: '10:10',
        isRead: true,
        isActive: true,
        unreadCount: 0,
    },
    {
        id: 2,
        name: 'Trần Thị Bình',
        avatar: user02,
        lastMessage: 'Hôm nay bạn thế nào?',
        time: '08:26',
        isRead: false,
        isActive: false,
        unreadCount: 5,
    },
    {
        id: 3,
        name: 'Lê Minh Cường',
        avatar: user03,
        lastMessage: 'Đây là một số thông tin...',
        time: 'hôm qua',
        isRead: false,
        isActive: false,
        unreadCount: 5,
    },
    {
        id: 4,
        name: 'Phạm Thùy Dung',
        avatar: user04,
        lastMessage: 'Sử dụng các công cụ như...',
        time: 'hôm qua',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
    {
        id: 5,
        name: 'Hoàng Văn Em',
        avatar: user05,
        lastMessage: 'Hãy gặp lại nhau tuần sau...',
        time: '12:55',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
    {
        id: 6,
        name: 'Vũ Thị Hoa',
        avatar: user06,
        lastMessage: 'Hôm nay bạn thế nào?',
        time: '12:54',
        isRead: true,
        isActive: false,
        unreadCount: 0,
    },
    {
        id: 7,
        name: 'Đặng Minh Giang',
        avatar: user07,
        lastMessage: 'Được rồi, tôi có thể giúp...',
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
        sender: 'Nguyễn Văn An',
        avatar: user10,
        content: 'Chào bạn! Bạn đã xem thiết kế logo mới chưa?',
        time: '14:39',
        isOwn: false,
    },
    {
        id: 2,
        sender: 'Bạn',
        avatar: user11,
        content: 'Chưa đâu. Bạn có thể gửi cho tôi ở đây không?',
        time: '14:39',
        isOwn: true,
    },
    {
        id: 3,
        sender: 'Nguyễn Văn An',
        avatar: user01,
        content: 'Được rồi! Hãy kiểm tra logo đính kèm bên dưới nhé!!!',
        time: '14:39',
        isOwn: false,
    },
    {
        id: 4,
        sender: 'Bạn',
        avatar: user11,
        content: 'Trông gọn gàng! Tôi thích font chữ này. Có thể thử màu xanh đậm hơn một chút?',
        time: '10:00',
        isOwn: true,
    },
    {
        id: 5,
        sender: 'Nguyễn Văn An',
        avatar: user10,
        content: 'Hoàn hảo! Bố cục này sẽ rất phù hợp với trang chủ. 👍',
        time: '10:05',
        isOwn: false,
    },
    {
        id: 6,
        sender: 'Bạn',
        avatar: user11,
        content: 'Tuyệt vời! Trông rất đẹp!!!',
        time: '10:00',
        isOwn: true,
    },
];
