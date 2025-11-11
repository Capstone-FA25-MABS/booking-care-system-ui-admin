import React from 'react';
import styles from './IncomingCallNotification.module.scss';

interface IncomingCallNotificationProps {
    callerName: string;
    callerAvatar?: string;
    onAccept: () => void;
    onDecline: () => void;
}

const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
    callerName,
    callerAvatar,
    onAccept,
    onDecline,
}) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.notification}>
                <div className={styles.header}>
                    <i className="ti ti-phone-incoming text-primary fs-24"></i>
                    <h5 className="mb-0 ms-2">Cuộc gọi đến</h5>
                </div>

                <div className={styles.content}>
                    <div className={styles.avatar}>
                        <img
                            src={callerAvatar || '/default-avatar.png'}
                            alt={callerName}
                            className="rounded-circle"
                        />
                    </div>
                    <h4 className="mt-3 mb-1">{callerName}</h4>
                    <p className="text-muted">đang gọi cho bạn...</p>
                </div>

                <div className={styles.actions}>
                    <button
                        className="btn btn-danger btn-lg me-3"
                        onClick={onDecline}
                        type="button"
                    >
                        <i className="ti ti-phone-off me-2"></i>
                        <span>Từ chối</span>
                    </button>
                    <button className="btn btn-success btn-lg" onClick={onAccept} type="button">
                        <i className="ti ti-phone-check me-2"></i>
                        <span>Chấp nhận</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallNotification;
