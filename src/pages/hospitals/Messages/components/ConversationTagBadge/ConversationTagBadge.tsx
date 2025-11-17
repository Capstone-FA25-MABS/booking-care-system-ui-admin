import React from 'react';
import clsx from 'clsx';
import { Tag } from '@/types/tag.types';
import styles from './ConversationTagBadge.module.scss';

interface ConversationTagBadgeProps {
    tags: Tag[];
    maxVisible?: number;
    size?: 'sm' | 'md';
}

const ConversationTagBadge: React.FC<ConversationTagBadgeProps> = ({
    tags,
    maxVisible = 2,
    size = 'sm',
}) => {
    if (!tags || tags.length === 0) return null;

    const visibleTags = tags.slice(0, maxVisible);
    const remainingCount = tags.length - maxVisible;

    return (
        <div className={clsx(styles.tagBadgeContainer, styles[size])}>
            {visibleTags.map((tag) => (
                <span
                    key={tag.id}
                    className={styles.tagBadge}
                    style={{ backgroundColor: tag.color }}
                    title={tag.name}
                >
                    {tag.icon && <span className={styles.icon}>{tag.icon}</span>}
                    {tag.name}
                </span>
            ))}
            {remainingCount > 0 && (
                <span
                    className={styles.moreCount}
                    title={`${tags
                        .slice(maxVisible)
                        .map((t) => t.name)
                        .join(', ')}`}
                >
                    +{remainingCount}
                </span>
            )}
        </div>
    );
};

export default ConversationTagBadge;
