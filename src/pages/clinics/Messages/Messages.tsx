import React, { useState } from 'react';
import { mockUsers, mockMessages } from './mockData';

import ChatHeader from './components/ChatHeader';
import ChatUserNav from './components/ChatUserNav';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import EmojiPicker from './components/MessageInput/EmojiPicker';
import VideoCall from './components/VideoCall';
import { User, Message } from './types';
import user02 from '@/assets/img/users/user-02.jpg';
import clsx from 'clsx';
import styles from './Messages.module.scss';

const Messages: React.FC = () => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);
    const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

    // Use imported mock data with type annotations
    const users: User[] = mockUsers;
    const messages: Message[] = mockMessages;

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            console.log('Đang gửi tin nhắn:', messageInput);
            setMessageInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Close emoji picker when Escape is pressed
        if (e.key === 'Escape' && isEmojiPickerVisible) {
            setIsEmojiPickerVisible(false);
            e.preventDefault();
            return;
        }

        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleMessageAction = (action: string) => {
        console.log('Thao tác tin nhắn:', action);
    };

    const handleSearchChange = (value: string) => {
        setSearchKeyword(value);
    };

    const handleInputChange = (value: string) => {
        setMessageInput(value);
    };

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

    const handleEmojiSelect = (emoji: string) => {
        // For now, just append to the end of the message
        // In a real implementation, you might want to handle cursor position
        setMessageInput((prev) => prev + emoji);
    };

    const handleEmojiButtonClick = () => {
        setIsEmojiPickerVisible(!isEmojiPickerVisible);
    };

    const handleEmojiPickerClose = () => {
        setIsEmojiPickerVisible(false);
    };

    return (
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
                            <ChatUserNav
                                users={users}
                                searchKeyword={searchKeyword}
                                onSearchChange={handleSearchChange}
                            />

                            {/* Chat Messages Area */}
                            <div
                                className={clsx(styles.chatMessagesArea, 'flex-fill chat-messages')}
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
                                        className={clsx(styles.messagesContainer, 'card-body p-0')}
                                    >
                                        <MessageList
                                            messages={messages}
                                            onMessageAction={handleMessageAction}
                                        />

                                        {/* Message Input Footer */}
                                        <div className={styles.messageInput}>
                                            <MessageInput
                                                messageInput={messageInput}
                                                onInputChange={handleInputChange}
                                                onSendMessage={handleSendMessage}
                                                onKeyDown={handleKeyDown}
                                                onEmojiSelect={handleEmojiSelect}
                                                onEmojiButtonClick={handleEmojiButtonClick}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Content */}

            {/* Emoji Picker - Positioned absolutely to avoid layout issues */}
            {isEmojiPickerVisible && (
                <div className={styles.emojiPickerOverlay}>
                    <EmojiPicker
                        isVisible={isEmojiPickerVisible}
                        onEmojiSelect={handleEmojiSelect}
                        onClose={handleEmojiPickerClose}
                    />
                </div>
            )}

            {/* Video Call Component */}
            <VideoCall
                isVisible={isVideoCallVisible}
                onClose={handleVideoCallClose}
                participantName="Nguyễn Văn An"
                participantAvatar={user02}
            />
        </div>
    );
};

export default Messages;
