import React, { useState } from 'react';
import { mockUsers, mockMessages } from './mockData';

import clsx from 'clsx';
import styles from './Messages.module.scss';
import user01 from '@/assets/img/users/user-02.jpg';
interface MessageDropdownProps {
    onAction?: (action: string) => void;
}

const MessageDropdown: React.FC<MessageDropdownProps> = ({ onAction }) => (
    <ul className="dropdown-menu p-2">
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

const Messages: React.FC = () => {
    const [searchKeyword, setSearchKeyword] = useState('');
    const [messageInput, setMessageInput] = useState('');

    // Use imported mock data
    const users = mockUsers;
    const messages = mockMessages;

    const handleSendMessage = () => {
        if (messageInput.trim()) {
            console.log('Sending message:', messageInput);
            setMessageInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const handleMessageAction = (action: string) => {
        console.log('Message action:', action);
    };

    return (
        <div className={clsx(styles.pageWrapper, 'page-wrapper')}>
            {/* Start Content */}
            <div className={clsx(styles.content, 'content')}>
                {/* Page Header */}
                <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3">
                    <div className="flex-grow-1">
                        <h4 className="fs-18 fw-semibold mb-0">Message</h4>
                    </div>
                    <div className="text-end">
                        <ol className="breadcrumb m-0 py-0">
                            <li className="breadcrumb-item">
                                <a href="index.html">Home</a>
                            </li>
                            <li className="breadcrumb-item active" aria-current="page">
                                Message
                            </li>
                        </ol>
                    </div>
                </div>
                {/* End Page Header */}

                <div className="card shadow-none mb-0">
                    <div className="card-body p-0">
                        <div className="d-md-flex">
                            {/* Chat User Navigation */}
                            <div className="chat-user-nav">
                                <div>
                                    {/* Current User Info */}
                                    <div className="d-flex align-items-center justify-content-between border-bottom p-3">
                                        <div className="d-flex align-items-center">
                                            <span className="avatar me-2 flex-shrink-0">
                                                <img src={user01} alt="user" />
                                            </span>
                                            <div>
                                                <h6 className="fs-14 mb-1">James Hong</h6>
                                                <p className="mb-0">Admin</p>
                                            </div>
                                        </div>
                                        <button
                                            className="btn p-2 btn-primary"
                                            data-bs-toggle="tooltip"
                                            data-bs-placement="top"
                                            data-bs-title="New Chat"
                                            type="button"
                                        >
                                            <i className="ti ti-plus"></i>
                                        </button>
                                    </div>

                                    {/* Search and User List */}
                                    <div>
                                        <div className="input-group w-auto input-group-flat p-4 pb-0">
                                            <span className="input-group-text border-end-0">
                                                <i className="ti ti-search"></i>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search Keyword"
                                                value={searchKeyword}
                                                onChange={(e) => setSearchKeyword(e.target.value)}
                                            />
                                        </div>

                                        <div
                                            className={clsx(styles.chatUsers, 'chat-users p-4')}
                                            data-simplebar
                                        >
                                            <h6 className="mb-3">All Messages</h6>

                                            {users.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className={`d-flex align-items-center justify-content-between rounded p-3 user-list mb-1 ${
                                                        user.isActive ? 'active' : ''
                                                    }`}
                                                >
                                                    <div className="d-flex align-items-center">
                                                        <button
                                                            className="avatar me-2 flex-shrink-0 border-0 bg-transparent p-0"
                                                            type="button"
                                                        >
                                                            <img src={user.avatar} alt="user" />
                                                        </button>
                                                        <div>
                                                            <h6 className="fs-14 mb-1">
                                                                <button
                                                                    className="text-decoration-none border-0 bg-transparent p-0 text-start"
                                                                    type="button"
                                                                >
                                                                    {user.name}
                                                                </button>
                                                            </h6>
                                                            <p className="mb-0 text-truncate">
                                                                {user.lastMessage}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="text-dark d-block mb-1">
                                                            {user.time}
                                                        </span>
                                                        {user.unreadCount > 0 ? (
                                                            <span className="badge ms-auto bg-danger rounded-circle message-count">
                                                                {user.unreadCount}
                                                            </span>
                                                        ) : (
                                                            <span className="d-block text-success">
                                                                <i className="ti ti-checks"></i>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages Area */}
                            <div className="flex-fill chat-messages">
                                <div className="card border-0 mb-0">
                                    {/* Chat Header */}
                                    <div className="card-header d-flex align-items-center justify-content-between flex-wrap row-gap-3 p-3">
                                        <div className="d-flex align-items-center">
                                            <span className="avatar me-2 flex-shrink-0">
                                                <img src={user01} alt="user" />
                                            </span>
                                            <div>
                                                <h6 className="fs-14 fw-semibold mb-1">
                                                    Mark Smith
                                                </h6>
                                                <p className="mb-0 d-inline-flex align-items-center">
                                                    <i className="ti ti-point-filled text-success"></i>{' '}
                                                    Online
                                                </p>
                                            </div>
                                        </div>
                                        <div className="gap-2 d-flex align-items-center flex-wrap">
                                            <button
                                                className="btn btn-icon btn-light"
                                                data-bs-toggle="tooltip"
                                                data-bs-placement="top"
                                                data-bs-original-title="Voice Call"
                                                type="button"
                                            >
                                                <i className="ti ti-phone"></i>
                                            </button>
                                            <button
                                                className="btn btn-icon btn-light"
                                                data-bs-toggle="tooltip"
                                                data-bs-placement="top"
                                                data-bs-original-title="Video Call"
                                                type="button"
                                            >
                                                <i className="ti ti-video"></i>
                                            </button>
                                            <button
                                                className="btn btn-icon btn-light"
                                                data-bs-toggle="tooltip"
                                                data-bs-placement="top"
                                                data-bs-original-title="Info"
                                                type="button"
                                            >
                                                <i className="ti ti-info-circle"></i>
                                            </button>
                                            <button
                                                className="btn btn-icon btn-light close-chat d-md-none"
                                                type="button"
                                            >
                                                <i className="ti ti-x"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages Body */}
                                    <div className="card-body p-0">
                                        <div className="message-body p-4" data-simplebar>
                                            {messages.map((message, index) => (
                                                <React.Fragment key={message.id}>
                                                    {/* Today separator */}
                                                    {index === 3 && (
                                                        <div className="text-center">
                                                            <span className="badge bg-light rounded-pill px-3 text-dark fs-14">
                                                                Today
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`chat-list mb-3 ${
                                                            message.isOwn ? 'ms-auto' : ''
                                                        }`}
                                                    >
                                                        <div
                                                            className={`d-flex align-items-start ${
                                                                message.isOwn
                                                                    ? 'justify-content-end'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {!message.isOwn && (
                                                                <span className="avatar online me-2 flex-shrink-0">
                                                                    <img
                                                                        src={message.avatar}
                                                                        alt="user"
                                                                    />
                                                                </span>
                                                            )}

                                                            <div>
                                                                <div
                                                                    className={`d-flex align-items-center mb-1 ${
                                                                        message.isOwn
                                                                            ? 'justify-content-end'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    {message.isOwn && (
                                                                        <p className="mb-0 d-inline-flex align-items-center">
                                                                            <i className="ti ti-checks text-success me-1"></i>
                                                                            {message.time}
                                                                            <i className="ti ti-point-filled mx-2"></i>
                                                                        </p>
                                                                    )}

                                                                    <h6 className="fs-14 mb-0">
                                                                        {message.sender}
                                                                    </h6>

                                                                    {!message.isOwn && (
                                                                        <p className="mb-0 d-inline-flex align-items-center">
                                                                            <i className="ti ti-point-filled mx-2"></i>
                                                                            {message.time}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                <div className="d-flex align-items-center">
                                                                    {message.isOwn && (
                                                                        <div className="me-2">
                                                                            <button
                                                                                data-bs-toggle="dropdown"
                                                                                type="button"
                                                                                className="border-0 bg-transparent"
                                                                            >
                                                                                <i className="ti ti-dots-vertical"></i>
                                                                            </button>
                                                                            <MessageDropdown
                                                                                onAction={
                                                                                    handleMessageAction
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    <div
                                                                        className={`message-box p-3 ${
                                                                            message.isOwn
                                                                                ? 'sent-message'
                                                                                : 'receive-message'
                                                                        }`}
                                                                    >
                                                                        <p className="mb-0 fs-16">
                                                                            {message.content}
                                                                        </p>
                                                                    </div>

                                                                    {!message.isOwn && (
                                                                        <div className="ms-2">
                                                                            <button
                                                                                data-bs-toggle="dropdown"
                                                                                type="button"
                                                                                className="border-0 bg-transparent"
                                                                            >
                                                                                <i className="ti ti-dots-vertical"></i>
                                                                            </button>
                                                                            <MessageDropdown
                                                                                onAction={
                                                                                    handleMessageAction
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {message.isOwn && (
                                                                <span className="avatar ms-2 online flex-shrink-0">
                                                                    <img
                                                                        src={message.avatar}
                                                                        alt="user"
                                                                    />
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        {/* Message Input Footer */}
                                        <div className="message-footer d-flex align-items-center border-top p-3">
                                            <div className="flex-fill">
                                                <input
                                                    type="text"
                                                    className="form-control border-0"
                                                    placeholder="Type Something..."
                                                    value={messageInput}
                                                    onChange={(e) =>
                                                        setMessageInput(e.target.value)
                                                    }
                                                    onKeyDown={handleKeyDown}
                                                />
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <button
                                                    className="btn btn-icon btn-light"
                                                    type="button"
                                                >
                                                    <i className="ti ti-photo-plus"></i>
                                                </button>
                                                <button
                                                    className="btn btn-icon btn-light"
                                                    type="button"
                                                >
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
                                                            <button
                                                                className="dropdown-item"
                                                                type="button"
                                                            >
                                                                <i className="ti ti-camera-selfie me-2"></i>{' '}
                                                                Camera
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                type="button"
                                                            >
                                                                <i className="ti ti-photo-up me-2"></i>{' '}
                                                                Gallery
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                type="button"
                                                            >
                                                                <i className="ti ti-music me-2"></i>{' '}
                                                                Audio
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                type="button"
                                                            >
                                                                <i className="ti ti-map-pin-share me-2"></i>{' '}
                                                                Location
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                className="dropdown-item"
                                                                type="button"
                                                            >
                                                                <i className="ti ti-user-check me-2"></i>{' '}
                                                                Contact
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleSendMessage}
                                                    type="button"
                                                >
                                                    <i className="ti ti-send"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* End Content */}
        </div>
    );
};

export default Messages;
