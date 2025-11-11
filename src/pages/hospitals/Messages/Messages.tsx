import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { ChatProvider, useChat } from '@/providers/ChatProvider';
import { useGlobalChat } from '@/providers/GlobalChatProvider';
import ChatHeader from './components/ChatHeader';
import ChatUserNav from './components/ChatUserNav';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import VideoCall from './components/VideoCall';
import type { IncomingCallData } from '@/hooks/useChatHub';
import { RootState, AppDispatch } from '@/store';
import { fetchProfileByRole } from '@/store/slices/userSlice';
import { Role } from '@/enums/common.enums';
import clsx from 'clsx';
import styles from './Messages.module.scss';

// Inner component that has access to ChatProvider context
const MessagesContent: React.FC = () => {
    const location = useLocation();
    const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);
    const [currentCall, setCurrentCall] = useState<IncomingCallData | null>(null);

    // ✅ Track if a call is currently being handled to prevent duplicates
    const handlingCallRef = React.useRef<string | null>(null);

    // Get active conversation from ChatProvider
    const { activeConversation } = useChat();

    // Get current user info
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const currentUserId = (userProfile?.accountId || '').toUpperCase();

    // Get other participant info
    const otherParticipant = activeConversation?.participantDetails?.find(
        (p) => (p.id || p.accountId || '').toUpperCase() !== currentUserId
    );

    // Get incoming call from global context
    const { clearIncomingCall } = useGlobalChat();

    // Handle incoming call from navigation state (when accepting from notification)
    useEffect(() => {
        const navState = location.state as { incomingCall?: IncomingCallData };
        if (navState?.incomingCall) {
            const callId = `${navState.incomingCall.callerId}-${navState.incomingCall.conversationId}`;

            // ✅ Check if already handling this call
            if (handlingCallRef.current === callId) {
                console.log('[Messages] ⏭️ Already handling this call, ignoring');
                return;
            }

            console.log(
                '[Messages] 📞 Received incoming call from navigation:',
                navState.incomingCall
            );

            // ✅ Mark as handling
            handlingCallRef.current = callId;

            setCurrentCall(navState.incomingCall);
            setIsVideoCallVisible(true);
            // Clear global incoming call to prevent duplicate
            clearIncomingCall();
            // Clear navigation state
            globalThis.history.replaceState({}, document.title);
        }
    }, [location, clearIncomingCall]);

    // ✅ REMOVED: Auto-accept logic
    // Now GlobalChatProvider will always show IncomingCallNotification
    // User can choose to Accept (navigate here) or Decline

    const handleVideoCallStart = () => {
        if (!activeConversation || !otherParticipant) {
            console.warn('[Messages] Cannot start call: no active conversation or participant');
            return;
        }
        console.log('[Messages] Starting video call with:', otherParticipant.fullName);
        setIsVideoCallVisible(true);
    };

    const handleVideoCallClose = () => {
        console.log('[Messages] Closing video call');
        setIsVideoCallVisible(false);
        setCurrentCall(null);
        // ✅ Reset handling ref when call closes
        handlingCallRef.current = null;
    };

    const handleVoiceCallStart = () => {
        // Future implementation for voice call
        console.log('Bắt đầu cuộc gọi thoại');
    };

    return (
        <div className={clsx(styles.pageWrapper, 'page-wrapper')}>
            {/* Start Content */}
            <div className={clsx(styles.content, 'content')}>
                {/* Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3">
                    <div className="flex-grow-1">
                        <h4 className="fs-18 fw-semibold mb-0">Tin nhắn</h4>
                    </div>
                    <div className="text-end">
                        <ol className="breadcrumb m-0 py-0">
                            <li className="breadcrumb-item">
                                <a href="index.html">Trang chủ</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Tin nhắn
                            </li>
                        </ol>
                    </div>
                </div>
                {/* End Page Header */}

                <div className="card shadow-none mb-0">
                    <div className="card-body p-0">
                        <div className="d-md-flex">
                            {/* Chat User Navigation */}
                            <ChatUserNav />

                            {/* Chat Messages Area */}
                            <div
                                className={clsx(styles.chatMessagesArea, 'flex-fill chat-messages')}
                            >
                                <div className="card border-0 mb-0 h-100 d-flex flex-column">
                                    {/* Chat Header */}
                                    <div className={styles.chatHeader}>
                                        <ChatHeader
                                            onVideoCallStart={handleVideoCallStart}
                                            onVoiceCallStart={handleVoiceCallStart}
                                        />
                                    </div>

                                    {/* Messages Container */}
                                    <div
                                        className={clsx(styles.messagesContainer, 'card-body p-0')}
                                    >
                                        <MessageList />

                                        {/* Message Input Footer */}
                                        <div className={styles.messageInput}>
                                            <MessageInput />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Content */}

            {/* Video Call Component - For Outgoing Calls (initiated from Chat Header) */}
            {isVideoCallVisible && !currentCall && activeConversation && otherParticipant && (
                <VideoCall
                    isVisible={isVideoCallVisible}
                    onClose={handleVideoCallClose}
                    participantId={otherParticipant.id || otherParticipant.accountId || ''}
                    conversationId={activeConversation.id}
                    participantName={otherParticipant.fullName || 'User'}
                    participantAvatar={otherParticipant.avatarUrl}
                    callType="video"
                    isIncoming={false}
                />
            )}

            {/* Video Call Component - For Incoming Calls (from global notification) */}
            {isVideoCallVisible && currentCall && (
                <VideoCall
                    isVisible={isVideoCallVisible}
                    onClose={handleVideoCallClose}
                    participantId={currentCall.callerId}
                    conversationId={currentCall.conversationId}
                    participantName={currentCall.callerName || 'User'}
                    participantAvatar={currentCall.callerAvatar}
                    callType="video"
                    isIncoming={true}
                />
            )}
        </div>
    );
};

const Messages: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();

    // Get current user info from auth state
    const { isAuthenticated, roles } = useSelector((state: RootState) => state.auth);
    const { adminProfile, doctorProfile, hospitalProfile, isLoading } = useSelector(
        (state: RootState) => state.user
    );

    // Get primary role from roles array
    const role = roles && roles.length > 0 ? roles[0] : null;

    // Fetch profile if not loaded yet
    useEffect(() => {
        const userProfile = adminProfile || doctorProfile || hospitalProfile;

        console.log('[Messages] Profile check:', {
            isAuthenticated,
            roles,
            role,
            hasProfile: !!userProfile,
            isLoading,
        });

        // Only dispatch if role is a management role (not PATIENT)
        if (isAuthenticated && role && role !== Role.PATIENT && !userProfile && !isLoading) {
            console.log('[Messages] 🔄 Dispatching fetchProfileByRole for role:', role);
            dispatch(fetchProfileByRole({ role: role as Role.ADMIN | Role.DOCTOR | Role.STAFF }));
        }
    }, [
        isAuthenticated,
        roles,
        role,
        adminProfile,
        doctorProfile,
        hospitalProfile,
        isLoading,
        dispatch,
    ]);

    // Show loading state while profile is being fetched
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    if (!userProfile && isLoading) {
        return (
            <div className={clsx(styles.pageWrapper, 'page-wrapper')}>
                <div className={clsx(styles.content, 'content')}>
                    <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ minHeight: '400px' }}
                    >
                        <div className="text-center">
                            <div className="spinner-border text-primary" aria-label="Đang tải">
                                <output className="visually-hidden">Đang tải...</output>
                            </div>
                            <p className="mt-3 text-muted">Đang tải thông tin người dùng...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ChatProvider>
            <MessagesContent />
        </ChatProvider>
    );
};

export default Messages;
