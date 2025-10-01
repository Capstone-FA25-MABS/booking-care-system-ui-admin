import React from 'react';
import clsx from 'clsx';
import Overlay from '../../common/Overlay';
import styles from './EmojiPicker.module.scss';

interface EmojiPickerProps {
    isVisible: boolean;
    onEmojiSelect: (emoji: string) => void;
    onClose: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ isVisible, onEmojiSelect, onClose }) => {
    const emojiCategories = {
        'Mặt cười': [
            '😀',
            '😃',
            '😄',
            '😁',
            '😆',
            '😅',
            '😂',
            '🤣',
            '😊',
            '😇',
            '🙂',
            '🙃',
            '😉',
            '😌',
            '😍',
            '🥰',
            '😘',
            '😗',
            '😙',
            '😚',
        ],
        'Cảm xúc': [
            '😋',
            '😛',
            '😝',
            '😜',
            '🤪',
            '🤨',
            '🧐',
            '🤓',
            '😎',
            '🤩',
            '🥳',
            '😏',
            '😒',
            '😞',
            '😔',
            '😟',
            '😕',
            '🙁',
            '☹️',
            '😣',
        ],
        'Trái tim': [
            '❤️',
            '🧡',
            '💛',
            '💚',
            '💙',
            '💜',
            '🤎',
            '🖤',
            '🤍',
            '💕',
            '💞',
            '💓',
            '💗',
            '💖',
            '💘',
            '💝',
            '💟',
            '❣️',
            '💔',
            '❤️‍🔥',
        ],
        'Tay và cử chỉ': [
            '👍',
            '👎',
            '👌',
            '🤌',
            '🤏',
            '✌️',
            '🤞',
            '🤟',
            '🤘',
            '🤙',
            '👈',
            '👉',
            '👆',
            '🖕',
            '👇',
            '☝️',
            '👋',
            '🤚',
            '🖐️',
            '✋',
        ],
        'Hoạt động': [
            '⚽',
            '🏀',
            '🏈',
            '⚾',
            '🥎',
            '🎾',
            '🏐',
            '🏉',
            '🥏',
            '🎱',
            '🪀',
            '🏓',
            '🏸',
            '🏒',
            '🏑',
            '🥍',
            '🏏',
            '🪃',
            '🥅',
            '⛳',
        ],
        'Thực phẩm': [
            '🍎',
            '🍐',
            '🍊',
            '🍋',
            '🍌',
            '🍉',
            '🍇',
            '🍓',
            '🫐',
            '🍈',
            '🍒',
            '🍑',
            '🥭',
            '🍍',
            '🥥',
            '🥝',
            '🍅',
            '🍆',
            '🥑',
            '🥦',
        ],
    };

    if (!isVisible) return null;

    return (
        <>
            {/* Overlay để đóng khi click bên ngoài */}
            <Overlay isVisible={isVisible} onClick={onClose} />

            <div className={clsx(styles.emojiPicker, 'card shadow')}>
                <div className={styles.header}>
                    <h6 className="mb-0">Chọn emoji</h6>
                    <button className="btn btn-sm btn-light" onClick={onClose} type="button">
                        <i className="ti ti-x"></i>
                    </button>
                </div>

                <div className={styles.content}>
                    {Object.entries(emojiCategories).map(([category, emojis]) => (
                        <div key={category} className={styles.category}>
                            <div className={styles.categoryTitle}>{category}</div>
                            <div className={styles.emojiGrid}>
                                {emojis.map((emoji, index) => (
                                    <button
                                        key={`${category}-${index}`}
                                        className={styles.emojiButton}
                                        onClick={() => onEmojiSelect(emoji)}
                                        type="button"
                                        title={emoji}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default EmojiPicker;
