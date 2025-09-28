import React from 'react';

interface MessageInputProps {
    messageInput: string;
    onInputChange: (value: string) => void;
    onSendMessage: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
    messageInput,
    onInputChange,
    onSendMessage,
    onKeyDown,
}) => {
    return (
        <div className="message-footer d-flex align-items-center">
            <div className="flex-fill">
                <input
                    type="text"
                    className="form-control border-0"
                    placeholder="Type Something..."
                    value={messageInput}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={onKeyDown}
                />
            </div>
            <div className="d-flex align-items-center gap-2">
                <button className="btn btn-icon btn-light" type="button">
                    <i className="ti ti-photo-plus"></i>
                </button>
                <button className="btn btn-icon btn-light" type="button">
                    <i className="ti ti-mood-smile-beam"></i>
                </button>
                <div>
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
                                <i className="ti ti-camera-selfie me-2"></i> Camera
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" type="button">
                                <i className="ti ti-photo-up me-2"></i> Gallery
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" type="button">
                                <i className="ti ti-music me-2"></i> Audio
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" type="button">
                                <i className="ti ti-map-pin-share me-2"></i> Location
                            </button>
                        </li>
                        <li>
                            <button className="dropdown-item" type="button">
                                <i className="ti ti-user-check me-2"></i> Contact
                            </button>
                        </li>
                    </ul>
                </div>
                <button className="btn btn-primary" onClick={onSendMessage} type="button">
                    <i className="ti ti-send"></i>
                </button>
            </div>
        </div>
    );
};

export default MessageInput;
