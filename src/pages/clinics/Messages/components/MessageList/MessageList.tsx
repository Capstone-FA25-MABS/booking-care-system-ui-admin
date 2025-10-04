import React from 'react';
import clsx from 'clsx';
import MessageDropdown from './MessageDropdown';
import { Message } from '../../types';
import styles from '../../Messages.module.scss';

interface MessageListProps {
    messages: Message[];
    onMessageAction: (action: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onMessageAction }) => {
    return (
        <div className={clsx(styles.messageBody, 'message-body')}>
            {messages.map((message, index) => (
                <React.Fragment key={message.id}>
                    {/* Today separator */}
                    {index === 3 && (
                        <div className={styles.dateSeparator}>
                            <span className={clsx(styles.dateBadge, 'badge rounded-pill')}>
                                Today
                            </span>
                        </div>
                    )}

                    <div
                        className={clsx(
                            styles.messageItem,
                            message.isOwn ? styles.ownMessage : styles.receivedMessage
                        )}
                    >
                        <div
                            className={`d-flex align-items-start ${
                                message.isOwn ? 'justify-content-end' : ''
                            }`}
                        >
                            {!message.isOwn && (
                                <span className="avatar online me-2 flex-shrink-0">
                                    <img src={message.avatar} alt="user" />
                                </span>
                            )}

                            <div className="flex-grow-1">
                                <div
                                    className={`d-flex align-items-center mb-1 ${
                                        message.isOwn ? 'justify-content-end' : ''
                                    }`}
                                >
                                    {message.isOwn && (
                                        <p className="mb-0 d-inline-flex align-items-center text-muted small">
                                            <i className="ti ti-checks text-success me-1"></i>
                                            {message.time}
                                            <i className="ti ti-point-filled mx-2"></i>
                                        </p>
                                    )}

                                    <h6 className={clsx(styles.userNameMessage, 'fs-14 mb-0')}>
                                        {message.sender}
                                    </h6>

                                    {!message.isOwn && (
                                        <p className="mb-0 d-inline-flex align-items-center text-muted small">
                                            <i className="ti ti-point-filled mx-2"></i>
                                            {message.time}
                                        </p>
                                    )}
                                </div>

                                <div
                                    className={`d-flex align-items-start ${message.isOwn ? 'justify-content-end' : ''}`}
                                >
                                    {message.isOwn && (
                                        <div className="me-2 align-self-end">
                                            <button
                                                data-bs-toggle="dropdown"
                                                type="button"
                                                className="btn btn-sm border-0 bg-transparent p-1"
                                            >
                                                <i className="ti ti-dots-vertical"></i>
                                            </button>
                                            <MessageDropdown onAction={onMessageAction} />
                                        </div>
                                    )}

                                    <div
                                        className={clsx(
                                            styles.messageBox,
                                            message.isOwn
                                                ? styles.sentMessage
                                                : styles.receiveMessage
                                        )}
                                    >
                                        <p className="mb-0">{message.content}</p>
                                    </div>

                                    {!message.isOwn && (
                                        <div className="ms-2 align-self-end">
                                            <button
                                                data-bs-toggle="dropdown"
                                                type="button"
                                                className="btn btn-sm border-0 bg-transparent p-1"
                                            >
                                                <i className="ti ti-dots-vertical"></i>
                                            </button>
                                            <MessageDropdown onAction={onMessageAction} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {message.isOwn && (
                                <span className="avatar ms-2 online flex-shrink-0">
                                    <img src={message.avatar} alt="user" />
                                </span>
                            )}
                        </div>
                    </div>
                </React.Fragment>
            ))}
        </div>
    );
};

export default MessageList;
