import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useChat } from '@/providers/ChatProvider';
import { RootState } from '@/store';
import TagManager from '../TagManager';
import trustcare from '@/assets/img/icons/trustcare.svg';

interface ChatHeaderProps {
    onVideoCallStart?: () => void;
    onVoiceCallStart?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onVideoCallStart, onVoiceCallStart }) => {
    const { activeConversation, onlineUsers } = useChat();
    const [showTagManager, setShowTagManager] = useState(false);
    const tagManagerRef = React.useRef<HTMLDivElement>(null);

    // Get current user profile
    const { adminProfile, doctorProfile, hospitalProfile } = useSelector(
        (state: RootState) => state.user
    );
    const userProfile = adminProfile || doctorProfile || hospitalProfile;
    const currentUserId = (userProfile?.accountId || '').toUpperCase();

    // Function to reload conversation tags (can be called from TagManager)
    const loadConversationTags = async () => {
        // Dispatch custom event to notify ChatUserNav to reload tags
        window.dispatchEvent(new CustomEvent('conversationTagsUpdated'));
    };

    // Close tag manager when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tagManagerRef.current && !tagManagerRef.current.contains(event.target as Node)) {
                setShowTagManager(false);
            }
        };

        if (showTagManager) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTagManager]);

    // Get other participant info
    const otherParticipant = activeConversation?.participantDetails?.find(
        (p) => (p.id || p.accountId || '').toUpperCase() !== currentUserId
    );

    // Check online status - normalize to UPPERCASE
    const isOnline = otherParticipant
        ? onlineUsers.has((otherParticipant.id || otherParticipant.accountId || '').toUpperCase())
        : false;

    return (
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3 p-3">
            <div className="d-flex align-items-center">
                {activeConversation && otherParticipant ? (
                    <>
                        <span className="avatar me-2 flex-shrink-0">
                            <img src={otherParticipant.avatarUrl || trustcare} alt="user" />
                        </span>
                        <div>
                            <h6 className="fs-14 fw-semibold mb-1">{otherParticipant.fullName}</h6>
                            <p className="mb-0 d-inline-flex align-items-center">
                                <i
                                    className={`ti ti-point-filled ${isOnline ? 'text-success' : 'text-muted'}`}
                                ></i>
                                {isOnline ? 'Đang hoạt động' : 'Offline'}
                            </p>
                        </div>
                    </>
                ) : (
                    <h6 className="fs-14 fw-semibold mb-0">Chọn hội thoại</h6>
                )}
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
                <button
                    className="btn btn-icon btn-light"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-original-title="Cuộc gọi thoại"
                    type="button"
                    onClick={onVoiceCallStart}
                    disabled={!activeConversation}
                >
                    <i className="ti ti-phone"></i>
                </button>
                <button
                    className="btn btn-icon btn-light"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-original-title="Cuộc gọi video"
                    type="button"
                    onClick={onVideoCallStart}
                    disabled={!activeConversation}
                >
                    <i className="ti ti-video"></i>
                </button>
                <button
                    className="btn btn-icon btn-light"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-original-title="Quản lý nhãn"
                    type="button"
                    onClick={() => setShowTagManager(!showTagManager)}
                    disabled={!activeConversation}
                >
                    <i className="ti ti-tag"></i>
                </button>
                <button
                    className="btn btn-icon btn-light"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-original-title="Thông tin"
                    type="button"
                    disabled={!activeConversation}
                >
                    <i className="ti ti-info-circle"></i>
                </button>
                <button className="btn btn-icon btn-light close-chat d-md-none" type="button">
                    <i className="ti ti-x"></i>
                </button>
            </div>

            {/* Tag Manager Dropdown */}
            {showTagManager && activeConversation && (
                <div
                    ref={tagManagerRef}
                    style={{
                        position: 'absolute',
                        top: '3.5rem',
                        right: '1rem',
                        zIndex: 1000,
                        backgroundColor: 'white',
                        borderRadius: '0.375rem',
                        boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                        width: '300px',
                        maxHeight: '400px',
                        overflow: 'auto',
                    }}
                >
                    <TagManager
                        userId={currentUserId}
                        conversationId={activeConversation.id}
                        showConversationTags={true}
                        onTagsUpdated={loadConversationTags}
                    />
                </div>
            )}
        </div>
    );
};

export default ChatHeader;
