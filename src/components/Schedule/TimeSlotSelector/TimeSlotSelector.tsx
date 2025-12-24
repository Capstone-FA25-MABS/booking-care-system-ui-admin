import React from 'react';
import { AppointmentTime } from '@/types/schedule.types';
import styles from './TimeSlotSelector.module.scss';

interface TimeSlotSelectorProps {
    selectedSlots: AppointmentTime[];
    onChange: (slots: AppointmentTime[]) => void;
    disabled?: boolean;
}

const TIME_SLOT_OPTIONS = [
    { value: AppointmentTime.T08_00, label: '08:00' },
    { value: AppointmentTime.T08_30, label: '08:30' },
    { value: AppointmentTime.T09_00, label: '09:00' },
    { value: AppointmentTime.T09_30, label: '09:30' },
    { value: AppointmentTime.T10_00, label: '10:00' },
    { value: AppointmentTime.T10_30, label: '10:30' },
    { value: AppointmentTime.T11_00, label: '11:00' },
    { value: AppointmentTime.T11_30, label: '11:30' },
    { value: AppointmentTime.T13_00, label: '13:00' },
    { value: AppointmentTime.T13_30, label: '13:30' },
    { value: AppointmentTime.T14_00, label: '14:00' },
    { value: AppointmentTime.T14_30, label: '14:30' },
    { value: AppointmentTime.T15_00, label: '15:00' },
    { value: AppointmentTime.T15_30, label: '15:30' },
    { value: AppointmentTime.T16_00, label: '16:00' },
    { value: AppointmentTime.T16_30, label: '16:30' },
    { value: AppointmentTime.T17_00, label: '17:00' },
    { value: AppointmentTime.T17_30, label: '17:30' },
    { value: AppointmentTime.T18_00, label: '18:00' },
    { value: AppointmentTime.T18_30, label: '18:30' },
    { value: AppointmentTime.T19_00, label: '19:00' },
    { value: AppointmentTime.T19_30, label: '19:30' },
    { value: AppointmentTime.T20_00, label: '20:00' },
    { value: AppointmentTime.T20_30, label: '20:30' },
];

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
    selectedSlots,
    onChange,
    disabled = false,
}) => {
    const handleSlotToggle = (slot: AppointmentTime) => {
        if (disabled) return;

        const isSelected = selectedSlots.includes(slot);
        if (isSelected) {
            onChange(selectedSlots.filter((s) => s !== slot));
        } else {
            onChange([...selectedSlots, slot]);
        }
    };

    const handleSelectAll = () => {
        if (disabled) return;
        onChange(TIME_SLOT_OPTIONS.map((opt) => opt.value));
    };

    const handleClearAll = () => {
        if (disabled) return;
        onChange([]);
    };

    return (
        <div className={styles.timeSlotSelector}>
            <div className={styles.header}>
                <label className="form-label mb-0">
                    Khung giờ khám <span className="text-danger">*</span>
                </label>
                <div className={styles.actions}>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={handleSelectAll}
                        disabled={disabled || selectedSlots.length === TIME_SLOT_OPTIONS.length}
                    >
                        <i className="ti ti-checkbox me-1"></i>
                        Chọn tất cả
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleClearAll}
                        disabled={disabled || selectedSlots.length === 0}
                    >
                        <i className="ti ti-square me-1"></i>
                        Bỏ chọn
                    </button>
                </div>
            </div>

            <div className={styles.slotsGrid}>
                {TIME_SLOT_OPTIONS.map((slot) => {
                    const isSelected = selectedSlots.includes(slot.value);
                    return (
                        <div
                            key={slot.value}
                            className={`${styles.slotCard} ${isSelected ? styles.selected : ''} ${
                                disabled ? styles.disabled : ''
                            }`}
                            onClick={() => handleSlotToggle(slot.value)}
                        >
                            <div className={styles.slotCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleSlotToggle(slot.value)}
                                    disabled={disabled}
                                    className="form-check-input"
                                />
                            </div>
                            <div className={styles.slotLabel}>
                                <i className="ti ti-clock me-2"></i>
                                {slot.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            <small className="text-muted mt-2 d-block">
                Đã chọn {selectedSlots.length}/{TIME_SLOT_OPTIONS.length} khung giờ
            </small>
        </div>
    );
};

export default TimeSlotSelector;
