import React from 'react';
import { RescheduleInsight } from '@/services/aiService';

interface DeepAnalyticsSectionProps {
    rescheduleInsight?: RescheduleInsight;
    styles: any; // Dashboard styles
}

const DeepAnalyticsSection: React.FC<DeepAnalyticsSectionProps> = ({
    rescheduleInsight,
    styles,
}) => {
    if (!rescheduleInsight || rescheduleInsight.totalRescheduled === 0) {
        return null;
    }

    return (
        <div className={styles.aiInsightsRow}>
            {/* Reschedule Insight */}
            <div className={styles.trendCard}>
                <div className={styles.cardHeader}>
                    <h5>
                        <i className="ti ti-calendar-event me-2"></i>
                        Xu hướng lịch hẹn
                    </h5>
                    <span>Số liệu theo: Theo tuần</span>
                </div>
                <div className={styles.cardBody}>
                    <div className={styles.alertsGrid}>
                        <div className={`${styles.alertCard} ${styles.alertInfo}`}>
                            <div className={styles.alertHeader}>
                                <div className={styles.alertIcon}>
                                    <i className="ti ti-calendar-stats"></i>
                                </div>
                                <div className={styles.alertTitleSection}>
                                    <h6 className={styles.alertTitle}>Tổng quan dời lịch</h6>
                                    <span className={styles.alertMetric}>Thống kê tổng hợp</span>
                                </div>
                            </div>
                            <div className={styles.alertValues}>
                                <span>
                                    Tổng lịch dời:{' '}
                                    <strong style={{ color: '#3b82f6', fontWeight: 700 }}>
                                        {rescheduleInsight.totalRescheduled}
                                    </strong>
                                </span>
                                <span>
                                    Tỷ lệ dời:{' '}
                                    <strong style={{ color: '#f59e0b', fontWeight: 700 }}>
                                        {rescheduleInsight.rescheduleRate.toFixed(1)}%
                                    </strong>
                                </span>
                                <span>
                                    Hoàn thành sau dời:{' '}
                                    <strong style={{ color: '#10b981', fontWeight: 700 }}>
                                        {rescheduleInsight.rescheduledAndCompleted}
                                    </strong>
                                </span>
                                <span>
                                    Hủy sau dời:{' '}
                                    <strong style={{ color: '#ef4444', fontWeight: 700 }}>
                                        {rescheduleInsight.rescheduledAndCancelled}
                                    </strong>
                                </span>
                                <span>
                                    Tỷ lệ hoàn thành:{' '}
                                    <strong style={{ color: '#10b981', fontWeight: 700 }}>
                                        {rescheduleInsight.rescheduledCompletionRate.toFixed(1)}%
                                    </strong>
                                </span>
                            </div>
                        </div>

                        {rescheduleInsight.patterns &&
                            rescheduleInsight.patterns.length > 0 &&
                            rescheduleInsight.patterns.map((pattern, index) => (
                                <div
                                    key={index}
                                    className={`${styles.alertCard} ${styles.alertWarning}`}
                                >
                                    <div className={styles.alertHeader}>
                                        <div className={styles.alertIcon}>
                                            <i className="ti ti-chart-line"></i>
                                        </div>
                                        <div className={styles.alertTitleSection}>
                                            <h6 className={styles.alertTitle}>
                                                {pattern.patternValue}
                                            </h6>
                                            <span className={styles.alertMetric}>
                                                {pattern.patternType === 'by_doctor'
                                                    ? 'Theo bác sĩ'
                                                    : pattern.patternType === 'by_specialty'
                                                      ? 'Theo chuyên khoa'
                                                      : 'Theo thời gian'}
                                            </span>
                                        </div>
                                        <span className={styles.alertBadge} data-severity="medium">
                                            {pattern.rescheduleRate.toFixed(1)}%
                                        </span>
                                    </div>
                                    <p className={styles.alertMessage}>
                                        Số lượt dời lịch:{' '}
                                        <strong style={{ color: '#f59e0b', fontWeight: 700 }}>
                                            {pattern.rescheduleCount}
                                        </strong>
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeepAnalyticsSection;
