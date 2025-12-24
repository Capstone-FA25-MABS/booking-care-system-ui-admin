// src/pages/hospitals/Discounts/components/DiscountStatistics.tsx
import React from 'react';
import styles from '../HospitalDiscountManagement.module.scss';

interface DiscountStatisticsProps {
    statistics: {
        total: number;
        active: number;
        expired: number;
        totalUsage: number;
    };
}

const DiscountStatistics: React.FC<DiscountStatisticsProps> = ({ statistics }) => {
    return (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#eff6ff' }}>
                    <i className="ti ti-ticket" style={{ color: '#3b82f6' }}></i>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statLabel}>Tổng Mã Giảm Giá</div>
                    <div className={styles.statValue}>{statistics.total}</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#d1fae5' }}>
                    <i className="ti ti-circle-check" style={{ color: '#059669' }}></i>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statLabel}>Đang Hoạt Động</div>
                    <div className={styles.statValue}>{statistics.active}</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#fee2e2' }}>
                    <i className="ti ti-circle-x" style={{ color: '#dc2626' }}></i>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statLabel}>Hết Hạn</div>
                    <div className={styles.statValue}>{statistics.expired}</div>
                </div>
            </div>

            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#fef3c7' }}>
                    <i className="ti ti-chart-line" style={{ color: '#d97706' }}></i>
                </div>
                <div className={styles.statContent}>
                    <div className={styles.statLabel}>Lượt Sử Dụng</div>
                    <div className={styles.statValue}>{statistics.totalUsage}</div>
                </div>
            </div>
        </div>
    );
};

export default DiscountStatistics;
