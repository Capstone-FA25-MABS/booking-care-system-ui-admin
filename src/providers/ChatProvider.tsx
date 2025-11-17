import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    useRef,
    ReactNode,
    useMemo,
} from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { RootState } from '@/store';
import { useSharedChatHub } from '@/hooks/useSharedChatHub';
import { ChatHubCallbacks } from '@/hooks/useChatHub';
import { ChatService } from '@/services/chat.service';
import {
    ConversationResponse,
    MessageResponse,
    SignalRMessageReceived,
    SignalRMessageRead,
    SignalRTypingEvent,
    MessageType,
    MessageStatus,
} from '@/types/communication.types';

interface ChatContextValue {
    // State
    conversations: ConversationResponse[];
    activeConversation: ConversationResponse | null;
    messages: MessageResponse[];
    onlineUsers: Set<string>;
    typingUsers: Map<string, string>; // conversationId -> userId
    isLoading: boolean;
    isLoadingMessages: boolean;

    // Pagination state
    hasMoreOldMessages: boolean;
    hasMoreNewMessages: boolean;
    isLoadingMoreMessages: boolean;

    // Conversation methods
    loadConversations: () => Promise<void>;
    selectConversation: (conversationId: string) => Promise<void>;
    createOrGetConversation: (otherUserId: string) => Promise<ConversationResponse>;

    // Message methods
    sendMessage: (content: string, type?: MessageType, files?: File[]) => Promise<void>;
    sendMessageViaREST: (content: string, type?: MessageType, files?: File[]) => Promise<void>;
    loadMessages: (conversationId: string, before?: string) => Promise<void>;
    loadMoreOldMessages: () => Promise<void>; // Load older messages (scroll up)
    loadMoreNewMessages: () => Promise<void>; // Load newer messages (scroll down)
    markAsRead: (messageId: string) => Promise<void>;
    markAllAsRead: (conversationId: string) => Promise<void>;

    // Real-time methods
    startTyping: () => void;
    stopTyping: () => void;

