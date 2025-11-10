import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/providers/ChatProvider';
import { MessageType } from '@/types/communication.types';
import clsx from 'clsx';
import { toast } from 'react-toastify';
import styles from './MessageInput.module.scss';
import EmojiPicker from './EmojiPicker';

const MessageInput: React.FC = () => {
    const { sendMessage, activeConversation, startTyping, stopTyping } = useChat();
    const [messageInput, setMessageInput] = useState('');
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionRef = useRef<any>(null);

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

    // ✅ Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition =
            (globalThis as any).SpeechRecognition || (globalThis as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn('[STT] Speech Recognition API not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'vi-VN';

        recognition.onstart = () => {
            console.log('[STT] 🎤 Listening started...');
            setIsListening(true);
            setTranscript('');
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPart = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscript += transcriptPart + ' ';
                    console.log('[STT] ✅ Final result:', transcriptPart);
                } else {
                    interimTranscript += transcriptPart;
                    console.log('[STT] 🔄 Interim:', interimTranscript);
                }
            }

            if (finalTranscript) {
                setTranscript((prev) => prev + finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('[STT] ❌ Error:', event.error);
            toast.error(`Lỗi: ${event.error}`);
            setIsListening(false);
        };

        recognition.onend = () => {
            console.log('[STT] 🎤 Listening ended');
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    // ✅ Auto-add transcript to message when it updates
    useEffect(() => {
        if (transcript.trim() && !isListening) {
            console.log('[STT] 📝 Transcript ready:', transcript);
            setMessageInput((prev) => {
                const newMessage = prev + transcript;
                console.log('[STT] ✅ Auto-added to input:', newMessage);
                return newMessage;
            });
            setTranscript('');
        }
    }, [transcript, isListening]);

    // ✅ Handle microphone button click
    const handleMicrophoneClick = () => {
        if (!recognitionRef.current) {
            toast.error('Speech Recognition không được hỗ trợ trên trình duyệt này');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
        }
    };

    return (
        <div className={clsx(styles.messageInputContainer, 'message-input-container')}>
            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className={clsx(styles.selectedFiles, 'p-2 bg-light border-top')}>
                    {selectedFiles.map((file, idx) => (
                        <div
                            key={`${file.name}-${file.size}-${idx}`}
                            className="d-inline-block me-2"
                        >
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

                {/* Microphone Button - Speech to Text */}
                <button
                    className={clsx('btn btn-icon btn-light', { 'btn-danger': isListening })}
                    onClick={handleMicrophoneClick}
                    title={isListening ? 'Dừng ghi âm' : 'Bắt đầu ghi âm'}
                    type="button"
                    disabled={!activeConversation}
                    style={{
                        transition: 'all 0.3s ease',
                        boxShadow: isListening ? '0 0 8px rgba(220, 53, 69, 0.5)' : 'none',
                    }}
                >
                    <i
                        className={clsx('ti ti-microphone', {
                            'animate-pulse': isListening,
                        })}
                        style={{
                            animation: isListening ? 'pulse 1s infinite' : 'none',
                            color: isListening ? '#ffffff' : 'currentColor',
                        }}
                    ></i>
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
