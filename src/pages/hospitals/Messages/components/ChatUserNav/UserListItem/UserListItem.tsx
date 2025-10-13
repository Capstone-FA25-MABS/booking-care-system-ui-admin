import React from 'react';
import clsx from 'clsx';
import { User } from '../../../types';
import styles from '../../../Messages.module.scss';

interface UserListItemProps {
    user: User;
}

const UserListItem: React.FC<UserListItemProps> = ({ user }) => {
    return (
        <div
            className={clsx(
                styles.userListItem,
                'd-flex align-items-center justify-content-between rounded p-2 mb-2',
                { [styles.active]: user.isActive }
            )}
        >
            <div className="d-flex align-items-center flex-grow-1 min-w-0">
                <button
                    className="avatar me-2 flex-shrink-0 border-0 bg-transparent p-0"
                    type="button"
                >
                    <img src={user.avatar} alt="user" />
                </button>
                <div className="min-w-0 flex-grow-1">
                    <h6 className="fs-14 mb-1 text-truncate">
                        <button
                            className="text-decoration-none border-0 bg-transparent p-0 text-start w-100 text-truncate"
                            type="button"
                        >
                            {user.name}
                        </button>
                    </h6>
                    <p className={clsx(styles.userMessage, 'mb-0 text-muted small')}>
                        {user.lastMessage}
                    </p>
                </div>
            </div>
            <div className={clsx(styles.readHistory, 'text-end flex-shrink-0 ms-2')}>
                <span className="text-muted d-block mb-1 small">{user.time}</span>
                {user.unreadCount > 0 ? (
                    <span className={clsx(styles.messageCount, 'badge bg-danger rounded-circle')}>
                        {user.unreadCount}
                    </span>
                ) : (
                    <span className="d-block text-success">
                        <i className="ti ti-checks"></i>
                    </span>
                )}
            </div>
        </div>
    );
};

export default UserListItem;
