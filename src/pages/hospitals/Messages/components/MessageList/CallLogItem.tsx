import { CallLogResponse, CallType, CallStatus } from '@/types/communication.types';

interface CallLogItemProps {
    callLog: CallLogResponse;
    isOwn: boolean;
}

const CallLogItem = ({ callLog, isOwn }: CallLogItemProps) => {
    // Format duration
    const formatDuration = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds} giây`;
        }
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (remainingSeconds === 0) {
            return `${minutes} phút`;
        }
        return `${minutes} phút ${remainingSeconds} giây`;
    };

    // Get call icon and label
    const getCallInfo = () => {
        const isVideo = callLog.type === CallType.Video;
        const icon = isVideo ? 'ti ti-video' : 'ti ti-phone';
        const typeLabel = isVideo ? 'Video' : 'Cuộc gọi';

        // Status labels
        const statusInfo = (() => {
            switch (callLog.status) {
                case CallStatus.Accepted:
                    return {
                        label: formatDuration(callLog.duration || 0),
                        color: 'text-success',
                    };
                case CallStatus.Missed:
                    return {
                        label: 'Cuộc gọi nhỡ',
                        color: 'text-danger',
                    };
                case CallStatus.Rejected:
                    return {
                        label: 'Đã từ chối',
                        color: 'text-muted',
                    };
                default:
                    return {
                        label: 'Cuộc gọi',
                        color: 'text-muted',
                    };
            }
        })();

        return { icon, typeLabel, statusInfo };
    };

    const { icon, typeLabel, statusInfo } = getCallInfo();

    // Format timestamp
    const formatTimestamp = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={`chats ${isOwn ? 'chats-right' : ''}`}>
            {!isOwn && (
                <div className="chat-avatar">
                    <i className={`${icon} fs-5 text-primary`}></i>
                </div>
            )}
            <div className="chat-content">
                <div
                    className="message-content"
                    style={{
                        backgroundColor: isOwn ? '#dcf8c6' : '#f0f0f0',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        maxWidth: '300px',
                    }}
                >
                    <div className="d-flex align-items-center gap-2">
                        <i className={`${icon} ${statusInfo.color}`}></i>
                        <div className="flex-grow-1">
                            <div className="fw-medium">{typeLabel}</div>
                            <div className={`small ${statusInfo.color}`}>{statusInfo.label}</div>
                        </div>
                    </div>
                </div>
                <div className="chat-time">
                    <div>
                        <div className="time">{formatTimestamp(callLog.startedAt)}</div>
                    </div>
                </div>
            </div>
            {isOwn && (
                <div className="chat-avatar">
                    <i className={`${icon} fs-5 text-primary`}></i>
                </div>
            )}
        </div>
    );
};

export default CallLogItem;
