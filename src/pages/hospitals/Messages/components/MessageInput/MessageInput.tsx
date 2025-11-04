import React, { useState, useRef } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { MessageType } from '@/types/communication.types';
import clsx from 'clsx';
import styles from './MessageInput.module.scss';
import EmojiPicker from './EmojiPicker';

const MessageInput: React.FC = () => {
    const { sendMessage, activeConversation, startTyping, stopTyping } = useChat();
    const [messageInput, setMessageInput] = useState('');
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSendMessage = async () => {
        if (!messageInput.trim() && selectedFiles.length === 0) return;
        if (!activeConversation) return;

        try {
            // Determine message type based on files
            let messageType = MessageType.TEXT;
            if (selectedFiles.length > 0) {
                const firstFile = selectedFiles[0];
                if (firstFile.type.startsWith('image/')) {
                    messageType = MessageType.IMAGE;
                } else if (firstFile.type.startsWith('video/')) {
                    messageType = MessageType.VIDEO;
                } else if (firstFile.type.startsWith('audio/')) {
                    messageType = MessageType.AUDIO;
                } else {
                    messageType = MessageType.FILE;
                }
            }

            await sendMessage(
                messageInput,
                messageType,
                selectedFiles.length > 0 ? selectedFiles : undefined
            );
            setMessageInput('');
            setSelectedFiles([]);
            stopTyping();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Close emoji picker when Escape is pressed
        if (e.key === 'Escape' && isEmojiPickerVisible) {
            setIsEmojiPickerVisible(false);
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);

        // Typing indicators
        if (value.trim()) {
            startTyping();

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 3 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                stopTyping();
            }, 3000);
        } else {
            stopTyping();
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setMessageInput((prev) => prev + emoji);
        setIsEmojiPickerVisible(false);
    };

    const handleEmojiButtonClick = () => {
        setIsEmojiPickerVisible(!isEmojiPickerVisible);
    };

    const handleEmojiPickerClose = () => {
        setIsEmojiPickerVisible(false);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(files);
    };

    const handleAttachClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={clsx(styles.messageInputContainer, 'message-input-container')}>
            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className={clsx(styles.selectedFiles, 'p-2 bg-light border-top')}>
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} className="d-inline-block me-2">
                            <span className="badge bg-primary">
                                {file.name}
                                <button
                                    className="btn-close btn-close-white ms-2"
                                    onClick={() =>
                                        setSelectedFiles((prev) => prev.filter((_, i) => i !== idx))
                                    }
                                ></button>
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className={clsx(styles.inputArea, 'd-flex align-items-center gap-2 p-3')}>
                {/* Attach Button */}
                <button
                    className="btn btn-icon btn-light"
                    onClick={handleAttachClick}
                    title="Đính kèm file"
                    type="button"
                >
                    <i className="ti ti-paperclip"></i>
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                />

                {/* Emoji Button */}
                <button
                    className="btn btn-icon btn-light"
                    onClick={handleEmojiButtonClick}
                    title="Emoji"
                    type="button"
                >
                    <i className="ti ti-mood-smile"></i>
                </button>

                {/* Message Input */}
                <div className="flex-fill">
                    <textarea
                        className="form-control"
                        placeholder="Nhập tin nhắn..."
                        value={messageInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={1}
                        style={{ resize: 'none' }}
                        disabled={!activeConversation}
                    />
                </div>

                {/* Send Button */}
                <button
                    className="btn btn-primary"
                    onClick={handleSendMessage}
                    disabled={
                        !activeConversation || (!messageInput.trim() && selectedFiles.length === 0)
                    }
                    type="button"
                >
                    <i className="ti ti-send"></i>
                </button>
            </div>

            {/* Emoji Picker */}
            {isEmojiPickerVisible && (
                <div className={styles.emojiPickerOverlay}>
                    <EmojiPicker
                        isVisible={isEmojiPickerVisible}
                        onEmojiSelect={handleEmojiSelect}
                        onClose={handleEmojiPickerClose}
                    />
                </div>
            )}
        </div>
    );
};

export default MessageInput;
