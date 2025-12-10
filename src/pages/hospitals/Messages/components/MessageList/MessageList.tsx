import { useEffect, useRef, Fragment, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useChat } from '@/providers/ChatProvider';
import { RootState } from '@/store';
import { MessageType, MessageAttachment } from '@/types/communication.types';
import { ChatService } from '@/services/chat.service';
import clsx from 'clsx';
import styles from '../../Messages.module.scss';
import CallLogItem from './CallLogItem/CallLogItem';
import userDefault from '@/assets/img/users/user-default.jpg';
import ConfirmDialog from '@/components/ConfirmDialog/ConfirmDialog';

const MessageList = () => {
    const {
        messages,
        activeConversation,
        isLoadingMessages,
        typingUsers,
        loadMoreOldMessages,
        hasMoreOldMessages,
        isLoadingMoreMessages,
    } = useChat();

    // Get current user profile
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const currentUserId = (userProfile?.accountId || '').toUpperCase();

    // State for image preview modal
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    // State for recall message
    const [recallingMessageId, setRecallingMessageId] = useState<string | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [messageToRecall, setMessageToRecall] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef<number>(0);
    const prevScrollHeightRef = useRef<number>(0);
    const isLoadingOldMessagesRef = useRef<boolean>(false);

    // Scroll to bottom helper function
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    // Auto scroll to bottom when switching conversation (instant scroll)
    useEffect(() => {
        if (activeConversation) {
            setTimeout(() => scrollToBottom('auto'), 100);
        }
    }, [activeConversation?.id]);

    // Auto scroll when new messages arrive (smooth scroll)
    useEffect(() => {
        const currentLength = messages.length;
        const prevLength = prevMessagesLengthRef.current;

        if (currentLength > 0) {
            if (prevLength === 0) {
                // Initial load - scroll instantly to bottom
                setTimeout(() => scrollToBottom('auto'), 100);
            } else if (currentLength > prevLength && !isLoadingOldMessagesRef.current) {
                // New message arrived (NOT from loading old messages) - smooth scroll
                console.log('[MessageList] 📥 New message detected, scrolling to bottom');
                scrollToBottom('smooth');
            } else if (isLoadingOldMessagesRef.current) {
                console.log('[MessageList] 🚫 Skipping auto-scroll (loading old messages)');
            }
        }

        prevMessagesLengthRef.current = currentLength;
    }, [messages]);

    // Auto scroll when typing indicator appears
    useEffect(() => {
        const typingUserId = activeConversation ? typingUsers.get(activeConversation.id) : null;
        if (typingUserId) {
            scrollToBottom('smooth');
        }
    }, [typingUsers, activeConversation]);

    // Helper to get scrollable container
    const getScrollContainer = () => {
        const messagesDiv = messagesContainerRef.current;

        if (!messagesDiv) {
            console.warn('[MessageList] Could not find scroll container');
            return null;
        }

        // The messageList div itself is the scrollable container (has overflow-y: auto in SCSS)
        return messagesDiv;
    };

    // Preserve scroll position when loading more old messages
    useEffect(() => {
        if (isLoadingMoreMessages) {
            isLoadingOldMessagesRef.current = true;

            const container = getScrollContainer();
            if (container) {
                prevScrollHeightRef.current = container.scrollHeight;
                console.log('[MessageList] 📏 Stored scroll height:', container.scrollHeight);
            }
        } else if (prevScrollHeightRef.current > 0) {
            setTimeout(() => {
                const container = getScrollContainer();
                if (container) {
                    const heightDiff = container.scrollHeight - prevScrollHeightRef.current;
                    if (heightDiff > 0) {
                        container.scrollTop = heightDiff;
                        console.log('[MessageList] ✅ Restored scroll position:', {
                            oldHeight: prevScrollHeightRef.current,
                            newHeight: container.scrollHeight,
                            heightDiff,
                            newScrollTop: container.scrollTop,
                        });
                    }
                    prevScrollHeightRef.current = 0;
                }

                isLoadingOldMessagesRef.current = false;
                console.log('[MessageList] ✅ Reset loading flag, auto-scroll re-enabled');
            }, 150);
        }
    }, [isLoadingMoreMessages]);

    // Infinite scroll: Load more old messages when scrolling to top
    useEffect(() => {
        const container = getScrollContainer();
        if (!container) {
            console.warn('[MessageList] ⚠️ No scroll container, infinite scroll disabled');
            return;
        }

        console.log('[MessageList] ✅ Infinite scroll enabled on:', container.className);

        const handleScroll = () => {
            const scrollTop = container.scrollTop;

            // Check if scrolled near the top (within 100px)
            if (scrollTop < 100 && hasMoreOldMessages && !isLoadingMoreMessages) {
                console.log('[MessageList] 🚀 TRIGGERING load more old messages!');
                loadMoreOldMessages();
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            console.log('[MessageList] 🧹 Cleaning up scroll listener');
            container.removeEventListener('scroll', handleScroll);
        };
    }, [hasMoreOldMessages, isLoadingMoreMessages, loadMoreOldMessages]);

    // Get typing user info
    const typingUserId = activeConversation ? typingUsers.get(activeConversation.id) : null;
    const typingUser =
        typingUserId && activeConversation
            ? activeConversation.participantDetails?.find(
                  (p) => (p.id || p.accountId || '').toUpperCase() === typingUserId.toUpperCase()
              )
            : null;

    // Check if message can be recalled
    const canRecall = (message: any): boolean => {
        // Only sender can recall
        if ((message.senderId || '').toUpperCase() !== currentUserId) return false;

        // Can't recall already recalled message
        if (message.status === 'RECALLED') return false;

        // Check if createdAt exists
        if (!message.createdAt) return false;

        // Check 1-hour time limit
        const messageTime = new Date(message.createdAt).getTime();
        const now = Date.now();
        const hoursSinceSent = (now - messageTime) / (1000 * 60 * 60);

        return hoursSinceSent < 1;
    };

    // Handle recall message
    const handleRecallMessage = async (messageId: string) => {
        setMessageToRecall(messageId);
        setShowConfirmDialog(true);
    };

    const confirmRecall = async () => {
        if (!messageToRecall) return;

        try {
            setRecallingMessageId(messageToRecall);
            await ChatService.recallMessage(messageToRecall, currentUserId);

            toast.success('Đã thu hồi tin nhắn');
            // Message will be updated via SignalR real-time notification
        } catch (error: any) {
            console.error('[MessageList] ❌ Recall message error:', error);
            toast.error(error.message || 'Không thể thu hồi tin nhắn');
        } finally {
            setRecallingMessageId(null);
            setMessageToRecall(null);
        }
    };

    // Helper: Format timestamp smartly (like WhatsApp)
    const formatMessageTimestamp = (createdAt: string): string => {
        const messageDate = new Date(createdAt);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const timeStr = messageDate.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });

        // Today: just time
        if (messageDate >= today) {
            return timeStr;
        }

        // Yesterday
        if (messageDate >= yesterday) {
            return `Hôm qua ${timeStr}`;
        }

        // This week: day name
        if (messageDate >= lastWeek) {
            const dayName = messageDate.toLocaleDateString('vi-VN', { weekday: 'long' });
            return `${dayName} ${timeStr}`;
        }

        // Older: full date
        const dateStr = messageDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
        return `${dateStr} ${timeStr}`;
    };

    // Helper: Get date label for separator
    const getDateLabel = (dateStr: string): string => {
        const messageDate = new Date(dateStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (messageDate >= today) {
            return 'Hôm nay';
        }
        if (messageDate >= yesterday) {
            return 'Hôm qua';
        }
        return messageDate.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    // Helper: Check if we need date separator
    const needsDateSeparator = (
        currentItem: { createdAt: string },
        previousItem: { createdAt: string } | null
    ): boolean => {
        if (!previousItem) return true;

        const currentDate = new Date(currentItem.createdAt).toDateString();
        const previousDate = new Date(previousItem.createdAt).toDateString();

        return currentDate !== previousDate;
    };

    // Helper: Get item metadata
    const getItemMetadata = (item: any, index: number) => {
        const previousItem = index > 0 ? messages[index - 1] : null;
        const isCallLog = item.itemType === 'CallLog';
        const message = isCallLog ? null : item.message || item;
        const callLog = isCallLog ? item.callLog : null;
        const showDateSeparator = needsDateSeparator(item, previousItem);
        const isOwn = isCallLog
            ? (callLog?.callerId || '').toUpperCase() === currentUserId
            : (message?.senderId || '').toUpperCase() === currentUserId;

        return { isCallLog, message, callLog, showDateSeparator, isOwn };
    };

    if (!activeConversation) {
        return (
            <div className={clsx(styles.messageListEmpty, 'text-center p-4')}>
                <p className="text-muted">Chọn một hội thoại để bắt đầu nhắn tin</p>
            </div>
        );
    }

    if (isLoadingMessages) {
        return (
            <div className={clsx(styles.messageListEmpty, 'text-center p-4')}>
                <div className="spinner-border" aria-label="Đang tải tin nhắn">
                    <output className="visually-hidden">Đang tải tin nhắn...</output>
                </div>
            </div>
        );
    }

    return (
        <div className={clsx(styles.messageList, 'messages')} ref={messagesContainerRef}>
            {/* Loading indicator for old messages */}
            {isLoadingMoreMessages && (
                <div className="text-center py-2">
                    <div
                        className="spinner-border spinner-border-sm"
                        aria-label="Đang tải tin nhắn cũ"
                    >
                        <output className="visually-hidden">Đang tải tin nhắn cũ...</output>
                    </div>
                    <p className="text-muted small mt-1">Đang tải tin nhắn cũ...</p>
                </div>
            )}

            {messages.map((item: any, index) => {
                const { isCallLog, message, callLog, showDateSeparator, isOwn } = getItemMetadata(
                    item,
                    index
                );

                return (
                    <Fragment key={item.id}>
                        {/* Date Separator */}
                        {showDateSeparator && (
                            <div className="text-center my-3">
                                <span className="badge bg-light text-dark px-3 py-2 rounded-pill shadow-sm">
                                    {getDateLabel(item.createdAt)}
                                </span>
                            </div>
                        )}

                        {/* Render Call Log or Message */}
                        {isCallLog && callLog && <CallLogItem callLog={callLog} isOwn={isOwn} />}
                        {!isCallLog && message && (
                            <div
                                className="mb-3"
                                style={{
                                    display: 'flex',
                                    gap: '0.75rem',
                                    alignItems: 'flex-end',
                                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                }}
                            >
                                {!isOwn && (
                                    <span
                                        className="avatar flex-shrink-0"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <img
                                            src={message.senderInfo?.avatarUrl || userDefault}
                                            alt="avatar"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </span>
                                )}
                                <div
                                    className="message-content-wrapper"
                                    style={{ maxWidth: '70%', position: 'relative' }}
                                >
                                    {/* Check if message is recalled */}
                                    {message.status === 'RECALLED' ? (
                                        <div>
                                            <div
                                                style={{
                                                    padding: '0.625rem 0.875rem',
                                                    borderRadius: '0.5rem',
                                                    backgroundColor: '#f0f0f0',
                                                    color: '#6c757d',
                                                    fontStyle: 'italic',
                                                    opacity: 0.7,
                                                    wordBreak: 'break-word',
                                                    whiteSpace: 'normal',
                                                    display: 'inline-block',
                                                    minWidth: 'fit-content',
                                                    ...(isOwn
                                                        ? { borderBottomRightRadius: '0.25rem' }
                                                        : { borderBottomLeftRadius: '0.25rem' }),
                                                }}
                                            >
                                                <i className="fa-solid fa-rotate-left me-1"></i>
                                                {message.content}
                                            </div>
                                            {/* Timestamp for recalled message */}
                                            <span
                                                style={{
                                                    display: 'block',
                                                    fontSize: '0.75rem',
                                                    marginTop: '0.25rem',
                                                    opacity: 0.7,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {formatMessageTimestamp(message.createdAt)}
                                            </span>
                                        </div>
                                    ) : (
                                        <div
                                            style={{
                                                padding: '0.625rem 0.875rem',
                                                borderRadius: '0.5rem',
                                                backgroundColor: isOwn ? '#007bff' : '#f8f9fa',
                                                color: isOwn ? 'white' : '#212529',
                                                wordBreak: 'break-word',
                                                whiteSpace: 'normal',
                                                display: 'inline-block',
                                                minWidth: 'fit-content',
                                                ...(isOwn
                                                    ? { borderBottomRightRadius: '0.25rem' }
                                                    : { borderBottomLeftRadius: '0.25rem' }),
                                            }}
                                        >
                                            {/* Text Content */}
                                            {message.content?.trim() && (
                                                <p
                                                    style={{
                                                        margin: '0 0 0.25rem 0',
                                                        lineHeight: 1.5,
                                                        whiteSpace: 'normal',
                                                    }}
                                                >
                                                    {message.content}
                                                </p>
                                            )}

                                            {/* Attachments */}
                                            {message.attachments &&
                                                message.attachments.length > 0 && (
                                                    <div
                                                        style={{
                                                            marginTop: message.content
                                                                ? '0.5rem'
                                                                : '0',
                                                        }}
                                                    >
                                                        {message.attachments.map(
                                                            (
                                                                att: MessageAttachment,
                                                                idx: number
                                                            ) => {
                                                                const fileUrl =
                                                                    att.url || att.fileUrl;
                                                                const fileName =
                                                                    att.name ||
                                                                    att.fileName ||
                                                                    'File';
                                                                const mimeType = att.mimeType;

                                                                // Image attachments
                                                                if (
                                                                    message.type ===
                                                                        MessageType.IMAGE ||
                                                                    mimeType?.startsWith('image/')
                                                                ) {
                                                                    return (
                                                                        <div
                                                                            key={
                                                                                fileUrl ||
                                                                                `img-${idx}`
                                                                            }
                                                                            style={{
                                                                                marginTop:
                                                                                    idx > 0
                                                                                        ? '0.5rem'
                                                                                        : '0',
                                                                            }}
                                                                        >
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setSelectedImage(
                                                                                        fileUrl ||
                                                                                            null
                                                                                    )
                                                                                }
                                                                                style={{
                                                                                    border: 'none',
                                                                                    background:
                                                                                        'none',
                                                                                    padding: 0,
                                                                                    cursor: 'pointer',
                                                                                    display:
                                                                                        'block',
                                                                                }}
                                                                                onMouseOver={(
                                                                                    e
                                                                                ) => {
                                                                                    const img =
                                                                                        e.currentTarget.querySelector(
                                                                                            'img'
                                                                                        ) as HTMLImageElement;
                                                                                    if (img)
                                                                                        img.style.opacity =
                                                                                            '0.8';
                                                                                }}
                                                                                onMouseOut={(e) => {
                                                                                    const img =
                                                                                        e.currentTarget.querySelector(
                                                                                            'img'
                                                                                        ) as HTMLImageElement;
                                                                                    if (img)
                                                                                        img.style.opacity =
                                                                                            '1';
                                                                                }}
                                                                                onFocus={(e) => {
                                                                                    const img =
                                                                                        e.currentTarget.querySelector(
                                                                                            'img'
                                                                                        ) as HTMLImageElement;
                                                                                    if (img)
                                                                                        img.style.opacity =
                                                                                            '0.8';
                                                                                }}
                                                                                onBlur={(e) => {
                                                                                    const img =
                                                                                        e.currentTarget.querySelector(
                                                                                            'img'
                                                                                        ) as HTMLImageElement;
                                                                                    if (img)
                                                                                        img.style.opacity =
                                                                                            '1';
                                                                                }}
                                                                            >
                                                                                <img
                                                                                    src={fileUrl}
                                                                                    alt={fileName}
                                                                                    style={{
                                                                                        maxWidth:
                                                                                            '250px',
                                                                                        maxHeight:
                                                                                            '250px',
                                                                                        borderRadius:
                                                                                            '0.5rem',
                                                                                        display:
                                                                                            'block',
                                                                                        objectFit:
                                                                                            'cover',
                                                                                        transition:
                                                                                            'opacity 0.2s',
                                                                                    }}
                                                                                />
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                }

                                                                // Video attachments
                                                                if (
                                                                    message.type ===
                                                                        MessageType.VIDEO ||
                                                                    mimeType?.startsWith('video/')
                                                                ) {
                                                                    return (
                                                                        <div
                                                                            key={
                                                                                fileUrl ||
                                                                                `video-${idx}`
                                                                            }
                                                                            style={{
                                                                                marginTop:
                                                                                    idx > 0
                                                                                        ? '0.5rem'
                                                                                        : '0',
                                                                            }}
                                                                        >
                                                                            <video
                                                                                controls
                                                                                style={{
                                                                                    maxWidth:
                                                                                        '250px',
                                                                                    maxHeight:
                                                                                        '250px',
                                                                                    borderRadius:
                                                                                        '0.5rem',
                                                                                    display:
                                                                                        'block',
                                                                                }}
                                                                            >
                                                                                <source
                                                                                    src={fileUrl}
                                                                                    type={mimeType}
                                                                                />
                                                                                <track kind="captions" />
                                                                                Your browser does
                                                                                not support the
                                                                                video tag.
                                                                            </video>
                                                                        </div>
                                                                    );
                                                                }

                                                                // Audio attachments
                                                                if (
                                                                    message.type ===
                                                                        MessageType.AUDIO ||
                                                                    mimeType?.startsWith('audio/')
                                                                ) {
                                                                    return (
                                                                        <div
                                                                            key={
                                                                                fileUrl ||
                                                                                `audio-${idx}`
                                                                            }
                                                                            style={{
                                                                                marginTop:
                                                                                    idx > 0
                                                                                        ? '0.5rem'
                                                                                        : '0',
                                                                            }}
                                                                        >
                                                                            <audio
                                                                                controls
                                                                                style={{
                                                                                    maxWidth:
                                                                                        '100%',
                                                                                }}
                                                                            >
                                                                                <source
                                                                                    src={fileUrl}
                                                                                    type={mimeType}
                                                                                />
                                                                                <track kind="captions" />
                                                                                Your browser does
                                                                                not support the
                                                                                audio tag.
                                                                            </audio>
                                                                        </div>
                                                                    );
                                                                }

                                                                // Other file attachments
                                                                return (
                                                                    <div
                                                                        key={
                                                                            fileUrl || `file-${idx}`
                                                                        }
                                                                        style={{
                                                                            marginTop:
                                                                                idx > 0
                                                                                    ? '0.25rem'
                                                                                    : '0',
                                                                        }}
                                                                    >
                                                                        <a
                                                                            href={fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            style={{
                                                                                color: 'inherit',
                                                                                textDecoration:
                                                                                    'none',
                                                                                display:
                                                                                    'inline-flex',
                                                                                alignItems:
                                                                                    'center',
                                                                                gap: '0.25rem',
                                                                                fontSize:
                                                                                    '0.875rem',
                                                                            }}
                                                                        >
                                                                            📎 {fileName}
                                                                        </a>
                                                                    </div>
                                                                );
                                                            }
                                                        )}
                                                    </div>
                                                )}

                                            <span
                                                style={{
                                                    display: 'block',
                                                    fontSize: '0.75rem',
                                                    marginTop: '0.25rem',
                                                    opacity: 0.7,
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {formatMessageTimestamp(message.createdAt)}
                                            </span>
                                        </div>
                                    )}

                                    {/* Recall button (hover to show) - positioned in top-right corner */}
                                    {canRecall(message) && (
                                        <button
                                            onClick={() => handleRecallMessage(message.id)}
                                            disabled={recallingMessageId === message.id}
                                            title="Thu hồi tin nhắn"
                                            className="message-recall-btn"
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                border: 'none',
                                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                color: '#dc3545',
                                                fontSize: '0.75rem',
                                                cursor:
                                                    recallingMessageId === message.id
                                                        ? 'not-allowed'
                                                        : 'pointer',
                                                opacity: 0,
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                                zIndex: 10,
                                            }}
                                            onMouseEnter={(e) => {
                                                if (recallingMessageId !== message.id) {
                                                    e.currentTarget.style.transform = 'scale(1.15)';
                                                    e.currentTarget.style.boxShadow =
                                                        '0 3px 8px rgba(0,0,0,0.25)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow =
                                                    '0 2px 6px rgba(0,0,0,0.15)';
                                            }}
                                        >
                                            {recallingMessageId === message.id ? (
                                                <span
                                                    className="spinner-border spinner-border-sm"
                                                    style={{ width: '12px', height: '12px' }}
                                                ></span>
                                            ) : (
                                                <i className="fa-solid fa-rotate-left"></i>
                                            )}
                                        </button>
                                    )}
                                </div>
                                {isOwn && (
                                    <span
                                        className="avatar flex-shrink-0"
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <img
                                            src={
                                                adminProfile?.avatarUrl ||
                                                doctorProfile?.avatarUrl ||
                                                hospitalProfile?.avatarUrl ||
                                                userDefault
                                            }
                                            alt="avatar"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </span>
                                )}
                            </div>
                        )}
                    </Fragment>
                );
            })}

            {/* Typing indicator */}
            {typingUser && (
                <div
                    className="mb-3"
                    style={{
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-start',
                    }}
                >
                    <span
                        className="avatar flex-shrink-0"
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                        }}
                    >
                        <img
                            src={typingUser.avatarUrl || userDefault}
                            alt="avatar"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </span>
                    <div style={{ maxWidth: '70%' }}>
                        <div
                            style={{
                                padding: '0.625rem 0.875rem',
                                borderRadius: '0.5rem',
                                backgroundColor: '#f8f9fa',
                                color: '#212529',
                                wordBreak: 'break-word',
                                whiteSpace: 'normal',
                                display: 'inline-block',
                                borderBottomLeftRadius: '0.25rem',
                            }}
                        >
                            <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: 'normal' }}>
                                <i>{typingUser.fullName} đang nhập...</i>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />

            {/* Image Preview Modal */}
            {selectedImage && (
                <button
                    type="button"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        cursor: 'pointer',
                        border: 'none',
                        padding: 0,
                    }}
                    onClick={() => setSelectedImage(null)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            e.preventDefault();
                            setSelectedImage(null);
                        }
                    }}
                >
                    <button
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            color: 'white',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                            zIndex: 10000,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImage(null);
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')
                        }
                        onFocus={(e) =>
                            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')
                        }
                        onBlur={(e) =>
                            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')
                        }
                    >
                        ×
                    </button>
                    <img
                        src={selectedImage}
                        alt="Preview"
                        style={{
                            maxWidth: '90vw',
                            maxHeight: '90vh',
                            objectFit: 'contain',
                            borderRadius: '0.5rem',
                            pointerEvents: 'none',
                        }}
                    />
                </button>
            )}

            {/* Confirm Dialog for message recall */}
            <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={confirmRecall}
                title="Thu hồi tin nhắn"
                message="Bạn có chắc chắn muốn thu hồi tin nhắn này? Hành động này không thể hoàn tác."
                confirmText="Thu hồi"
                cancelText="Hủy"
                type="warning"
                icon="fa-solid fa-rotate-left"
            />
        </div>
    );
};

export default MessageList;
