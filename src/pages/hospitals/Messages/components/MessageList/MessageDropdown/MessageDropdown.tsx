import React from 'react';

interface MessageDropdownProps {
    onAction?: (action: string) => void;
    canRecall?: boolean;
    isRecalling?: boolean;
}

const MessageDropdown: React.FC<MessageDropdownProps> = ({
    onAction,
    canRecall = false,
    isRecalling = false,
}) => (
    <ul className="dropdown-menu p-2">
        {canRecall && (
            <li>
                <button
                    className="dropdown-item"
                    onClick={() => onAction?.('recall')}
                    type="button"
                    disabled={isRecalling}
                    style={{
                        opacity: isRecalling ? 0.5 : 1,
                        cursor: isRecalling ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isRecalling ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Đang thu hồi...
                        </>
                    ) : (
                        <>
                            <i className="ti ti-rotate-clockwise me-1"></i> Thu hồi tin nhắn
                        </>
                    )}
                </button>
            </li>
        )}
        <li>
            <button className="dropdown-item" onClick={() => onAction?.('reply')} type="button">
                <i className="ti ti-heart me-1"></i> Reply
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={() => onAction?.('forward')} type="button">
                <i className="ti ti-pinned me-1"></i> Forward
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={() => onAction?.('copy')} type="button">
                <i className="ti ti-file-export me-1"></i> Copy
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={() => onAction?.('favorite')} type="button">
                <i className="ti ti-heart me-1"></i> Mark as Favourite
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={() => onAction?.('delete')} type="button">
                <i className="ti ti-trash me-1"></i> Delete
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={() => onAction?.('unread')} type="button">
                <i className="ti ti-check me-1"></i> Mark as Unread
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={() => onAction?.('archive')} type="button">
                <i className="ti ti-box-align-right me-1"></i> Archive Chat
            </button>
        </li>
        <li>
            <button className="dropdown-item" onClick={() => onAction?.('pin')} type="button">
                <i className="ti ti-pinned me-1"></i> Pin Chat
            </button>
        </li>
    </ul>
);

export default MessageDropdown;
