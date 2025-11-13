import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { useChat } from '@/providers/ChatProvider';
import { RootState } from '@/store';
import { MessageType } from '@/types/communication.types';
import TagManager from '../TagManager';
import ConversationTagBadge from '../ConversationTagBadge';
import TagService from '@/services/tag.service';
import { Tag } from '@/types/tag.types';
import styles from '../../Messages.module.scss';
import UserListItem from './UserListItem';

const ChatUserNav: React.FC = () => {
    const { conversations, selectConversation, activeConversation, onlineUsers, isLoading } =
        useChat();
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [showTagPanel, setShowTagPanel] = useState(false);
    const [conversationTags, setConversationTags] = useState<Map<string, Tag[]>>(new Map());

    // Get current user profile
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const currentUserId = (userProfile?.accountId || '').toUpperCase();

    // Helper to get user display name
    const getUserDisplayName = () => {
        if (adminProfile) return `${adminProfile.firstName} ${adminProfile.lastName}`;
        if (doctorProfile) return `${doctorProfile.firstName} ${doctorProfile.lastName}`;
        return hospitalProfile?.name || 'User';
    };

    // Helper to get user role
    const getUserRole = () => {
        if (adminProfile) return 'Quản trị viên';
        if (doctorProfile) return 'Bác sĩ';
        return 'Nhân viên';
    };

    // Filter and sort conversations based on search and tags
    const filteredConversations = useMemo(() => {
        // Ensure conversations is always an array
        const convs = conversations || [];

        // Filter by search keyword
        let filtered = searchKeyword
            ? convs.filter((conv) => {
                  const participantName = conv.participantDetails
                      ?.filter((p) => (p.id || p.accountId || '').toUpperCase() !== currentUserId)
                      .map((p) => p.fullName)
                      .join(', ');
                  const lastMessageContent = conv.lastMessage?.content || '';

                  return (
                      participantName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      lastMessageContent.toLowerCase().includes(searchKeyword.toLowerCase())
                  );
              })
            : convs;

        // Filter by selected tags
        if (selectedTagIds.length > 0) {
            filtered = filtered.filter((conv) => {
                const convTags = conversationTags.get(conv.id) || [];
                // Check if conversation has at least one of the selected tags
                return convTags.some((tag) => selectedTagIds.includes(tag.id));
            });
        }

        // Sort by most recent message (newest first)
        return filtered.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt || a.updatedAt || a.createdAt;
            const timeB = b.lastMessage?.createdAt || b.updatedAt || b.createdAt;

            return new Date(timeB).getTime() - new Date(timeA).getTime();
        });
    }, [conversations, searchKeyword, currentUserId, selectedTagIds, conversationTags]);

    // Helper to get attachment preview text
    const getAttachmentPreview = (type: string, fileName?: string) => {
        const typeMap: Record<string, { icon: string; text: string }> = {
            [MessageType.IMAGE]: { icon: '📷', text: 'Đã gửi ảnh' },
            [MessageType.VIDEO]: { icon: '🎥', text: 'Đã gửi video' },
            [MessageType.AUDIO]: { icon: '🎵', text: 'Đã gửi audio' },
            [MessageType.FILE]: { icon: '📎', text: 'Đã gửi file' },
            [MessageType.VOICE_NOTE]: { icon: '🎤', text: 'Tin nhắn thoại' },
        };

        const preview = typeMap[type] || { icon: '📎', text: 'Đã gửi file' };
        return fileName ? `${preview.icon} ${fileName}` : `${preview.icon} ${preview.text}`;
    };

    // Helper to format last message preview
    const formatLastMessagePreview = (conv: any) => {
        if (!conv.lastMessage) return 'Không có tin nhắn';

        const { content, type, attachments } = conv.lastMessage;

        // If has content, show it
        if (content?.trim()) {
            return content;
        }

        // If no content but has attachments, show appropriate message
        if (attachments?.length > 0) {
            const attachment = attachments[0];
            const fileName = attachment.fileName || attachment.name;
            return getAttachmentPreview(type, fileName);
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

    // Load tags for all conversations
    const loadConversationTags = async () => {
        if (!currentUserId) return;

        const tagsMap = new Map<string, Tag[]>();

        for (const conv of conversations || []) {
            try {
                const response = await TagService.getConversationTags(currentUserId, conv.id);
                if (response.success && response.data) {
                    tagsMap.set(conv.id, response.data);
                }
            } catch (error) {
                console.error(`Failed to load tags for conversation ${conv.id}:`, error);
            }
        }

        setConversationTags(tagsMap);
    };

    // Load conversation tags when conversations change
    React.useEffect(() => {
        if (conversations && conversations.length > 0) {
            loadConversationTags();
        }
    }, [conversations?.length, currentUserId]);

    // Listen for tag updates from other components
    React.useEffect(() => {
        const handleTagsUpdated = () => {
            loadConversationTags();
        };

        window.addEventListener('conversationTagsUpdated', handleTagsUpdated);
        return () => {
            window.removeEventListener('conversationTagsUpdated', handleTagsUpdated);
        };
    }, [conversations, currentUserId]);

    // Handle tag filter selection
    const handleTagSelect = (tagId: string) => {
        setSelectedTagIds((prev) => {
            if (prev.includes(tagId)) {
                return prev.filter((id) => id !== tagId);
            }
            return [...prev, tagId];
        });
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
                        <h6 className="fs-14 mb-1">{getUserDisplayName()}</h6>
                        <p className="mb-0">{getUserRole()}</p>
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className={clsx(
                            'btn p-2 position-relative',
                            showTagPanel ? 'btn-primary' : 'btn-outline-primary'
                        )}
                        onClick={() => setShowTagPanel(!showTagPanel)}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        data-bs-title={showTagPanel ? 'Ẩn nhãn' : 'Hiện nhãn'}
                        type="button"
                    >
                        <i className="ti ti-tag"></i>
                        {selectedTagIds.length > 0 && (
                            <span
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                                style={{ fontSize: '0.625rem', padding: '0.15rem 0.35rem' }}
                            >
                                {selectedTagIds.length}
                            </span>
                        )}
                    </button>
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

                {/* Active Filter Indicator */}
                {selectedTagIds.length > 0 && (
                    <div className="d-flex align-items-center justify-content-between mt-2 px-2">
                        <span className="text-muted small">
                            <i className="ti ti-filter me-1"></i>
                            Lọc theo {selectedTagIds.length} nhãn
                        </span>
                        <button
                            className="btn btn-sm btn-ghost-danger"
                            onClick={() => setSelectedTagIds([])}
                            type="button"
                        >
                            <i className="ti ti-x"></i> Xóa lọc
                        </button>
                    </div>
                )}

                {/* Tag Filter Panel */}
                {showTagPanel && (
                    <div className="mt-3">
                        <TagManager
                            userId={currentUserId}
                            onTagSelect={handleTagSelect}
                            selectedTags={selectedTagIds}
                        />
                    </div>
                )}
            </div>

            {/* User List Container */}
            <div className={styles.userListContainer}>
                <div className={clsx(styles.chatUsers, 'p-3')}>
                    <h6>Tất cả tin nhắn</h6>

                    {isLoading && (
                        <div className="text-center py-4">
                            <div className="spinner-border spinner-border-sm" aria-label="Đang tải">
                                <output className="visually-hidden">Đang tải...</output>
                            </div>
                        </div>
                    )}
                    {!isLoading && filteredConversations.length === 0 && (
                        <div className="text-center py-4 text-muted">
                            <p>Chưa có cuộc hội thoại nào</p>
                        </div>
                    )}
                    {!isLoading && filteredConversations.length > 0 && (
                        <>
                            {filteredConversations.map((conv) => {
                                // Get other participant info
                                const otherParticipant = conv.participantDetails?.find(
                                    (p) =>
                                        (p.id || p.accountId || '').toUpperCase() !== currentUserId
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

                                // Get tags for this conversation
                                const convTags = conversationTags.get(conv.id) || [];

                                return (
                                    <div key={conv.id}>
                                        <button
                                            type="button"
                                            onClick={() => selectConversation(conv.id)}
                                            style={{
                                                cursor: 'pointer',
                                                border: 'none',
                                                background: 'none',
                                                padding: 0,
                                                width: '100%',
                                                textAlign: 'left',
                                            }}
                                        >
                                            <UserListItem user={user} />
                                        </button>
                                        {convTags.length > 0 && (
                                            <div
                                                style={{
                                                    paddingLeft: '1rem',
                                                    paddingTop: '0.25rem',
                                                }}
                                            >
                                                <ConversationTagBadge
                                                    tags={convTags}
                                                    maxVisible={3}
                                                />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatUserNav;
