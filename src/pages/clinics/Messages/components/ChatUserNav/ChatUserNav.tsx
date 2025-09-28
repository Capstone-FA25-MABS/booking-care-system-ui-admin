import React from 'react';
import clsx from 'clsx';
import styles from '../../Messages.module.scss';
import UserListItem from './UserListItem';
import { User } from '../../types';
import user01 from '@/assets/img/users/user-02.jpg';

interface ChatUserNavProps {
    users: User[];
    searchKeyword: string;
    onSearchChange: (value: string) => void;
}

const ChatUserNav: React.FC<ChatUserNavProps> = ({ users, searchKeyword, onSearchChange }) => {
    return (
        <div className={clsx(styles.chatUserNav, 'chat-user-nav')}>
            {/* Current User Info */}
            <div
                className={clsx(
                    styles.userInfo,
                    'd-flex align-items-center justify-content-between p-3'
                )}
            >
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

            {/* Search Section */}
            <div className={clsx(styles.searchSection, 'p-3')}>
                <div className="input-group w-auto input-group-flat">
                    <span className="input-group-text border-end-0">
                        <i className="ti ti-search"></i>
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Keyword"
                        value={searchKeyword}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* User List Container */}
            <div className={styles.userListContainer}>
                <div className={clsx(styles.chatUsers, 'p-3')}>
                    <h6>All Messages</h6>
                    {users.map((user) => (
                        <UserListItem key={user.id} user={user} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ChatUserNav;
