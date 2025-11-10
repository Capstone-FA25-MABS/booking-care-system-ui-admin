import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { useChat } from '@/providers/ChatProvider';
import { RootState } from '@/store';
import { MessageType } from '@/types/communication.types';
import styles from '../../Messages.module.scss';
import UserListItem from './UserListItem';

const ChatUserNav: React.FC = () => {
    const { conversations, selectConversation, activeConversation, onlineUsers, isLoading } =
        useChat();
    const [searchKeyword, setSearchKeyword] = useState('');

    // Get current user profile
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const currentUserId = (userProfile?.accountId || '').toUpperCase();

    // Filter and sort conversations based on search
    const filteredConversations = useMemo(() => {
        // Ensure conversations is always an array
        const convs = conversations || [];

        // Filter by search keyword
        const filtered = !searchKeyword
            ? convs
            : convs.filter((conv) => {
                  // Search in participant names or last message
                  const participantName = conv.participantDetails
                      ?.filter((p) => (p.id || p.accountId || '').toUpperCase() !== currentUserId)
                      .map((p) => p.fullName)
                      .join(', ');
                  const lastMessageContent = conv.lastMessage?.content || '';

                  return (
                      participantName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      lastMessageContent.toLowerCase().includes(searchKeyword.toLowerCase())
                  );
              });

        // Sort by most recent message (newest first)
        // Use updatedAt or lastMessage.createdAt as fallback
        return filtered.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
            const timeB = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;

            return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
    }, [conversations, searchKeyword, currentUserId]);

    // Helper to format last message preview
    const formatLastMessagePreview = (conv: any) => {
        if (!conv.lastMessage) return 'Không có tin nhắn';

        const { content, type, attachments } = conv.lastMessage;

        // If has content, show it
        if (content && content.trim()) {
            return content;
        }

        // If no content but has attachments, show appropriate message
        if (attachments?.length > 0) {
            const attachment = attachments[0];
            const fileName = attachment.fileName || attachment.name;

            switch (type) {
                case MessageType.IMAGE:
                    return fileName ? `📷 ${fileName}` : '📷 Đã gửi ảnh';
                case MessageType.VIDEO:
                    return fileName ? `🎥 ${fileName}` : '🎥 Đã gửi video';
                case MessageType.AUDIO:
                    return fileName ? `🎵 ${fileName}` : '🎵 Đã gửi audio';
                case MessageType.FILE:
                    return fileName ? `📎 ${fileName}` : '📎 Đã gửi file';
                case MessageType.VOICE_NOTE:
                    return '🎤 Tin nhắn thoại';
                default:
                    return fileName ? `📎 ${fileName}` : '📎 Đã gửi file';
            }
        }

        return 'Không có tin nhắn';
    };

    // Helper to format time
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className={clsx(styles.chatUserNav, 'chat-user-nav')}>
            {/* Current User Info */}
            <div
                className={clsx(
                    styles.userInfo,
                    'd-flex align-items-center justify-content-between p-3'
                )}
            >
                <div className="d-flex align-items-center">
                    <span className="avatar me-2 flex-shrink-0">
                        <img
                            src={
                                adminProfile?.avatarUrl ||
                                doctorProfile?.avatarUrl ||
                                hospitalProfile?.avatarUrl ||
                                '/default-avatar.png'
                            }
                            alt="user"
                        />
                    </span>
                    <div>
                        <h6 className="fs-14 mb-1">
                            {adminProfile
                                ? `${adminProfile.firstName} ${adminProfile.lastName}`
                                : doctorProfile
                                  ? `${doctorProfile.firstName} ${doctorProfile.lastName}`
                                  : hospitalProfile?.name || 'User'}
                        </h6>
                        <p className="mb-0">
                            {adminProfile
                                ? 'Quản trị viên'
                                : doctorProfile
                                  ? 'Bác sĩ'
                                  : 'Nhân viên'}
                        </p>
                    </div>
                </div>
                <button
                    className="btn p-2 btn-primary"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-title="Cuộc trò chuyện mới"
                    type="button"
                >
                    <i className="ti ti-plus"></i>
                </button>
            </div>

            {/* Search Section */}
            <div className={clsx(styles.searchSection, 'p-3')}>
                <div className="input-group w-auto input-group-flat">
                    <span className="input-group-text border-end-0">
                        <i className="ti ti-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                </div>
            </div>

            {/* User List Container */}
            <div className={styles.userListContainer}>
                <div className={clsx(styles.chatUsers, 'p-3')}>
                    <h6>Tất cả tin nhắn</h6>

                    {isLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <p>Chưa có cuộc hội thoại nào</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            // Get other participant info
                            const otherParticipant = conv.participantDetails?.find(
                                (p) => (p.id || p.accountId || '').toUpperCase() !== currentUserId
                            );

                            // Check online status - normalize to UPPERCASE
                            const isOnline = otherParticipant
                                ? onlineUsers.has(
                                      (
                                          otherParticipant.id ||
                                          otherParticipant.accountId ||
                                          ''
                                      ).toUpperCase()
                                  )
                                : false;

                            const isActive = activeConversation?.id === conv.id;

                            // Transform to User type for UserListItem
                            const user = {
                                id: conv.id,
                                name: otherParticipant?.fullName || 'Unknown User',
                                avatar: otherParticipant?.avatarUrl || '/default-avatar.png',
                                lastMessage: formatLastMessagePreview(conv),
                                time: conv.lastMessage
                                    ? formatTime(conv.lastMessage.createdAt)
                                    : '',
                                unreadCount: conv.unreadCount || 0,
                                status: isOnline ? 'online' : 'offline',
                                isActive,
                                isRead: (conv.unreadCount || 0) === 0,
                            };

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => selectConversation(conv.id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <UserListItem user={user} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatUserNav;
