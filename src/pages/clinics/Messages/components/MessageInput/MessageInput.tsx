import React, { useRef } from 'react';
import clsx from 'clsx';
import styles from './MessageInput.module.scss';

interface MessageInputProps {
    messageInput: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onEmojiSelect: (emoji: string) => void;
    onEmojiButtonClick: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
    messageInput,
    onInputChange,
    onSendMessage,
    onKeyDown,
    onEmojiSelect,
    onEmojiButtonClick,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Quick emoji shortcuts
    const quickEmojis = ['😀', '😂', '😍', '👍', '❤️'];

    const handleQuickEmojiClick = (emoji: string) => {
        onEmojiSelect(emoji);
    };
    return (
        <div className={clsx(styles.messageInputContainer)}>
            <div className={clsx(styles.messageFooter, 'message-footer')}>
                <div className={clsx(styles.inputWrapper, 'flex-fill')}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="form-control border-0"
                        placeholder="Nhập tin nhắn..."
                        value={messageInput}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={onKeyDown}
                    />
                </div>
                <div className={clsx(styles.controlsWrapper)}>
                    <button className="btn btn-icon btn-light" type="button">
                        <i className="ti ti-photo-plus"></i>
                    </button>

                    {/* Quick emoji buttons */}
                    <div className={clsx(styles.quickEmojiWrapper)}>
                        {quickEmojis.map((emoji) => (
                            <button
                                key={emoji}
                                className={clsx(styles.quickEmojiButton)}
                                onClick={() => handleQuickEmojiClick(emoji)}
                                title={`Thêm ${emoji}`}
                                type="button"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    <div className={clsx(styles.emojiPickerWrapper)}>
                        <button
                            className="btn btn-icon btn-light"
                            type="button"
                            onClick={onEmojiButtonClick}
                            title="Chọn emoji khác"
                        >
                            <i className="ti ti-mood-smile-beam"></i>
                        </button>
                    </div>

                    <div className={clsx(styles.moreOptionsWrapper)}>
                        <button
                            className="btn btn-icon btn-outline-light"
                            data-bs-toggle="dropdown"
                            aria-label="more options"
                            type="button"
                        >
                            <i className="ti ti-dots-vertical"></i>
                        </button>
                        <ul className="dropdown-menu p-2">
                            <li>
                                <button className="dropdown-item" type="button">
                                    <i className="ti ti-camera-selfie me-2"></i> Máy ảnh
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" type="button">
                                    <i className="ti ti-photo-up me-2"></i> Thư viện ảnh
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" type="button">
                                    <i className="ti ti-music me-2"></i> Âm thanh
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" type="button">
                                    <i className="ti ti-map-pin-share me-2"></i> Vị trí
                                </button>
                            </li>
                            <li>
                                <button className="dropdown-item" type="button">
                                    <i className="ti ti-user-check me-2"></i> Liên hệ
                                </button>
                            </li>
                        </ul>
                    </div>

                    <button className="btn btn-primary" onClick={onSendMessage} type="button">
                        <i className="ti ti-send"></i>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageInput;