    // SignalR status
    isConnected: boolean;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
    children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    // Get user info from Redux - Admin side structure
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );

    // Get accountId from any available profile
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const userId = userProfile?.accountId || '';

    // Debug logging
    console.log('[ChatProvider] Render - Profiles:', {
        hasAdminProfile: !!adminProfile,
        hasDoctorProfile: !!doctorProfile,
        hasHospitalProfile: !!hospitalProfile,
        userId,
        accountId: userProfile?.accountId,
    });

    // State
    const [conversations, setConversations] = useState<ConversationResponse[]>([]);
    const [activeConversation, setActiveConversation] = useState<ConversationResponse | null>(null);
    const [messages, setMessages] = useState<MessageResponse[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // ✅ Ref to track processing messages (prevent duplicates from multiple SignalR events)
    const processingMessagesRef = useRef<Set<string>>(new Set());

    // ✅ Ref for loadConversations function to avoid circular dependency
    const loadConversationsRef = useRef<(() => Promise<void>) | null>(null);

    // ✅ Ref for reloadMessages function to refetch messages for active conversation
    const reloadMessagesRef = useRef<(() => Promise<void>) | null>(null);

    // Pagination state
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
    const [previousCursor, setPreviousCursor] = useState<string | undefined>(undefined);
    const [hasMoreOldMessages, setHasMoreOldMessages] = useState(false);
    const [hasMoreNewMessages, setHasMoreNewMessages] = useState(false);
    const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);

    // Helper function to get sender info for a message
    const getSenderInfo = useCallback(
        (senderId: string) => {
            const senderIdUpper = senderId.toUpperCase();
            const currentUserIdUpper = (userProfile?.accountId || '').toUpperCase();

            // If sender is current user, use user profile
            if (senderIdUpper === currentUserIdUpper) {
                return {
                    id: userProfile?.accountId,
                    accountId: userProfile?.accountId,
                    email: userProfile?.email || '',
                    fullName:
                        (adminProfile && `${adminProfile.firstName} ${adminProfile.lastName}`) ||
                        (doctorProfile && `${doctorProfile.firstName} ${doctorProfile.lastName}`) ||
                        hospitalProfile?.name ||
                        'You',
                    avatarUrl: userProfile?.avatarUrl || '/default-avatar.png',
                    phoneNumber:
                        (userProfile && 'phone' in userProfile ? userProfile.phone : undefined) ||
                        undefined,
                };
            }

            // Otherwise, try to find sender in active conversation's participant details
            if (activeConversation?.participantDetails) {
                const participant = activeConversation.participantDetails.find(
                    (p) => (p.id || p.accountId || '').toUpperCase() === senderIdUpper
                );
                if (participant) {
                    return participant;
                }
            }

            // Fallback to basic info
            return {
                id: senderId,
                email: '',
                fullName: 'Unknown User',
                avatarUrl: '/default-avatar.png',
            };
        },
        [userProfile, activeConversation]
    );

    // SignalR callbacks
    const hubCallbacks: ChatHubCallbacks = {
        onMessageReceived: useCallback(
            (message: SignalRMessageReceived) => {
                // ✅ Check if already processing this message (backend sends to both conversation group + user group)
                if (processingMessagesRef.current.has(message.messageId)) {
                    return;
                }

                // Mark as processing
                processingMessagesRef.current.add(message.messageId);

                // Add message to messages list if it's for active conversation
                if (activeConversation && message.conversationId === activeConversation.id) {
                    const newMessage: MessageResponse = {
                        id: message.messageId,
                        conversationId: message.conversationId,
                        senderId: message.senderId,
                        receiverId: message.receiverId,
                        content: message.content,
                        type: message.type,
                        status: message.status,
                        attachments: message.attachments || [], // ✅ Use attachments from SignalR
                        createdAt: message.createdAt,
                        updatedAt: message.createdAt,
                        senderInfo: getSenderInfo(message.senderId), // ✅ Add sender info
                    };

                    // Deduplicate: only add if message doesn't exist
                    setMessages((prev) => {
                        const exists = prev.some((m) => m.id === newMessage.id);

                        if (exists) {
                            return prev;
                        }

                        return [...prev, newMessage];
                    });

                    // ✅ Cleanup processing flag after a short delay (allow state to update)
                    setTimeout(() => {
                        processingMessagesRef.current.delete(message.messageId);
                    }, 1000); // 1 second should be enough for state to propagate
                }

                // Update conversation's last message
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === message.conversationId
                            ? {
                                  ...conv,
                                  lastMessage: {
                                      messageId: message.messageId,
                                      content: message.content,
                                      senderId: message.senderId,
                                      createdAt: message.createdAt,
                                      type: message.type,
                                      attachments: message.attachments,
                                  },
                                  unreadCount:
                                      message.senderId.toUpperCase() === userId.toUpperCase()
                                          ? conv.unreadCount
                                          : (conv.unreadCount || 0) + 1,
                              }
                            : conv
                    )
                );

                // Don't show toast here - GlobalChatProvider handles notifications
                // and message is already visible in the chat interface
            },
            [activeConversation, userId, getSenderInfo]
        ),

        onMessageRead: useCallback((data: SignalRMessageRead) => {
            // Update message status
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === data.messageId
                        ? {
                              ...msg,
                              status: 'READ' as any,
                              readAt: data.readAt,
                          }
                        : msg
                )
            );
        }, []),

        onAllMessagesRead: useCallback(
            (data: any) => {
                console.log('[ChatProvider] 📖📖 AllMessagesRead event received:', data);

                // Extract data (handle both PascalCase and camelCase)
                const conversationId = data.conversationId || data.ConversationId;
                const readBy = data.readBy || data.ReadBy;

                if (!conversationId) {
                    console.error('[ChatProvider] ❌ No conversationId in AllMessagesRead event');
                    return;
                }

                console.log(
                    '[ChatProvider] 📖 Marking all messages as read for conversation:',
                    conversationId,
                    'by user:',
                    readBy
                );

                // Reset unread count for conversation
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
                    )
                );

                // Update all messages in active conversation to READ status
                if (activeConversation?.id === conversationId) {
                    setMessages((prev) =>
                        prev.map((msg) => ({
                            ...msg,
                            status: MessageStatus.READ,
                            readAt: data.readAt || data.ReadAt || new Date().toISOString(),
                        }))
                    );
                }

                console.log('[ChatProvider] ✅ All messages marked as read successfully');
            },
            [activeConversation]
        ),

        onMessageRecalled: useCallback((data: any) => {
            console.log('[ChatProvider] 🔄 Message recalled - Raw data:', data);

            // Handle both PascalCase (C# backend) and camelCase
            const messageId = data.messageId || data.MessageId;
            const content = data.content || data.Content;
            const rawStatus = data.status || data.Status;
            const updatedAt = data.updatedAt || data.UpdatedAt;

            // ✅ Convert numeric status (from backend) to string
            // Backend enum: SENT=0, DELIVERED=1, READ=2, UNREAD=3, RECALLED=4
            let status: MessageStatus;
            if (typeof rawStatus === 'number') {
                const statusMap: { [key: number]: MessageStatus } = {
                    0: MessageStatus.SENT,
                    1: MessageStatus.DELIVERED,
                    2: MessageStatus.READ,
                    3: MessageStatus.READ, // Backend UNREAD → Frontend READ
                    4: MessageStatus.RECALLED,
                };
                status = statusMap[rawStatus] || MessageStatus.SENT;
                console.log('[ChatProvider] 🔄 Converted numeric status:', rawStatus, '→', status);
            } else {
                status = rawStatus as MessageStatus;
            }

            if (!messageId) {
                console.error('[ChatProvider] ❌ No messageId in recalled data:', data);
                return;
            }

            console.log(
                '[ChatProvider] 📝 Processing recall for messageId:',
                messageId,
                'Status:',
                status
            );

            // Update message in messages list
            setMessages((prev) => {
                const updated = prev.map((item) => {
                    if (item.id === messageId) {
                        console.log('[ChatProvider] ✅ Found and updating message:', item.id);
                        return {
                            ...item,
                            content: content,
                            status: status,
                            updatedAt: updatedAt,
                        };
                    }
                    return item;
                });

                const wasUpdated = updated.some((m) => m.id === messageId && m.status === status);
                console.log(
                    '[ChatProvider] 🎯 Update result - Message found and updated:',
                    wasUpdated
                );

                return updated;
            });

            // Update conversation's last message if needed
            setConversations((prev) =>
                prev.map((conv) => {
                    if (conv.lastMessage && conv.lastMessage.messageId === messageId) {
                        return {
                            ...conv,
                            lastMessage: {
                                ...conv.lastMessage,
                                content: content,
                            },
                        };
                    }
                    return conv;
                })
            );
        }, []),

        onUserStartedTyping: useCallback((data: SignalRTypingEvent) => {
            setTypingUsers((prev) => {
                const newMap = new Map(prev);
                newMap.set(data.conversationId, data.userId);
                return newMap;
            });
        }, []),

        onUserStoppedTyping: useCallback((data: SignalRTypingEvent) => {
            setTypingUsers((prev) => {
                const newMap = new Map(prev);
                newMap.delete(data.conversationId);
                return newMap;
            });
        }, []),

        onOnlineUsers: useCallback((userIds: string[]) => {
            // Normalize to UPPERCASE for case-insensitive matching
            const normalizedIds = userIds.map((id) => id.toUpperCase());
            console.log('[ChatProvider] 📋 Received online users list:', normalizedIds);
            setOnlineUsers(new Set(normalizedIds));
        }, []),

        onUserOnline: useCallback((userId: string) => {
            // Normalize to UPPERCASE for case-insensitive matching
            const normalizedId = userId.toUpperCase();
            console.log('[ChatProvider] ✅ User came online:', normalizedId);
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.add(normalizedId);
                return newSet;
            });
        }, []),

        onUserOffline: useCallback((userId: string) => {
            // Normalize to UPPERCASE for case-insensitive matching
            const normalizedId = userId.toUpperCase();
            console.log('[ChatProvider] ❌ User went offline:', normalizedId);
            setOnlineUsers((prev) => {
                const newSet = new Set(prev);
                newSet.delete(normalizedId);
                return newSet;
            });
        }, []),

        onError: useCallback((error: string) => {
            console.error('[ChatProvider] SignalR error:', error);
            toast.error(`Lỗi kết nối: ${error}`);
        }, []),

        onCallLogUpdated: useCallback(
            (data: any) => {
                console.log('[ChatProvider] 📝 Call log updated:', data);

                // Refetch conversations to show updated LastMessage
                if (loadConversationsRef.current) {
                    loadConversationsRef.current();
                }

                // ✅ If call log belongs to active conversation, reload messages
                if (
                    activeConversation &&
                    data.conversationId === activeConversation.id &&
                    reloadMessagesRef.current
                ) {
                    console.log(
                        '[ChatProvider] 📝 Reloading messages for active conversation:',
                        activeConversation.id
                    );
                    reloadMessagesRef.current();
                }
            },
            [activeConversation]
        ),
    };

    // Use shared SignalR hub connection (from ChatHubContext)
    const chatHub = useSharedChatHub(hubCallbacks);

    // Join conversation when selected
    useEffect(() => {
        if (activeConversation && chatHub.isConnected) {
            chatHub
                .joinConversation(activeConversation.id)
                .then(() => {})
                .catch((error) => {
                    console.error('[ChatProvider] ❌ Error joining conversation:', error);
                });

            return () => {
                chatHub.leaveConversation(activeConversation.id).catch((error) => {
                    console.error('[ChatProvider] Error leaving conversation:', error);
                });
            };
        }
    }, [activeConversation, chatHub]);

    // Conversation methods
    const loadConversations = useCallback(async () => {
        if (!userId) {
            console.warn('[ChatProvider] loadConversations called but userId is empty');
            return;
        }

        console.log('[ChatProvider] 🔄 Starting to load conversations for userId:', userId);
        setIsLoading(true);
        try {
            const response = await ChatService.getConversations(userId, {
                limit: 50,
                includeParticipantDetails: true,
                includeUnreadCount: true,
                includeOnlineStatus: true,
            });
            console.log('[ChatProvider] ✅ Conversations loaded:', response.data);
            // Conversations API uses 'data' not 'items' (different from messages API)
            setConversations(response.data.data || []);
            console.log(
                '[ChatProvider] 📋 Set conversations count:',
                response.data.data?.length || 0
            );
        } catch (error) {
            console.error('[ChatProvider] ❌ Error loading conversations:', error);
            toast.error('Không thể tải danh sách hội thoại');
            // Set empty array on error to prevent undefined
            setConversations([]);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    // ✅ Update ref when function changes
    useEffect(() => {
        loadConversationsRef.current = loadConversations;
    }, [loadConversations]);

    // Load conversations when userId changes
    useEffect(() => {
        console.log('[ChatProvider] useEffect - userId changed:', userId);
        if (userId) {
            console.log('[ChatProvider] Loading conversations for userId:', userId);
            loadConversations();
        } else {
            console.warn('[ChatProvider] No userId, skipping conversation load');
        }
    }, [userId, loadConversations]);

    const selectConversation = useCallback(
        async (conversationId: string) => {
            console.log('[ChatProvider] 🎯 Starting to select conversation:', conversationId);
            setIsLoadingMessages(true);

            // Reset pagination state when selecting new conversation
            setMessages([]);
            setNextCursor(undefined);
            setPreviousCursor(undefined);
            setHasMoreOldMessages(false);
            setHasMoreNewMessages(false);

            try {
                // Load conversation details
                console.log('[ChatProvider] 📡 Fetching conversation details...');
                const convResponse = await ChatService.getConversation(conversationId);
                console.log('[ChatProvider] ✅ Conversation loaded:', convResponse.data);
                setActiveConversation(convResponse.data);

                // Load messages with cursor pagination
                console.log('[ChatProvider] 📡 Fetching messages...');
                const messagesResponse = await ChatService.getMessages(conversationId, {
                    limit: 50,
                    messagesOnly: false,
                    includeSenderInfo: true,
                    includeReceiverInfo: true,
                });

                // Extract messages and pagination metadata
                const paginationData = messagesResponse.data;
                const timelineItems = paginationData.items || [];
                // Keep all timeline items (both messages and call logs)
                const extractedMessages = Array.isArray(timelineItems)
                    ? [...timelineItems].reverse() // Reverse to show oldest first, newest last
                    : [];

                console.log('[ChatProvider] ✅ Messages loaded:', extractedMessages.length);

                // Update messages and pagination state
                setMessages(extractedMessages);
                setNextCursor(paginationData.nextCursor);
                setPreviousCursor(paginationData.previousCursor);
                setHasMoreOldMessages(paginationData.hasNext);
                setHasMoreNewMessages(paginationData.hasPrevious);

                // ✅ Always mark messages as read when opening conversation
                // Don't check unreadCount because:
                // 1. Backend might have auto-reset it when fetching conversation
                // 2. SignalR events might not have updated the count yet
                // 3. Better to be safe and always mark as read
                console.log('[ChatProvider] 📧 Marking messages as read...', {
                    conversationId,
                    unreadCount: convResponse.data?.unreadCount,
                    isHubConnected: chatHub.isConnected,
                    userId,
                });

                try {
                    if (chatHub.isConnected) {
                        console.log('[ChatProvider] Using SignalR hub to mark messages as read');
                        await chatHub.markAllMessagesAsRead(conversationId);
                    } else {
                        console.log('[ChatProvider] Using REST API to mark messages as read');
                        await ChatService.markAllMessagesAsRead({
                            conversationId,
                            userId,
                        });
                    }

                    // Update local state (reset unread count)
                    setConversations((prev) =>
                        prev.map((conv) =>
                            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
                        )
                    );

                    console.log('[ChatProvider] ✅ Messages marked as read successfully');
                } catch (markError: any) {
                    // Log detailed error information
                    console.error('[ChatProvider] ❌ Failed to mark messages as read:', {
                        error: markError,
                        errorMessage: markError?.message,
                        conversationId,
                        userId,
                        isHubConnected: chatHub.isConnected,
                    });
                    // Don't fail the whole selection, but log the error clearly
                }

                console.log('[ChatProvider] ✅ Conversation selected successfully');
            } catch (error: any) {
                console.error('[ChatProvider] ❌ Error selecting conversation:', error);
                console.error('[ChatProvider] ❌ Error details:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                });
                toast.error('Không thể tải hội thoại');
                // Re-throw to let caller know it failed
                throw error;
            } finally {
                setIsLoadingMessages(false);
            }
        },
        [userId, chatHub, conversations]
    );

    // ✅ Reload messages for active conversation (used when call log updated)
    const reloadMessages = useCallback(async () => {
        if (!activeConversation) {
            console.log('[ChatProvider] No active conversation to reload');
            return;
        }

        console.log(
            '[ChatProvider] 🔄 Reloading messages for conversation:',
            activeConversation.id
        );

        try {
            // Reload messages without changing active conversation
            const messagesResponse = await ChatService.getMessages(activeConversation.id, {
                limit: 50,
                messagesOnly: false,
                includeSenderInfo: true,
                includeReceiverInfo: true,
            });

            const paginationData = messagesResponse.data;
            const timelineItems = paginationData.items || [];
            const extractedMessages = Array.isArray(timelineItems)
                ? [...timelineItems].reverse()
                : [];

            setMessages(extractedMessages);
            setNextCursor(paginationData.nextCursor);
            setPreviousCursor(paginationData.previousCursor);
            setHasMoreOldMessages(paginationData.hasNext);
            setHasMoreNewMessages(paginationData.hasPrevious);

            console.log('[ChatProvider] ✅ Messages reloaded, count:', extractedMessages.length);
        } catch (error) {
            console.error('[ChatProvider] ❌ Error reloading messages:', error);
        }
    }, [activeConversation]);

    // ✅ Update ref when function changes
    useEffect(() => {
        reloadMessagesRef.current = reloadMessages;
    }, [reloadMessages]);

    const createOrGetConversation = useCallback(
        async (otherUserId: string): Promise<ConversationResponse> => {
            try {
                // Try to find existing conversation
                const response = await ChatService.getConversationBetweenUsers(userId, otherUserId);
                return response.data;
            } catch {
                // Create new conversation if not found
                const response = await ChatService.createConversation({
                    participants: [userId, otherUserId],
                });
                return response.data;
            }
        },
        [userId]
    );

    // Message methods
    const loadMessages = useCallback(async (conversationId: string, before?: string) => {
        try {
            const response = await ChatService.getMessages(conversationId, {
                limit: 50,
                before,
                messagesOnly: false,
                includeSenderInfo: true,
                includeReceiverInfo: true,
            });

            // Response is CursorPaginationResponse with pagination metadata
            const paginationData = response.data;
            const timelineItems = paginationData.items || [];

            // Extract messages from timeline items
            // Backend sorts by descending (newest first), but UI needs ascending (oldest first)
            // Keep all timeline items (both messages and call logs)
            const extractedMessages = Array.isArray(timelineItems)
                ? [...timelineItems].reverse() // Reverse to show oldest first, newest last
                : [];

            // Update pagination state
            setNextCursor(paginationData.nextCursor);
            setPreviousCursor(paginationData.previousCursor);
            setHasMoreOldMessages(paginationData.hasNext);
            setHasMoreNewMessages(paginationData.hasPrevious);

            if (before) {
                // Load more older messages - prepend to the beginning
                setMessages((prev) => {
                    const newMessages = [...extractedMessages, ...prev];

                    return newMessages;
                });
            } else {
                // Initial load
                setMessages(extractedMessages);
                console.log('[ChatProvider] 📥 Initial load:', {
                    count: extractedMessages.length,
                    hasMore: paginationData.hasNext,
                    nextCursor: paginationData.nextCursor,
                });
            }
        } catch (error) {
            console.error('[ChatProvider] Error loading messages:', error);
            toast.error('Không thể tải tin nhắn');
        }
    }, []);

    // Load more old messages (scroll up)
    const loadMoreOldMessages = useCallback(async () => {
        if (!activeConversation || !hasMoreOldMessages || isLoadingMoreMessages) {
            console.warn('[ChatProvider] ❌ Cannot load more old messages - condition failed');
            return;
        }

        if (!nextCursor) {
            console.warn('[ChatProvider] ❌ No nextCursor available');
            return;
        }

        setIsLoadingMoreMessages(true);
        try {
            await loadMessages(activeConversation.id, nextCursor);
        } finally {
            setIsLoadingMoreMessages(false);
        }
    }, [activeConversation, hasMoreOldMessages, isLoadingMoreMessages, nextCursor, loadMessages]);

    // Load more new messages (scroll down - less common, usually get via real-time)
    const loadMoreNewMessages = useCallback(async () => {
        if (!activeConversation || !hasMoreNewMessages || isLoadingMoreMessages) {
            return;
        }

        if (!previousCursor) {
            console.warn('[ChatProvider] No previousCursor available');
            return;
        }

        setIsLoadingMoreMessages(true);
        try {
            const response = await ChatService.getMessages(activeConversation.id, {
                limit: 50,
                after: previousCursor, // Use 'after' to load newer messages
                messagesOnly: false,
                includeSenderInfo: true,
                includeReceiverInfo: true,
            });

            const paginationData = response.data;
            const timelineItems = paginationData.items || [];
            // Keep all timeline items (both messages and call logs)
            const extractedMessages = Array.isArray(timelineItems)
                ? [...timelineItems].reverse()
                : [];

            // Update pagination state
            setPreviousCursor(paginationData.previousCursor);
            setHasMoreNewMessages(paginationData.hasPrevious);

            // Append newer messages to the end
            setMessages((prev) => [...prev, ...extractedMessages]);
        } catch (error) {
            console.error('[ChatProvider] Error loading newer messages:', error);
            toast.error('Không thể tải tin nhắn mới hơn');
        } finally {
            setIsLoadingMoreMessages(false);
        }
    }, [activeConversation, hasMoreNewMessages, isLoadingMoreMessages, previousCursor]);

    const sendMessage = useCallback(
        async (content: string, type: MessageType = MessageType.TEXT, files?: File[]) => {
            if (!activeConversation) {
                console.error('[ChatProvider] No active conversation');
                toast.error('Chưa chọn cuộc hội thoại');
                return;
            }

            try {
                // Try to send via SignalR first
                if (chatHub.isConnected && type === MessageType.TEXT && !files) {
                    // Find receiver with case-insensitive comparison

                    const receiverId = activeConversation.participants.find(
                        (p) => p.toLowerCase() !== userId?.toLowerCase()
                    );

                    if (!receiverId) {
                        console.warn('[ChatProvider] ⚠️ No receiver found! Self-conversation?');
                    }

                    await chatHub.sendMessage({
                        conversationId: activeConversation.id,
                        content,
                        receiverId,
                    });
                } else {
                    // Fall back to REST API for files or if SignalR is not connected
                    console.log('[ChatProvider] Using REST API fallback');
                    await sendMessageViaREST(content, type, files);
                }
            } catch (error) {
                console.error('[ChatProvider] ❌ Error sending message:', error);
                toast.error('Không thể gửi tin nhắn');
                throw error;
            }
        },
        [activeConversation, userId, chatHub]
    );

    const sendMessageViaREST = useCallback(
        async (content: string, type: MessageType = MessageType.TEXT, files?: File[]) => {
            if (!activeConversation) return;

            try {
                let response;
                if (files && files.length > 0) {
                    // Send with files
                    response = await ChatService.createMessageWithFiles({
                        conversationId: activeConversation.id,
                        senderId: userId,
                        receiverId: activeConversation.participants.find((p) => p !== userId),
                        content,
                        type,
                        files,
                    });
                } else {
                    // Send text message
                    response = await ChatService.createMessage({
                        conversationId: activeConversation.id,
                        senderId: userId,
                        receiverId: activeConversation.participants.find((p) => p !== userId),
                        content,
                        type,
                    });
                }
                console.log('[ChatProvider] Response:', response);
                // ✅ Don't add to state here - let SignalR handle it to avoid duplicates
                // Backend will broadcast via SignalR, which will add the message via onMessageReceived
            } catch (error) {
                console.error('[ChatProvider] Error sending message via REST:', error);
                throw error;
            }
        },
        [activeConversation, userId, getSenderInfo]
    );

    const markAsRead = useCallback(
        async (messageId: string) => {
            try {
                if (chatHub.isConnected) {
                    await chatHub.markMessageAsRead(messageId);
                } else {
                    await ChatService.markMessageAsRead({ messageId });
                }
            } catch (error) {
                console.error('[ChatProvider] Error marking message as read:', error);
            }
        },
        [chatHub]
    );

    const markAllAsRead = useCallback(
        async (conversationId: string) => {
            try {
                if (chatHub.isConnected) {
                    await chatHub.markAllMessagesAsRead(conversationId);
                } else {
                    const response = await ChatService.markAllMessagesAsRead({
                        conversationId,
                        userId,
                    });

                    // Log if all messages were already read
                    if (response.success && response.data?.markedAllAsRead === false) {
                        console.log(
                            '[ChatProvider] All messages already read in conversation:',
                            conversationId
                        );
                    }
                }

                // Update local state (always reset unread count)
                setConversations((prev) =>
                    prev.map((conv) =>
                        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
                    )
                );
            } catch (error) {
                console.error('[ChatProvider] Error marking all as read:', error);
                // Don't show toast error for "already read" case as it's handled in service
            }
        },
        [userId, chatHub]
    );

    // Typing indicators
    const startTyping = useCallback(() => {
        if (activeConversation && chatHub.isConnected) {
            chatHub.startTyping(activeConversation.id);
        }
    }, [activeConversation, chatHub]);

    const stopTyping = useCallback(() => {
        if (activeConversation && chatHub.isConnected) {
            chatHub.stopTyping(activeConversation.id);
        }
    }, [activeConversation, chatHub]);

    const value: ChatContextValue = useMemo(
        () => ({
            conversations,
            activeConversation,
            messages,
            onlineUsers,
            typingUsers,
            isLoading,
            isLoadingMessages,
            hasMoreOldMessages,
            hasMoreNewMessages,
            isLoadingMoreMessages,
            loadConversations,
            selectConversation,
            createOrGetConversation,
            sendMessage,
            sendMessageViaREST,
            loadMessages,
            loadMoreOldMessages,
            loadMoreNewMessages,
            markAsRead,
            markAllAsRead,
            startTyping,
            stopTyping,
            isConnected: chatHub.isConnected,
        }),
        [
            conversations,
            activeConversation,
            messages,
            onlineUsers,
            typingUsers,
            isLoading,
            isLoadingMessages,
            hasMoreOldMessages,
            hasMoreNewMessages,
            isLoadingMoreMessages,
            loadConversations,
            selectConversation,
            createOrGetConversation,
            sendMessage,
            sendMessageViaREST,
            loadMessages,
            loadMoreOldMessages,
            loadMoreNewMessages,
            markAsRead,
            markAllAsRead,
            startTyping,
            stopTyping,
            chatHub.isConnected,
        ]
    );

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Custom hook to use chat context
export const useChat = (): ChatContextValue => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within ChatProvider');
    }
    return context;
};
