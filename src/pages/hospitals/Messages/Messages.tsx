import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ChatProvider } from '@/providers/ChatProvider';
import ChatHeader from './components/ChatHeader';
import ChatUserNav from './components/ChatUserNav';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import VideoCall from './components/VideoCall';
import { RootState, AppDispatch } from '@/store';
import { fetchProfileByRole } from '@/store/slices/userSlice';
import { Role } from '@/enums/common.enums';
import clsx from 'clsx';
import styles from './Messages.module.scss';

const Messages: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);

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

    const handleVideoCallStart = () => {
        setIsVideoCallVisible(true);
    };

    const handleVideoCallClose = () => {
        setIsVideoCallVisible(false);
    };

    const handleVoiceCallStart = () => {
        // Future implementation for voice call
        console.log('Bắt đầu cuộc gọi thoại');
    };

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
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
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
                                    className={clsx(
                                        styles.chatMessagesArea,
                                        'flex-fill chat-messages'
                                    )}
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
                                            className={clsx(
                                                styles.messagesContainer,
                                                'card-body p-0'
                                            )}
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

                {/* Video Call Component */}
                {isVideoCallVisible && (
                    <VideoCall
                        isVisible={isVideoCallVisible}
                        onClose={handleVideoCallClose}
                        participantName="User"
                        participantAvatar="/default-avatar.png"
                    />
                )}
            </div>
        </ChatProvider>
    );
};

export default Messages;
