import React from 'react';
import {
    DoctorScheduleDto,
    ServiceMedicalScheduleDto,
    SchedulePattern,
} from '@/types/schedule.types';
import styles from './ScheduleCalendar.module.scss';

interface ScheduleCalendarProps {
    schedules: (DoctorScheduleDto | ServiceMedicalScheduleDto)[];
    startDate: Date;
    endDate: Date;
    onDateClick?: (date: Date) => void;
}

const PATTERN_LABELS = {
    [SchedulePattern.MORNING]: 'Sáng',
    [SchedulePattern.AFTERNOON]: 'Chiều',
    [SchedulePattern.EVENING]: 'Tối',
    [SchedulePattern.NIGHT]: 'Đêm',
};

const PATTERN_COLORS = {
    [SchedulePattern.MORNING]: '#fff3cd',
    [SchedulePattern.AFTERNOON]: '#cfe2ff',
    [SchedulePattern.EVENING]: '#e2d9f3',
    [SchedulePattern.NIGHT]: '#d1e7dd',
};

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
    schedules,
    startDate,
    endDate,
    onDateClick,
}) => {
    const getScheduleForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter((s) => s.scheduleDate.startsWith(dateStr));
    };

    const generateCalendarDays = () => {
        const days: Date[] = [];
        const current = new Date(startDate);

        while (current <= endDate) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        return days;
    };

    const calendarDays = generateCalendarDays();
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    return (
        <div className={styles.scheduleCalendar}>
            <div className={styles.calendarHeader}>
                <div className={styles.dateRange}>
                    <i className="ti ti-calendar me-2"></i>
                    {startDate.toLocaleDateString('vi-VN')} - {endDate.toLocaleDateString('vi-VN')}
                </div>
                <div className={styles.legend}>
                    {Object.entries(PATTERN_LABELS).map(([pattern, label]) => (
                        <div key={pattern} className={styles.legendItem}>
                            <span
                                className={styles.legendColor}
                                style={{
                                    backgroundColor: PATTERN_COLORS[pattern as SchedulePattern],
                                }}
                            ></span>
                            <span className={styles.legendLabel}>{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.calendarGrid}>
                {/* Week day headers */}
                {weekDays.map((day) => (
                    <div key={day} className={styles.weekDayHeader}>
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((date) => {
                    const daySchedules = getScheduleForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const isPast = date < new Date() && !isToday;

                    return (
                        <div
                            key={date.toISOString()}
                            className={`${styles.calendarDay} ${
                                isToday ? styles.today : ''
                            } ${isPast ? styles.past : ''} ${
                                daySchedules.length > 0 ? styles.hasSchedule : ''
                            }`}
                            onClick={() => onDateClick?.(date)}
                        >
                            <div className={styles.dayNumber}>{date.getDate()}</div>
                            <div className={styles.scheduleIndicators}>
                                {daySchedules.map((schedule, idx) =>
                                    schedule.schedulePatterns.map((pattern, pIdx) => (
                                        <div
                                            key={`${idx}-${pIdx}`}
                                            className={styles.indicator}
                                            style={{
                                                backgroundColor: PATTERN_COLORS[pattern],
                                            }}
                                            title={PATTERN_LABELS[pattern]}
                                        >
                                            {PATTERN_LABELS[pattern]}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ScheduleCalendar;
