import React from 'react';
import user01 from '@/assets/img/users/user-02.jpg';

interface ChatHeaderProps {
    userName?: string;
    userStatus?: string;
    userAvatar?: string;
    onVideoCallStart?: () => void;
    onVoiceCallStart?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    userName = 'Nguyễn Văn An',
    userStatus = 'Đang hoạt động',
    userAvatar = user01,
    onVideoCallStart,
    onVoiceCallStart,
}) => {
    return (
        <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3 p-3">
            <div className="d-flex align-items-center">
                <span className="avatar me-2 flex-shrink-0">
                    <img src={userAvatar} alt="user" />
                </span>
                <div>
                    <h6 className="fs-14 fw-semibold mb-1">{userName}</h6>
                    <p className="mb-0 d-inline-flex align-items-center">
                        <i className="ti ti-point-filled text-success"></i> {userStatus}
                    </p>
                </div>
            </div>
            <div className="gap-2 d-flex align-items-center flex-wrap">
                <button
                    className="btn btn-icon btn-light"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-original-title="Cuộc gọi thoại"
                    type="button"
                    onClick={onVoiceCallStart}
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
                >
                    <i className="ti ti-video"></i>
                </button>
                <button
                    className="btn btn-icon btn-light"
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-original-title="Thông tin"
                    type="button"
                >
                    <i className="ti ti-info-circle"></i>
                </button>
                <button className="btn btn-icon btn-light close-chat d-md-none" type="button">
                    <i className="ti ti-x"></i>
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
