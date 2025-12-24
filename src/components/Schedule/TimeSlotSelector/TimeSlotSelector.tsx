import React from 'react';
import { AppointmentTime } from '@/types/schedule.types';
import styles from './TimeSlotSelector.module.scss';

interface TimeSlotSelectorProps {
    selectedSlots: AppointmentTime[];
    onChange: (slots: AppointmentTime[]) => void;
    disabled?: boolean;
}

// Time slot options matching backend AppointmentTime enum (30-minute intervals)
const TIME_SLOT_OPTIONS = [
    { value: AppointmentTime.AT_08_00_08_30, label: '08:00 - 08:30' },
    { value: AppointmentTime.AT_08_30_09_00, label: '08:30 - 09:00' },
    { value: AppointmentTime.AT_09_00_09_30, label: '09:00 - 09:30' },
    { value: AppointmentTime.AT_09_30_10_00, label: '09:30 - 10:00' },
    { value: AppointmentTime.AT_10_00_10_30, label: '10:00 - 10:30' },
    { value: AppointmentTime.AT_10_30_11_00, label: '10:30 - 11:00' },
    { value: AppointmentTime.AT_11_00_11_30, label: '11:00 - 11:30' },
    { value: AppointmentTime.AT_11_30_12_00, label: '11:30 - 12:00' },
    { value: AppointmentTime.AT_13_00_13_30, label: '13:00 - 13:30' },
    { value: AppointmentTime.AT_13_30_14_00, label: '13:30 - 14:00' },
    { value: AppointmentTime.AT_14_00_14_30, label: '14:00 - 14:30' },
    { value: AppointmentTime.AT_14_30_15_00, label: '14:30 - 15:00' },
    { value: AppointmentTime.AT_15_00_15_30, label: '15:00 - 15:30' },
    { value: AppointmentTime.AT_15_30_16_00, label: '15:30 - 16:00' },
    { value: AppointmentTime.AT_16_00_16_30, label: '16:00 - 16:30' },
    { value: AppointmentTime.AT_16_30_17_00, label: '16:30 - 17:00' },
    { value: AppointmentTime.AT_17_00_17_30, label: '17:00 - 17:30' },
    { value: AppointmentTime.AT_17_30_18_00, label: '17:30 - 18:00' },
    { value: AppointmentTime.AT_18_00_18_30, label: '18:00 - 18:30' },
    { value: AppointmentTime.AT_18_30_19_00, label: '18:30 - 19:00' },
    { value: AppointmentTime.AT_19_00_19_30, label: '19:00 - 19:30' },
    { value: AppointmentTime.AT_19_30_20_00, label: '19:30 - 20:00' },
    { value: AppointmentTime.AT_20_00_20_30, label: '20:00 - 20:30' },
    { value: AppointmentTime.AT_20_30_21_00, label: '20:30 - 21:00' },
    { value: AppointmentTime.AT_21_00_21_30, label: '21:00 - 21:30' },
    { value: AppointmentTime.AT_21_30_22_00, label: '21:30 - 22:00' },
    { value: AppointmentTime.AT_22_00_22_30, label: '22:00 - 22:30' },
    { value: AppointmentTime.AT_22_30_23_00, label: '22:30 - 23:00' },
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
