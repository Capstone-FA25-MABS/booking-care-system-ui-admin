import React from 'react';
import clsx from 'clsx';
import { User } from '../../../types';
import { Tag } from '@/types/tag.types';
import styles from '../../../Messages.module.scss';

interface UserListItemProps {
    user: User;
    conversationTags?: Tag[];
}

const UserListItem: React.FC<UserListItemProps> = ({ user, conversationTags = [] }) => {
    // Smart tag prioritization - show most important tags first
    const prioritizedTags = React.useMemo(() => {
        if (!conversationTags.length) return [];

        return [...conversationTags].sort((a, b) => {
            // Priority order: URGENT > IMPORTANT > SYSTEM > CUSTOM
            const typeOrder = {
                URGENT: 4,
                IMPORTANT: 3,
                SYSTEM: 2,
                CUSTOM: 1,
            } as const;

            const priorityA = typeOrder[String(a.type) as keyof typeof typeOrder] || 1;
            const priorityB = typeOrder[String(b.type) as keyof typeof typeOrder] || 1;

            // First sort by type priority
            if (priorityA !== priorityB) {
                return priorityB - priorityA;
            }

            // Then by color intensity (brighter/warmer colors first)
            const getColorIntensity = (color: string) => {
                // Convert hex to RGB and calculate brightness
                const hex = color.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                return r * 0.299 + g * 0.587 + b * 0.114;
            };

            return getColorIntensity(b.color) - getColorIntensity(a.color);
        });
    }, [conversationTags]);
    return (
        <div
            className={clsx(
                styles.userListItem,
                'd-flex align-items-center justify-content-between rounded p-2 mb-2',
                { [styles.active]: user.isActive }
            )}
        >
            <div className="d-flex align-items-center flex-grow-1 min-w-0">
                <div className="avatar me-2 flex-shrink-0">
                    <img src={user.avatar} alt="user" />
                </div>
                <div className="min-w-0 flex-grow-1">
                    <div className="d-flex align-items-center mb-1">
                        <h6 className="fs-14 mb-0 text-truncate me-2">
                            <span className="text-decoration-none text-start text-truncate">
                                {user.name}
                            </span>
                        </h6>
                        {/* Zalo-style Tag Dots */}
                        {prioritizedTags.length > 0 && (
                            <div className={clsx(styles.tagDots, 'd-flex align-items-center')}>
                                {prioritizedTags.slice(0, 3).map((tag, index) => (
                                    <span
                                        key={tag.id}
                                        className={clsx(styles.tagDot)}
                                        style={{
                                            backgroundColor: tag.color,
                                            animationDelay: `${index * 100}ms`,
                                        }}
                                        title={`${tag.name} (${String(tag.type).toLowerCase()})`}
                                    />
                                ))}
                                {prioritizedTags.length > 3 && (
                                    <span
                                        className={clsx(
                                            styles.tagMoreIndicator,
                                            'text-muted small'
                                        )}
                                        title={`+${prioritizedTags.length - 3} more tags: ${prioritizedTags
                                            .slice(3)
                                            .map(
                                                (t) => `${t.name} (${String(t.type).toLowerCase()})`
                                            )
                                            .join(', ')}`}
                                    >
                                        +{prioritizedTags.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
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
