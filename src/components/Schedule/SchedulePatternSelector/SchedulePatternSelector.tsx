import React from 'react';
import { SchedulePattern } from '@/types/schedule.types';
import styles from './SchedulePatternSelector.module.scss';

interface SchedulePatternSelectorProps {
    selectedPatterns: SchedulePattern[];
    onChange: (patterns: SchedulePattern[]) => void;
    disabled?: boolean;
    singleSelect?: boolean; // Optional: allow single or multiple selection
}

const PATTERN_INFO = {
    [SchedulePattern.MORNING]: {
        label: 'Sáng',
        time: '08:00 - 12:00',
        icon: 'ti-sun',
        color: 'warning',
    },
    [SchedulePattern.AFTERNOON]: {
        label: 'Chiều',
        time: '13:00 - 17:00',
        icon: 'ti-sun-high',
        color: 'info',
    },
    [SchedulePattern.EVENING]: {
        label: 'Tối',
        time: '18:00 - 21:00',
        icon: 'ti-moon',
        color: 'primary',
    },
    [SchedulePattern.NIGHT]: {
        label: 'Đêm',
        time: '21:00 - 00:00',
        icon: 'ti-moon-stars',
        color: 'dark',
    },
};

const SchedulePatternSelector: React.FC<SchedulePatternSelectorProps> = ({
    selectedPatterns,
    onChange,
    disabled = false,
}) => {
    const handleTogglePattern = (pattern: SchedulePattern) => {
        if (disabled) return;

        if (selectedPatterns.includes(pattern)) {
            onChange(selectedPatterns.filter((p) => p !== pattern));
        } else {
            onChange([...selectedPatterns, pattern]);
        }
    };

    const handleSelectAll = () => {
        if (disabled) return;
        onChange(Object.values(SchedulePattern));
    };

    const handleClearAll = () => {
        if (disabled) return;
        onChange([]);
    };

    return (
        <div className={styles.patternSelector}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="form-label mb-0">Chọn ca làm việc</label>
                <div className="btn-group btn-group-sm" role="group">
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={handleSelectAll}
                        disabled={disabled}
                    >
                        Chọn tất cả
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleClearAll}
                        disabled={disabled}
                    >
                        Bỏ chọn
                    </button>
                </div>
            </div>

            <div className={styles.patternsGrid}>
                {(Object.keys(PATTERN_INFO) as SchedulePattern[]).map((pattern) => {
                    const info = PATTERN_INFO[pattern];
                    const isSelected = selectedPatterns.includes(pattern);

                    return (
                        <div
                            key={pattern}
                            className={`${styles.patternCard} ${
                                isSelected ? styles.selected : ''
                            } ${disabled ? styles.disabled : ''}`}
                            onClick={() => handleTogglePattern(pattern)}
                            role="button"
                            tabIndex={disabled ? -1 : 0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleTogglePattern(pattern);
                                }
                            }}
                        >
                            <div className={styles.patternCardContent}>
                                <div className={styles.patternIcon}>
                                    <i className={`ti ${info.icon}`}></i>
                                </div>
                                <div className={styles.patternInfo}>
                                    <div className={styles.patternLabel}>{info.label}</div>
                                    <div className={styles.patternTime}>{info.time}</div>
                                </div>
                                <div className={styles.patternCheckbox}>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleTogglePattern(pattern)}
                                        disabled={disabled}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>
                            {isSelected && (
                                <div className={`${styles.selectedBadge} badge bg-${info.color}`}>
                                    <i className="ti ti-check"></i>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SchedulePatternSelector;
